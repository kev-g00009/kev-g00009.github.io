from flask import Flask, request, send_from_directory, jsonify
import os
import uuid

app = Flask(__name__)

# Directory to store uploaded images
IMAGE_DIRECTORY = "/mnt/data/images"
if not os.path.exists(IMAGE_DIRECTORY):
    os.makedirs(IMAGE_DIRECTORY)

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        filename = str(uuid.uuid4()) + ".png"
        file_path = os.path.join(IMAGE_DIRECTORY, filename)
        file.save(file_path)
        return jsonify({"url": f"/images/{filename}"})

@app.route('/images/<filename>', methods=['GET'])
def serve_image(filename):
    return send_from_directory(IMAGE_DIRECTORY, filename)

# This is a placeholder for running the server.
server_output = "Server setup complete."