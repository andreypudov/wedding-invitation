import azure.functions as func
import json
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import image generation function from local module
from .image_generation import generate_couple_photo

def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Endpoint to generate couple photo with face swapping.
    Full workflow: validation → generic image → face detection → splitting → face swap → recombine
    """
    logging.info('Generate endpoint triggered.')
    
    try:
        # Get JSON body
        req_body = req.get_json()
        if not req_body:
            return func.HttpResponse(
                json.dumps({"status": "error", "message": "No JSON body provided"}),
                status_code=400,
                mimetype="application/json"
            )
        
        # Extract parameters
        bride_clothes = req_body.get("bride_clothes", "")
        groom_clothes = req_body.get("groom_clothes", "")
        location = req_body.get("location", "")
        action = req_body.get("action", "")
        
        if not all([bride_clothes, groom_clothes, location, action]):
            return func.HttpResponse(
                json.dumps({"status": "error", "message": "Missing required parameters"}),
                status_code=400,
                mimetype="application/json"
            )
        
        # Generate couple photo
        result = generate_couple_photo(bride_clothes, groom_clothes, location, action)
        
        return func.HttpResponse(
            json.dumps(result),
            mimetype="application/json"
        )
        
    except Exception as e:
        logging.error(f"Error in generation: {str(e)}")
        return func.HttpResponse(
            json.dumps({"status": "error", "message": "Internal server error"}),
            status_code=500,
            mimetype="application/json"
        )
