document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const userMessage = userInput.value; sendMessage(userMessage)
           // const response = await sendMessage(userMessage);
            displayMessage('Usuario', userMessage);
            //displayMessage('SaludBot', response);
            userInput.value = '';
        }
    });
});

function sendMessage(inputText) {
    const postData = {
        model: "TheBloke/CodeLlama-7B-Instruct-GGUF/codellama-7b-instruct.Q4_K_S.gguf",
        messages: [
            { role: "system", content: "Como médico experto, tu deber es resolver todas las dudas que tenga el paciente. Por favor, responde siempre en español. Solo responde preguntas que tengan que ver con medicina"},
            { role: "user", content: inputText }
        ],
        temperature: 0.7,
        max_tokens: -1,
        stream: false
    };


    const jsonData = JSON.stringify(postData);
    
    //alert(jsonData)
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3003/v1/chat/completions', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function () {
        console.log(xhr.responseText);
               
        if (xhr.status === 200) {
            // Manejar la respuesta del servidor
           
            const response = JSON.parse(xhr.responseText);
     
            // Verificar si response.choices[0] y response.choices[0].message existen
            if (response.choices && response.choices[0] && response.choices[0].message) {
                const respuesta = response.choices[0].message.content.trim();
                console.log("Respuesta del servidor:", respuesta);
              //displayLetterByLetter(respuesta); // Llamamos a la función para mostrar letra por letra              

                //alert("respuesta")
                // Actualizar el contenido del elemento con ID "caja-respuesta"
                document.getElementById("chat-container").innerText = respuesta;
            } else {
                console.error("No se encontró texto en la respuesta.");
            }
        } else {
            console.error("Error al enviar el post:", xhr.statusText);
        }
    };

    //alert(jsonData);
    xhr.send(jsonData);

}

/*function displayLetterByLetter(respuesta) {
    const chatContainer = document.getElementById("chat-container");
    let index = 0;
    const interval = setInterval(() => {
        chatContainer.innerText += " " + respuesta[index];
        index++;
        if (index === respuesta.length) {
            clearInterval(interval);
        }
    }, 100); // Puedes ajustar la velocidad de escritura cambiando este valor
}*/


function displayMessage(sender, message) {
    const chatContainer = document.getElementById('chat-container');
    const formattedMessage = `<p><strong>${sender}:</strong> ${message}</p>`;
    chatContainer.innerHTML += formattedMessage;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
/*
    const url = "http://localhost:3003/v1/chat/completions";
    alert(JSON.stringify(data));
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
}

*/
