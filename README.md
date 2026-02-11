# StudyBot-LearnAI

# AI StudyBot

**AI StudyBot** is a web application that allows users to:

- Generate text using AI  
- Generate images using AI  
- Convert voice to text  
- Upload PDFs and ask questions about their content  

This application is perfect for students who want to use AI to help with studying.

---

## Features

1. **Generate Text**  
   Enter a prompt and AI will generate text for you.

2. **Generate Image**  
   Describe an image and AI will create it for you.

3. **Voice-to-Text**  
   Speak into your microphone and see your words converted to text in real-time.

4. **Upload PDF & Ask Questions**  
   - Upload a PDF  
   - The system extracts the text  
   - Ask questions about the content and get AI-powered answers

---

## Technologies

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express  
- **WebSocket:** For live voice recognition and question-answering  
- **PDF Parsing:** `pdf-parse`  
- **File Uploads:** `multer`  
- **AI:** OpenAI API (`gpt-3.5-turbo` for text, Whisper for voice, Image Generation API for images)  

---

## Requirements

- Node.js v18+  
- NPM  
- OpenAI API Key  

---

## How to Run

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd <repository_folder>

2. Install dependencies:

npm install

3. Create a config.js file in the root folder with your API key:

module.exports = {
    api_key: "YOUR_OPENAI_API_KEY"
};

4. Start the server:

node server.js

5. Open your browser at:

http://localhost:4000
