       // Define the API 
const api_key = 'API_KEY'; // Replace with your actual API key
const chatMessages = [];
let ws; 


function connectWebSocket(port) {
if (ws) {
ws.close(); // Κλείσιμο της προηγούμενης σύνδεσης αν υπάρχει
}

ws = new WebSocket(`ws://localhost:${port}`);

ws.onopen = () => {
console.log('WebSocket connection established');
};

ws.onmessage = (event) => {
const data = JSON.parse(event.data);
if (data.transcript) {
    document.getElementById('voiceText').value = data.transcript;
} else if (data.error) {
    console.error('Error:', data.error);
}
};

ws.onerror = (error) => {
console.error('WebSocket error:', error);
};

ws.onclose = () => {
console.log('WebSocket connection closed');
};
}

// Αρχική σύνδεση με την θύρα 8080
connectWebSocket(8080);
document.getElementById('actionSelector').addEventListener('change', (event) => {
const value = event.target.value;

if (value === 'sendQuestion') {
connectWebSocket(8081); // Συνδέσου στη θύρα 8081 για ερωτήσεις
} else {
connectWebSocket(8080); // Επέστρεψε στη θύρα 8080 για άλλες ενέργειες
}
localStorage.setItem('selectedAction', value); // Αποθήκευση της επιλεγμένης ενέργειας
showSection(value); // Εμφάνιση της αντίστοιχης ενότητας
});


     // Retrieve the saved action from localStorage and set it
     const savedAction = localStorage.getItem('selectedAction') || 'text';
        document.getElementById('actionSelector').value = savedAction;
        showSection(savedAction);

        // Handling action selection
        document.getElementById('actionSelector').addEventListener('change', (event) => {
            const value = event.target.value;
            localStorage.setItem('selectedAction', value); // Save the selected action
            showSection(value);
        });

        function showSection(sectionId) {
    document.getElementById('textSection').style.display = sectionId === 'text' ? 'block' : 'none';
    document.getElementById('imageSection').style.display = sectionId === 'image' ? 'block' : 'none';
    document.getElementById('voiceSection').style.display = sectionId === 'voice' ? 'block' : 'none';
    document.getElementById('pdfSection').style.display = sectionId === 'pdf' ? 'block' : 'none';

    // Ensure that the question section is only shown if a PDF has been successfully uploaded
    document.getElementById('pdfQuestionSection').style.display = sectionId === 'pdf' ? 'block' : 'none';
}

 

        // Generate Text
        async function generateText() {
            const loader = document.getElementById("loader");
            const resultDiv = document.getElementById("textResult");
            const prompt = document.getElementById("prompt").value.trim();

            if (!prompt) {
                alert("Please enter a prompt.");
                return;
            }

            loader.style.display = "block";
            resultDiv.style.display = "none";
            chatMessages.push({ role: 'user', content: prompt });
            updateChatDisplay();

            try {
                const response = await fetch('http://localhost:4000/generate-text', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${api_key}`
                    },
                    body: JSON.stringify({ userInput: prompt })
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                resultDiv.innerHTML = data.choices[0].message.content;
                resultDiv.style.display = "block";
                chatMessages.push(data.choices[0].message);
                updateChatDisplay();
            } catch (error) {
                console.error("Error during generation:", error.message);
                resultDiv.innerText = "Error during generation. Please try again.";
                resultDiv.style.display = "block";
            } finally {
                loader.style.display = "none";
            }
        }

  // Function to update the chat display
  function updateChatDisplay() {
            const chatContainer = document.getElementById("chatContainer");
            chatContainer.innerHTML = '';
            chatMessages.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${message.role === 'user' ? 'userMessage' : 'botMessage'}`;
                messageDiv.innerText = message.content;
                chatContainer.appendChild(messageDiv);
            });
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // Generate Image
        async function generateImage() {
            const imagePrompt = document.getElementById("imagePrompt").value.trim();

            if (!imagePrompt) {
                alert("Please enter a prompt for the image.");
                return;
            }

            const imageContainer = document.getElementById("imageContainer");
            imageContainer.innerHTML = ""; // Clear previous image
            const loader = document.getElementById("loader");
            loader.style.display = "block";

            try {
                const response = await fetch('http://localhost:4000/generate-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${api_key}`
                    },
                    body: JSON.stringify({ prompt: imagePrompt })
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.url) {
                    const img = document.createElement('img');
                    img.src = data.url;
                    imageContainer.appendChild(img);
                } else {
                    imageContainer.innerText = "No image generated.";
                }
            } catch (error) {
                console.error("Error during image generation:", error.message);
                imageContainer.innerText = "Error during image generation. Please try again.";
            } finally {
                loader.style.display = "none";
            }
        }

        let mediaRecorder;
        let audioChunks = [];

        // Start Voice Recognition
        async function startRecording() {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    ws.send(event.data);
                }
            };

            mediaRecorder.start();
            document.getElementById('startVoiceBtn').innerText = "Recording...";
            document.getElementById('startVoiceBtn').disabled = true;

            mediaRecorder.onstop = () => {
                document.getElementById('startVoiceBtn').innerText = "Start Voice Recognition";
                document.getElementById('startVoiceBtn').disabled = false;
            };

            // Stop recording after 10 seconds for demo purposes
            setTimeout(() => mediaRecorder.stop(), 10000);
        }

        document.getElementById('generateTextBtn').addEventListener('click', generateText);
        document.getElementById('generateImageBtn').addEventListener('click', generateImage);
        document.getElementById('startVoiceBtn').addEventListener('click', startRecording);

   
     // Handling PDF Upload
     document.getElementById('uploadPdfBtn').addEventListener('click', async () => {
            const fileInput = document.getElementById('pdfInput');
            const file = fileInput.files[0];

            if (!file) {
                alert("Please select a PDF file.");
                return;
            }
       
            const formData = new FormData();
            formData.append('pdf', file);

            const loader = document.getElementById("loader");
            const pdfResult = document.getElementById("pdfResult");
            const pdfViewer = document.getElementById("pdfViewer");

            pdfResult.innerHTML = "";
            loader.style.display = "block";


            try {
                // Create a URL for the selected PDF file
                const pdfUrl = URL.createObjectURL(file);
                pdfViewer.src = pdfUrl; // Set the iframe source to the PDF URL
                pdfViewer.style.display = 'block'; // Show the iframe

                // Optional: If you want to display some text content of the PDF
                const response = await fetch('http://localhost:4000/upload-pdf', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                document.getElementById('context').value = data.content;

                // Show PDF Question Section if PDF was successfully uploaded
                document.getElementById('pdfQuestionSection').style.display = 'block';
                document.getElementById('actionSelector').value = 'pdf';
                showSection('pdf');
            } catch (error) {
                console.error("Error during PDF upload:", error.message);
                pdfResult.innerText = "Error during PDF upload. Please try again.";
            } finally {
                loader.style.display = "none";
            }
        });


        async function extractTextFromPDF(file) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            let text = '';

            for (const page of pages) {
                const { textContent } = await page.getTextContent();
                text += textContent.items.map(item => item.str).join(' ') + '\n';
            }

            return text;
        }
        
        
    async function displayExtracted(pdfFile) {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    Array.from(files).forEach((file, index) => {
        formData.append(`pdf${index}`, file);
    });

    const filePath = req.file.path;
        const response = await fetch('http://localhost:4000/upload-pdf', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        document.getElementById('context').value = data.content;
        document.getElementById('uploadPdfBtn').addEventListener('click', () => {
            const fileInput = document.getElementById('pdfInput');
            const files = fileInput.files;

            if (files.length === 0) {
                alert('Please select a PDF file.');
                return;
            }
            displayExtracted(files);
});
    }
       

// Event listener for PDF upload button
document.getElementById('uploadPdfBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('pdfInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a PDF file.');
        return;
    }

    displayExtracted(file);
});


        
    async function askQuestion() {
    const questionElement = document.getElementById('question');
    const contextElement = document.getElementById('context');
    
    if (!questionElement || !contextElement) {
        console.error('Question or context element is missing.');
        return;
    }

    const question = questionElement.value.trim();
    const context = contextElement.value.trim();

    if (!question || !context) {
        alert('Both question and context are required.');
        return;
    }

    const responseContainer = document.getElementById('responseContainer');
    const loader = document.getElementById('loader');
    responseContainer.innerHTML = ''; // Clear previous response
    loader.style.display = 'block';

    try {
        const response = await fetch('http://localhost:4000/ask-question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question, context })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        responseContainer.innerText = data.answer || 'No answer received.';
    } catch (error) {
        console.error('Error during question asking:', error.message);
        responseContainer.innerText = 'Error during question asking. Please try again.';
    } finally {
        loader.style.display = 'none';
    }
}

document.getElementById('askQuestionBtn').addEventListener('click', askQuestion);