document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('message-form');
    const chatContainer = document.getElementById('chat-container');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const message = document.getElementById('message').value;

        // Display user's message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message message-personal';
        userMessageDiv.textContent = message;
        chatContainer.appendChild(userMessageDiv);

        const url = "/get_explanation";
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // CSRF token for Django backend
        };

        const data = {
            "model": "Vision",
            "tools": ["Brush"],
            "messages": [
                {
                    "role": "system",
                    "type": "text",
                    "content": "You are an educational assistant designed to help students and professionals with their learning needs. Your responses should be informative, clear, and engaging, tailored to the user's level of understanding. Provide concise and relevant explanations, examples, and resources where appropriate. Aim to make learning enjoyable and accessible."
                },
                {
                    "role": "user",
                    "type": "text",
                    "content": message
                }
            ]
        };

        console.log("Sending data:", JSON.stringify(data)); // Log the payload

        fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Received response:", data);
            if (data.Response && data.Response.length > 0) {
                const responseContent = data.Response[0].content;

                // Display assistant's response
                const assistantResponseDiv = document.createElement('div');
                assistantResponseDiv.className = 'message';
                assistantResponseDiv.innerHTML = marked.parse(responseContent); // Assuming you have marked.js for markdown parsing
                chatContainer.appendChild(assistantResponseDiv);
            } else {
                const noResponseDiv = document.createElement('div');
                noResponseDiv.className = 'message';
                noResponseDiv.textContent = 'No explanation found.';
                chatContainer.appendChild(noResponseDiv);
            }

            // Scroll to the bottom of the chat container
            chatContainer.scrollTop = chatContainer.scrollHeight;
        })
        .catch(error => {
            console.error('Error during fetch:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message';
            errorDiv.textContent = 'An error occurred while fetching the explanation.';
            chatContainer.appendChild(errorDiv);
        });

        // Clear the input field after submission
        form.reset();
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});