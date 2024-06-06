document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const userMessage = userInput.value; 
            sendMessage(userMessage);
            displayMessage('Usuario', userMessage);
            userInput.value = '';
        }
    });

    // Inicializar la cámara y la detección de personas
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch((err) => {
            console.error("Error al acceder a la cámara: ", err);
        });

    ml5.objectDetector('cocossd', modelReady);

    function modelReady() {
        console.log('Modelo cargado');
        detect();
    }

    function detect() {
        ml5.objectDetector('cocossd').detect(video, (err, results) => {
            if (err) {
                console.error(err);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            results.forEach((result) => {
                if (result.label === 'person') {
                    ctx.strokeStyle = '#00FF00';
                    ctx.lineWidth = 4;
                    ctx.strokeRect(result.x, result.y, result.width, result.height);
                    ctx.font = '16px Arial';
                    ctx.fillStyle = '#00FF00';
                    ctx.fillText(`${result.label} (${Math.round(result.confidence * 100)}%)`, result.x, result.y > 10 ? result.y - 5 : 10);
                }
            });
            requestAnimationFrame(detect);
        });
    }
});

function sendMessage(inputText) {
    const postData = {
        model: "TheBloke/CodeLlama-7B-Instruct-GGUF/codellama-7b-instruct.Q4_K_S.gguf",
        messages: [
            { role: "system", content: "Como médico experto, tu deber es resolver todas las dudas que tenga el paciente. Por favor, responde siempre en español. Solo responde preguntas que tengan que ver con medicina" },
            { role: "user", content: inputText }
        ],
        temperature: 0.7,
        max_tokens: -1,
        stream: false
    };

    const jsonData = JSON.stringify(postData);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3003/v1/chat/completions', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.choices && response.choices[0] && response.choices[0].message) {
                const respuesta = response.choices[0].message.content.trim();
                document.getElementById("chat-container").innerText = respuesta;
            } else {
                console.error("No se encontró texto en la respuesta.");
            }
        } else {
            console.error("Error al enviar el post:", xhr.statusText);
        }
    };

    xhr.send(jsonData);
}

function displayMessage(sender, message) {
    const chatContainer = document.getElementById('chat-container');
    const formattedMessage = `<p><strong>${sender}:</strong> ${message}</p>`;
    chatContainer.innerHTML += formattedMessage;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
