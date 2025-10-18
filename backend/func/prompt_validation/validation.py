import os
import logging
from openai import OpenAI

def validate_input(user_input: str) -> dict:
    """
    Validate user input using OpenAI to filter inappropriate content.
    
    Args:
        user_input: Combined user input string
        
    Returns:
        dict: {"status": "approved"} or {"status": "rejected", "reason": "..."}
    """
    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv("OPENAI_TOKEN"))
        
        validation_prompt = """You are a content filter for a couple photo generator.
The user will provide descriptions of clothes, location, and activity.
Reject if the input contains:
- Sexual or pornographic content
- Names of people or celebrities
- Negative actions or emotions such as crying, fighting between the couple, arguing, breaking up, sad themes

Otherwise, approve.
Please don't reject unrealistic prompts. This generator is for people to create without limit. In principal, we should receive everything except for the three reasons above.

Respond only with:
APPROVED
or
REJECTED: <reason>"""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": validation_prompt},
                {"role": "user", "content": user_input}
            ],
            max_tokens=100,
            temperature=0
        )
        
        result = response.choices[0].message.content.strip()
        
        if result.startswith("APPROVED"):
            return {"status": "approved"}
        else:
            # Extract reason from "REJECTED: <reason>"
            reason = result.replace("REJECTED:", "").strip()
            if not reason:
                reason = "Inappropriate content detected"
            logging.info(f"Inputs rejected because {reason}")
            return {"status": "rejected", "reason": reason}
            
    except Exception as e:
        logging.error(f"Error in validation: {str(e)}")
        return {"status": "error", "message": "Validation service temporarily unavailable"}
