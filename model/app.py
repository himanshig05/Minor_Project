import os
import io
from flask import Flask, request, jsonify
from PIL import Image
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Hugging Face API token
HF_TOKEN = os.getenv("HF_API_TOKEN")
if not HF_TOKEN:
    raise ValueError("HF_API_TOKEN not found. Please set it in your .env file inside model/ folder.")

# Initialize Hugging Face client
client = InferenceClient(token=HF_TOKEN)
model_id = "prithivMLmods/deepfake-detector-model-v1"

@app.route('/')
def home():
    return jsonify({"message": "✅ Deepfake Detection API is running!"})

@app.route('/detect', methods=['POST'])
def detect_deepfake():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']

    try:
        # Convert uploaded image to PIL
        image = Image.open(io.BytesIO(image_file.read()))

        # Run inference on Hugging Face model
        result = client.image_classification(model=model_id, inputs=image)

        # Get best prediction
        prediction = result[0]["label"]
        confidence = round(result[0]["score"], 4)

        return jsonify({
            "prediction": prediction,
            "confidence": confidence,
            "full_result": result
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
