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
