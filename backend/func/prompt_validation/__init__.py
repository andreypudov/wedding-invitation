import azure.functions as func
import json
import logging
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import validation function from local module
from .validation import validate_input
from image_generation.image_generation import generate_couple_photo


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Endpoint to validate user input before image generation.
    Rejects inappropriate content using OpenAI.
    """
    logging.info('Validation endpoint triggered.')
    
    try:
        # Get JSON body
        req_body = req.get_json()
        if not req_body:
            return func.HttpResponse(
                json.dumps({"status": "error", "message": "No JSON body provided"}),
                status_code=400,
                mimetype="application/json"
            )
        
        # Extract input text (combine all user inputs)
        bride_clothes = req_body.get("bride_clothes", "")
        groom_clothes = req_body.get("groom_clothes", "")
        location = req_body.get("location", "")
        action = req_body.get("action", "")
        
        user_input = f"Bride clothes: {bride_clothes}. Groom clothes: {groom_clothes}. Location: {location}. Action: {action}."
        
        # Validate input
        result = validate_input(user_input)

        if result["status"] == "approved":
            
            # Generate couple photo
            image_generation_url = "https://imaginarium-peipeiandandrey.azurewebsites.net/api/image_generation"
            input_data = {
                "bride_clothes": bride_clothes,
                "groom_clothes": groom_clothes, 
                "location": location,
                "action": action
            }
            logging.info(f"Call generation endpoint with input data: {input_data}")
            headers_simple = {
                "Content-Type": "application/json"
            }
            try:
                requests.post(image_generation_url, json=input_data, headers=headers_simple, timeout=8)
            except requests.exceptions.RequestException:
                pass # ignore timeout
    
        return func.HttpResponse(
            json.dumps(result),
            mimetype="application/json"
            )
            
    except Exception as e:
        logging.error(f"Error in validation: {str(e)}")
        return func.HttpResponse(
            json.dumps({"status": "error", "message": "Internal server error"}),
            status_code=500,
            mimetype="application/json"
        )
