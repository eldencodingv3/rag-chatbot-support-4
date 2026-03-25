const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const messagesContainer = document.getElementById("messages");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, type, sources) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", type === "user" ? "user-message" : "bot-message");

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");
  bubble.textContent = text;

  // Add sources if available
  if (sources && sources.length > 0) {
    const sourcesDiv = document.createElement("details");
    sourcesDiv.classList.add("sources");

    const summary = document.createElement("summary");
    summary.textContent = "Sources (" + sources.length + ")";
    sourcesDiv.appendChild(summary);

    const list = document.createElement("ul");
    sources.forEach(function (s) {
      const li = document.createElement("li");
      li.textContent = s.question;
      list.appendChild(li);
    });
    sourcesDiv.appendChild(list);

    bubble.appendChild(sourcesDiv);
  }

  messageDiv.appendChild(bubble);
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showLoading() {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", "bot-message");
  messageDiv.id = "loading-message";

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");

  const dots = document.createElement("div");
  dots.classList.add("loading-dots");
  dots.innerHTML = "<span></span><span></span><span></span>";

  bubble.appendChild(dots);
  messageDiv.appendChild(bubble);
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeLoading() {
  const loading = document.getElementById("loading-message");
  if (loading) loading.remove();
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";
  sendBtn.disabled = true;
  showLoading();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message }),
    });

    const data = await res.json();

    removeLoading();

    if (res.ok) {
      addMessage(data.reply, "bot", data.sources);
    } else {
      addMessage(data.error || "Something went wrong. Please try again.", "bot");
    }
  } catch (err) {
    removeLoading();
    addMessage("Network error. Please check your connection and try again.", "bot");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});
