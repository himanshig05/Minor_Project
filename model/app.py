import os
import json
import requests
from flask_cors import CORS
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

# --- Configuration ---

# 1. This is the new, correct API endpoint
API_URL = "https://router.huggingface.co/hf-inference/models/dima806/deepfake_vs_real_image_detection"

# This MUST match the name of your environment variable
HF_TOKEN = os.getenv("HF_API_TOKEN") 

UPLOAD_FOLDER = 'temp_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- API Query Function (Updated) ---
def query_hf_api(filename, content_type):
    """
    Sends a file (by its path) to the HF Inference API.
    """
    if not HF_TOKEN:
        print("--- ERROR: HF_API_TOKEN environment variable not set. ---")
        return None
        
    # 2. Add User-Agent header to avoid WAF blocks
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "Content-Type": content_type
    }

    with open(filename, "rb") as f:
        response = requests.post(API_URL, headers=headers, data=f)
    
    if response.status_code == 200:
        return response.json()
    else:
        # Log the error for debugging
        print(f"HF API Error: {response.status_code}")
        print(response.text) 
        if response.status_code == 503:
            print("Model is loading, try again in 30-60 seconds.")
        return None

# --- Your Backend API Endpoint ---
@app.route('/check-image', methods=['POST'])
def check_image_endpoint():
    """
    This is the endpoint your frontend will call.
    """
    
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    image_content_type = file.content_type

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        try:
            file.save(temp_path)
            
            print(f"File saved to {temp_path}. Querying Hugging Face...")
            predictions = query_hf_api(temp_path, image_content_type)
            
            if predictions:
                # Send the successful result back
                return jsonify(predictions)
            else:
                return jsonify({"error": "Failed to get predictions from API"}), 502
        
        except Exception as e:
            return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500
        
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

# --- Run the Flask App ---
if __name__ == '__main__':
    # 3. This will confirm your token is loaded on startup
    print(f"--- Server starting... HF_API_TOKEN loaded: {bool(HF_TOKEN)} ---")
    app.run(debug=True, port=5001)