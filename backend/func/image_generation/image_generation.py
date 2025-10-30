import os
import logging
import requests
import replicate
from openai import OpenAI
import tempfile
import uuid
import random
import json
from datetime import datetime
from azure.storage.blob import BlobServiceClient
from PIL import Image

def generate_couple_photo(bride_clothes: str, groom_clothes: str, location: str, action: str) -> dict:
    """
    Generate a couple photo using seedream-4.
    Simplified workflow: refine prompt → generate image → upload to storage
    """
    max_retries = 3

    for attempt in range(max_retries):
        try:
            logging.info(f"Attempt {attempt + 1} of {max_retries}")

            # Step 1: Refine input using OpenAI
            refined_prompt, refined_prompt_short = refine_prompt(bride_clothes, groom_clothes, location, action)

            # Step 2: Generate image using seedream-4
            logging.info("Generating image with seedream-4")
            generic_image_url = generate_generic_image(refined_prompt)

            if not generic_image_url:
                return {"status": "error", "message": "Failed to generate image"}

            # Step 3: Download the generated image
            temp_image_path, width, height = download_image(generic_image_url)
            if not temp_image_path:
                return {"status": "error", "message": "Failed to download generated image"}

            # Step 4: Create and upload JSON with translations
            logging.info("Creating translations and JSON file")
            translations_data = create_translations_json(refined_prompt_short, width, height)

            # Step 5: Upload to Azure Blob Storage
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            unique_id = uuid.uuid4().hex[:8]

            output_filename = f"couple_photo_{timestamp}_{unique_id}.webp"
            json_filename = f"couple_photo_{timestamp}_{unique_id}.json"

            # Upload image
            blob_url = upload_to_azure_storage(output_filename, file_path=temp_image_path)

            if not blob_url:
                return {"status": "error", "message": "Failed to upload image to Azure Storage"}

            # Upload JSON file
            json_blob_url = upload_to_azure_storage(json_filename, json_data=translations_data)

            if not json_blob_url:
                logging.warning("Failed to upload JSON file, but image was uploaded successfully")

            logging.info("Image and JSON uploaded to Azure Storage successfully!")

            # Cleanup temp file
            os.remove(temp_image_path)

            return {
                "status": "success",
                "image_url": blob_url,
                "image_filename": output_filename,
                "json_url": json_blob_url,
                "json_filename": json_filename,
                "translations": translations_data,
                "message": "Couple photo and translations generated successfully"
            }

        except Exception as e:
            logging.error(f"Error in generate_couple_photo (attempt {attempt + 1}): {str(e)}")

            if attempt < max_retries - 1:
                logging.info(f"Retrying... ({attempt + 2}/{max_retries})")
                continue
            else:
                logging.error(f"All {max_retries} attempts failed")
                return {"status": "error", "message": f"Generation failed after {max_retries} attempts: {str(e)}"}


def refine_prompt(bride_clothes: str, groom_clothes: str, location: str, action: str) -> tuple[str, dict]:
    """Translate non-English text to English for prompt generation"""

    input_description = f"""The woman is wearing {bride_clothes}, and the man is wearing {groom_clothes}. They are at {location}. They are {action}."""
    translated_description = translate_text(input_description, "english")

    # Create final prompt using the template
    prompt = f"""Please make a high-quality photorealistic couple photo for the people in the uploaded images. 
The first image is the photo of the both people. 
The second to fifth images are the photos of the lady (asian) and the sixth to nineth images are the photos of the man (slavic). 
Please use these images as references if the first image doesn't provide enough information about how these people look like. 
Plaese restrictly generate the face exactly the same as the provided photo. The faces must be focused, detailed, realistic, and clear.
The woman is Taiwanese, has long black hair.
The man is Russian, has short brown hair, brown eyes. Please don't make him look like asian. He is white. """ + translated_description + """ Natural photography style, sharp details, soft natural light, realistic skin texture, elegant background blur.
There should be only two people in the image, no more."""

    return prompt, translated_description


def generate_generic_image(prompt: str) -> str:
    """Generate generic couple image using Replicate Seedream-4"""
    try:
        # Randomly select aspect ratio from the specified options
        aspect_ratios = ["1:1", "16:9", "9:16"]
        selected_aspect_ratio = random.choice(aspect_ratios)

        logging.info(f"Using aspect ratio: {selected_aspect_ratio}")

        # Prepare reference images for seedream-4
        # According to prompt template: first image = both people, 2-6 = lady, 7-10 = man
        file_handles = []
        for i in range(1, 10):  # 1.jpg - 9.jpg
            image_path = f"./image_generation/input_photos/{i}.jpg"

            # Check if file exists and add to input
            if os.path.exists(image_path):
                file_handle = open(image_path, "rb")
                file_handles.append(file_handle)

        if not file_handles:
            logging.error("No reference images found for seedream-4")
            return None

        try:
            output = replicate.run(
                "bytedance/seedream-4",
                input={
                    "prompt": prompt,
                    "aspect_ratio": selected_aspect_ratio,
                    "image_input": file_handles,
                    "size": "2K",
                    "width": 2048,
                    "height": 2048,
                    "max_images": 1,
                    "sequential_image_generation": "disabled"
                }
            )

            logging.info(f"Output from seedream-4: {output}")
            return str(output[0])

        finally:
            # Always close file handles
            for file_handle in file_handles:
                file_handle.close()

    except Exception as e:
        logging.error(f"Error generating image: {str(e)}")
        return None

