# from flask import Flask, request, jsonify

# app = Flask(__name__)

# @app.route('/check_passcode', methods=['POST'])
# def check_passcode():
#     data = request.get_json()
#     if data['passcode'] == 'mysecretpasscode':  # replace 'mysecretpasscode' with your actual passcode
#         return jsonify({'result': 'success'})
#     else:
#         return jsonify({'result': 'failure'}), 401

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=8000)  # the server will listen for requests on port 8000

from flask import Flask, request, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes and origins
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filename)
    return {"url": f"http://localhost:5000/{filename}"}

@app.route('/uploads/<filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def index():
    return 'Server is running!'


if __name__ == '__main__':
    app.run(debug=True)
