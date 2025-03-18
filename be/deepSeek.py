from flask import Flask, request, jsonify
from ollama import chat
from ollama import ChatResponse

app = Flask(__name__)

@app.route('/prompt', methods=['POST'])
def prompt():
    user_message = request.json.get('message', '')
    
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    response: ChatResponse = chat(model='deepseek-r1', messages=[
        {
            'role': 'user',
            'content': user_message,
        },
    ])
    
    return jsonify({
        'response': response.message.content
    })

if __name__ == '__main__':
    app.run(debug=True)