def download_image(url: str) -> tuple[str, int, int]:
    """Download image from URL and convert to WebP format, return path and dimensions"""
    try:
        logging.info(f"Downloading image from replicate. Image url: {url}")
        response = requests.get(str(url), timeout=30)
        response.raise_for_status()

        # Create temp file for original image
        temp_jpg = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        temp_jpg.write(response.content)
        temp_jpg.close()

        # Convert to WebP format
        logging.info("Converting image to WebP format")
        temp_webp = tempfile.NamedTemporaryFile(delete=False, suffix='.webp')
        temp_webp.close()

        # Open with PIL and save as WebP, extract dimensions
        with Image.open(temp_jpg.name) as img:
            # Get image dimensions
            width, height = img.size
            logging.info(f"Image dimensions: {width}x{height}")

            # Convert to RGB if necessary (WebP doesn't support some modes)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')

            # Save as WebP with high quality
            img.save(temp_webp.name, 'WEBP', quality=75, optimize=True)

        # Clean up original JPEG temp file
        os.remove(temp_jpg.name)

        logging.info("Image successfully converted to WebP format")
        return temp_webp.name, width, height

    except Exception as e:
        logging.error(f"Error downloading and converting image: {str(e)}")
        return None, None, None


def upload_to_azure_storage(filename: str, file_path: str = None, json_data: dict = None) -> str:
    """
    Upload file or JSON data to Azure Blob Storage and return the blob URL

    Args:
        filename: Name for the blob in storage
        file_path: Path to file to upload (for files)
        json_data: Dictionary to upload as JSON (for JSON data)

    Either file_path or json_data must be provided, but not both.
    """
    try:
        if (file_path is None and json_data is None) or (file_path is not None and json_data is not None):
            raise ValueError("Either file_path or json_data must be provided, but not both")

        data_type = "file" if file_path else "JSON"
        logging.info(f"Uploading {data_type} to Azure storage")

        # Get Azure storage connection string from environment
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "wedding-photos")

        if not connection_string:
            raise Exception("AZURE_STORAGE_CONNECTION_STRING not found in environment variables")

        # Create blob service client
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)

        # Create container if it doesn't exist
        try:
            blob_service_client.create_container(container_name)
        except Exception:
            # Container might already exist, which is fine
            pass

        # Get blob client
        blob_client = blob_service_client.get_blob_client(
            container=container_name, 
            blob=filename
        )

        # Upload based on data type
        if file_path:
            # Upload file
            with open(file_path, "rb") as data:
                blob_client.upload_blob(data, overwrite=True)
        else:
            # Upload JSON data
            json_string = json.dumps(json_data, ensure_ascii=False, indent=2)
            blob_client.upload_blob(json_string.encode('utf-8'), overwrite=True)

        # Return the blob URL
        blob_url = blob_client.url
        logging.info(f"{data_type} uploaded to Azure Storage: {blob_url}")
        return blob_url

    except Exception as e:
        logging.error(f"Error uploading {data_type if 'data_type' in locals() else 'data'} to Azure Storage: {str(e)}")
        return None


def translate_text(text: str, target_language: str) -> str:
    """Translate text to target language using OpenAI"""
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_TOKEN"))

        if target_language.lower() == "english":
            system_prompt = "You are a professional translator. If the given text is not in English, translate it to English. If the text is already in English, return it unchanged. Return only the translated text, no additional formatting or explanation."
        elif target_language.lower() == "russian":
            system_prompt = "You are a professional translator. Translate the given text to Russian. Return only the translated text, no additional formatting or explanation. Please mix everything in one sentence with maximun 128 characters. You may drop some information if it is too long. Please change the subject, 'a woman', into Пэйпэй and 'a man' into Андрей"
        elif target_language.lower() == "mandarin":
            system_prompt = "You are a professional translator. Translate the given text to Traditional Chinese (Taiwan/Mandarin). Return only the translated text, no additional formatting or explanation. Please mix everything in one sentence with maximun 128 characters. You may drop some information if it is too long. Please change the subject, 'a woman', into 珮珮 and 'a man' into 安德烈"
        else:
            return text  # Return original if language not supported

        logging.info(f'Translating text to {target_language}: {text}')
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            max_tokens=300,
            temperature=0.1
        )

        return response.choices[0].message.content

    except Exception as e:
        logging.error(f"Error translating text to {target_language}: {str(e)}")
        return text  # Return original text if translation fails


def create_translations_json(english_sentence: str, width: int, height: int) -> dict:
    """Create JSON with complete sentence translations in Russian and Mandarin, including image dimensions"""

    logging.info("Generating sentence translations...")

    # Translate complete sentences to Russian and Mandarin
    russian_sentence = translate_text(english_sentence, "russian")
    mandarin_sentence = translate_text(english_sentence, "mandarin")

    # Create the new JSON structure as requested, including width and height
    translations_data = {
        "russian": russian_sentence,
        "mandarin": mandarin_sentence,
        "width": width,
        "height": height
    }
    logging.info(f'Translated with dimensions: {translations_data}')

    logging.info("Sentence translations generated successfully")
    return translations_data
