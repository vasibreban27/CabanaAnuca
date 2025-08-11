document.addEventListener("DOMContentLoaded", function() {
    console.log("Chatbot script loaded"); 

    const form = document.getElementById("chat-form");
    const input = document.getElementById("chat-input");
    const body = document.getElementById("chat-body");
    const toggleBtn = document.getElementById("chatbot-toggle");
    const container = document.getElementById("chatbot-container");
    const closeBtn = document.getElementById("chat-close-btn");


    if (!toggleBtn || !container) {
        console.error("Elementele importante nu au fost găsite!");
        return;
    }

    function toggleChat() {
        console.log("Toggle button clicked");
        const isVisible = container.style.display === 'block';
        container.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            input.focus();
        }
    }

    toggleBtn.addEventListener("click", function(e) {
        e.preventDefault();
        toggleChat();
    });

    closeBtn.addEventListener("click", function(e) {
        e.preventDefault();
        container.style.display = 'none';
    });


    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        appendMessage("Tu", message, "user-msg");
        input.value = "";

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) throw new Error("Eroare la server");

            const reply = await response.text();
            appendMessage("Asistent", reply, "bot-msg");
        } catch (error) {
            console.error("Eroare:", error);
            appendMessage("Asistent", "Am întâmpinat o eroare. Încearcă din nou.", "bot-msg");
        }
    });


    function appendMessage(sender, text, className) {
        const p = document.createElement("p");
        p.className = className;
        p.innerHTML = `<strong>${sender}:</strong> ${text}`;
        body.appendChild(p);
        body.scrollTop = body.scrollHeight;
    }
});