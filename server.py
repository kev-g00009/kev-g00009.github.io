# from flask import Flask, request, jsonify, send_from_directory
# from flask_uploads import UploadSet, configure_uploads, IMAGES

# app = Flask(__name__)

# # Configuration for the uploaded images
# app.config['UPLOADED_IMAGES_DEST'] = 'uploads'
# images = UploadSet('images', IMAGES)
# configure_uploads(app, images)

# @app.route('/upload', methods=['POST'])
# def upload_image():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No image provided'}), 400

#     image = request.files['image']
#     filename = images.save(image)
#     url = f"/images/{filename}"
#     return jsonify({'url': url})

# @app.route('/images/<filename>')
# def serve_image(filename):
#     return send_from_directory(app.config['UPLOADED_IMAGES_DEST'], filename)

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=8000)  # the server will listen for requests on port 8000

# # from flask import Flask, request, send_from_directory, jsonify
# # import os
# # import uuid

# # app = Flask(__name__)

# # # Create a directory for storing the uploaded images if it doesn't exist
# # IMAGE_UPLOAD_FOLDER = "/mnt/data/images"
# # if not os.path.exists(IMAGE_UPLOAD_FOLDER):
# #     os.makedirs(IMAGE_UPLOAD_FOLDER)

# # @app.route('/upload_image', methods=['POST'])
# # def upload_image():
# #     if 'file' not in request.files:
# #         return jsonify({'error': 'No file part'}), 400
# #     file = request.files['file']
    
# #     if file.filename == '':
# #         return jsonify({'error': 'No selected file'}), 400
        
# #     # Generate a unique filename using uuid
# #     filename = str(uuid.uuid4()) + ".jpg"
# #     filepath = os.path.join(IMAGE_UPLOAD_FOLDER, filename)
# #     file.save(filepath)
    
# #     # Return the URL to the stored image
# #     return jsonify({'image_url': f"/get_image/{filename}"}), 200

# # @app.route('/get_image/<filename>', methods=['GET'])
# # def serve_image(filename):
# #     return send_from_directory(IMAGE_UPLOAD_FOLDER, filename)

# # # Just a placeholder for testing
# # @app.route('/', methods=['GET'])
# # def index():
# #     return "Flask server is running!"

# # # We'll run this server later when we're ready to test everything together.

# from flask import Flask, request, jsonify, send_from_directory
# from flask_uploads import UploadSet, configure_uploads, IMAGES
# import os

# app = Flask(__name__)

# # Configuration for the uploaded images
# app.config['UPLOADED_IMAGES_DEST'] = '/mnt/data/uploads'
# images = UploadSet('images', IMAGES)
# configure_uploads(app, images)

# @app.route('/upload', methods=['POST'])
# def upload_image():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No image provided'}), 400

#     image = request.files['image']
#     filename = images.save(image)
#     url = f"/images/{filename}"
#     return jsonify({'url': url})

# @app.route('/images/<filename>')
# def serve_image(filename):
#     return send_from_directory(app.config['UPLOADED_IMAGES_DEST'], filename)

# if __name__ == '__main__':
#     if not os.path.exists('/mnt/data/uploads'):
#         os.makedirs('/mnt/data/uploads')
#     app.run(host='0.0.0.0', port=8000)

from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)

UPLOAD_FOLDER = '/mnt/data/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if image and allowed_file(image.filename):
        filename = secure_filename(image.filename)
        image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        url = f"/images/{filename}"
        return jsonify({'url': url})

@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(host='0.0.0.0', port=8000)