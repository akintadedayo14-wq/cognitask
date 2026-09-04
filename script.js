const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const generateButton = document.getElementById("generateButton");

const attachmentButton = document.getElementById("attachmentButton");
const attachmentMenu = document.getElementById("attachmentMenu");

const fileButton = document.getElementById("fileButton");
const imageButton = document.getElementById("imageButton");

const fileInput = document.getElementById("fileInput");
const imageInput = document.getElementById("imageInput");

const attachmentPreview = document.getElementById("attachmentPreview");
const errorMessage = document.getElementById("errorMessage");

const newChatButton = document.getElementById("newChatButton");
const menuButton = document.getElementById("menuButton");
const closeMenuButton = document.getElementById("closeMenuButton");
const sidebarNewChatButton = document.getElementById("sidebarNewChatButton");
const chatSidebar = document.getElementById("chatSidebar");
const chatHistory = document.getElementById("chatHistory");

const deleteDialog = document.getElementById("deleteDialog");
const cancelDeleteButton = document.getElementById("cancelDeleteButton");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");

const HISTORY_KEY = "aiTaskAssistantHistory";

let selectedFile = null;
let currentChatId = null;
let chatToDeleteId = null;


// Get saved conversations

function getHistory() {
    try {
        return JSON.parse(
            localStorage.getItem(HISTORY_KEY)
        ) || [];
    } catch (error) {
        return [];
    }
}


// Save conversations

function saveHistory(history) {
    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );
}


// Create a new chat

function startNewChat() {
    currentChatId = null;

    chatMessages.innerHTML = `
        <div class="welcome-message">
            <h2>What can I help you with?</h2>
            <p>Ask me anything and I'll help you get it done.</p>
        </div>
    `;

    messageInput.value = "";

    selectedFile = null;

    fileInput.value = "";
    imageInput.value = "";

    attachmentPreview.textContent = "";
    attachmentPreview.classList.add("hidden");

    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");

    attachmentMenu.classList.add("hidden");
    chatSidebar.classList.remove("open");

    messageInput.focus();
}


// New Chat buttons

newChatButton.addEventListener("click", startNewChat);

sidebarNewChatButton.addEventListener(
    "click",
    startNewChat
);


// Open sidebar

menuButton.addEventListener("click", () => {
    renderHistory();
    chatSidebar.classList.add("open");
});


// Close sidebar

closeMenuButton.addEventListener("click", () => {
    chatSidebar.classList.remove("open");
});


// Attachment menu

attachmentButton.addEventListener("click", (event) => {
    event.stopPropagation();

    attachmentMenu.classList.toggle("hidden");
});


// Upload file

fileButton.addEventListener("click", () => {
    fileInput.click();
    attachmentMenu.classList.add("hidden");
});


// File selected

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (!file) {
        return;
    }

    selectedFile = file;

    attachmentPreview.textContent = `📎 ${file.name}`;
    attachmentPreview.classList.remove("hidden");
});


// Upload image

imageButton.addEventListener("click", () => {
    imageInput.click();
    attachmentMenu.classList.add("hidden");
});


// Image selected

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    selectedFile = file;

    attachmentPreview.textContent = `🖼️ ${file.name}`;
    attachmentPreview.classList.remove("hidden");
});


// Close attachment menu

document.addEventListener("click", (event) => {
    if (
        !attachmentMenu.contains(event.target) &&
        !attachmentButton.contains(event.target)
    ) {
        attachmentMenu.classList.add("hidden");
    }
});


// Send message

generateButton.addEventListener(
    "click",
    sendMessage
);


// Enter sends message

messageInput.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            sendMessage();
        }
    }
);


async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message && !selectedFile) {
        return;
    }

    errorMessage.classList.add("hidden");

    const fileToSend = selectedFile;

    if (!currentChatId) {
        currentChatId = Date.now().toString();
    }

    if (message) {
        addMessage(message, "user");
    }

    if (fileToSend) {
        addMessage(
            `📎 ${fileToSend.name}`,
            "user"
        );
    }

    messageInput.value = "";

    selectedFile = null;

    fileInput.value = "";
    imageInput.value = "";

    attachmentPreview.textContent = "";
    attachmentPreview.classList.add("hidden");

    generateButton.disabled = true;

    const typingIndicator = addTypingIndicator();

    try {
        const formData = new FormData();

        formData.append(
            "message",
            message
        );

        if (fileToSend) {
            formData.append(
                "file",
                fileToSend
            );
        }

        const response = await fetch(
            "/api/chat",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        typingIndicator.remove();

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Unable to get a response."
            );
        }

        addMessage(
            data.reply,
            "assistant"
        );

        saveCurrentConversation();

        renderHistory();

    } catch (error) {
        console.error(error);

        typingIndicator.remove();

        errorMessage.textContent =
            error.message;

        errorMessage.classList.remove(
            "hidden"
        );

    } finally {
        generateButton.disabled = false;
        messageInput.focus();
    }
}


// Save current conversation

function saveCurrentConversation() {
    if (!currentChatId) {
        return;
    }

    const wrappers =
        chatMessages.querySelectorAll(
            ".message-wrapper"
        );

    const messages = [];

    wrappers.forEach((wrapper) => {
        const role =
            wrapper.classList.contains("user")
                ? "user"
                : "assistant";

        const message =
            wrapper.querySelector(".message");

        if (!message) {
            return;
        }

        messages.push({
            role: role,
            text: message.textContent
        });
    });

    if (messages.length === 0) {
        return;
    }

    const firstUserMessage =
        messages.find(
            (item) => item.role === "user"
        );

    let title =
        firstUserMessage?.text ||
        "New conversation";

    if (title.length > 45) {
        title =
            title.substring(0, 45) + "...";
    }

    const history = getHistory();

    const existingIndex =
        history.findIndex(
            (chat) =>
                chat.id === currentChatId
        );

    const conversation = {
        id: currentChatId,
        title: title,
        messages: messages
    };

    if (existingIndex >= 0) {
        history[existingIndex] =
            conversation;
    } else {
        history.unshift(
            conversation
        );
    }

    saveHistory(history);
}


// Display conversation history

function renderHistory() {
    const history = getHistory();

    chatHistory.innerHTML = "";

    history.forEach((chat) => {
        const item =
            document.createElement("div");

        item.className = "history-item";


        const titleButton =
            document.createElement("button");

        titleButton.className =
            "history-title-button";

        titleButton.type = "button";

        titleButton.textContent =
            chat.title;

        titleButton.addEventListener(
            "click",
            () => {
                loadConversation(chat.id);
            }
        );


        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-chat-button";

        deleteButton.type = "button";

        deleteButton.setAttribute(
            "aria-label",
            "Delete conversation"
        );

        deleteButton.textContent = "×";

        deleteButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();

                openDeleteDialog(
                    chat.id
                );
            }
        );


        item.appendChild(
            titleButton
        );

        item.appendChild(
            deleteButton
        );

        chatHistory.appendChild(item);
    });
}


// Load saved conversation

function loadConversation(chatId) {
    const history = getHistory();

    const conversation =
        history.find(
            (chat) =>
                chat.id === chatId
        );

    if (!conversation) {
        return;
    }

    currentChatId =
        conversation.id;

    chatMessages.innerHTML = "";

    conversation.messages.forEach(
        (message) => {
            addMessage(
                message.text,
                message.role
            );
        }
    );

    chatSidebar.classList.remove(
        "open"
    );

    messageInput.focus();
}


// Open custom delete dialog

function openDeleteDialog(chatId) {
    chatToDeleteId = chatId;

    deleteDialog.classList.remove(
        "hidden"
    );
}


// Close custom delete dialog

function closeDeleteDialog() {
    chatToDeleteId = null;

    deleteDialog.classList.add(
        "hidden"
    );
}


// Cancel delete

cancelDeleteButton.addEventListener(
    "click",
    closeDeleteDialog
);


// Confirm delete

confirmDeleteButton.addEventListener(
    "click",
    () => {
        if (!chatToDeleteId) {
            return;
        }

        const history = getHistory();

        const updatedHistory =
            history.filter(
                (chat) =>
                    chat.id !== chatToDeleteId
            );

        saveHistory(updatedHistory);

        if (
            currentChatId ===
            chatToDeleteId
        ) {
            startNewChat();
        }

        closeDeleteDialog();

        renderHistory();
    }
);


// Typing indicator

function addTypingIndicator() {
    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message-wrapper assistant";

    const label =
        document.createElement("div");

    label.className =
        "message-label";

    label.textContent =
        "Cognitask";

    const message =
        document.createElement("div");

    message.className =
        "message";

    wrapper.appendChild(label);
    wrapper.appendChild(message);

    chatMessages.appendChild(
        wrapper
    );

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

    let dots = 1;

    const interval =
        setInterval(() => {
            message.textContent =
                "•".repeat(dots);

            dots =
                dots === 3
                    ? 1
                    : dots + 1;
        }, 400);

    message.textContent = "•";

    return {
        remove: () => {
            clearInterval(interval);
            wrapper.remove();
        }
    };
}


// Add message

function addMessage(text, role) {
    const messageWrapper =
        document.createElement("div");

    messageWrapper.className =
        `message-wrapper ${role}`;

    const label =
        document.createElement("div");

    label.className =
        "message-label";

    label.textContent =
        role === "user"
            ? "You"
            : "Cognitask";

    const message =
        document.createElement("div");

    message.className =
        "message";

    if (role === "assistant") {
        message.innerHTML =
            formatAIResponse(text);
    } else {
        message.textContent = text;
    }

    messageWrapper.appendChild(label);
    messageWrapper.appendChild(message);

    chatMessages.appendChild(
        messageWrapper
    );

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


// Format AI response

function formatAIResponse(text) {
    const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    return escaped
        .replace(
            /^>\s?/gm,
            ""
        )
        .replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        )
        .replace(
            /^###\s?(.*?)$/gm,
            "<strong>$1</strong>"
        )
        .replace(
            /^##\s?(.*?)$/gm,
            "<strong>$1</strong>"
        )
        .replace(
            /^#\s?(.*?)$/gm,
            "<strong>$1</strong>"
        )
        .replace(
            /^\s*[-*]\s+(.*?)$/gm,
            "• $1"
        )
        .replace(
            /^\s*(\d+)\.\s+(.*?)$/gm,
            "$1. $2"
        )
        .replace(
            /\n/g,
            "<br>"
        );
}


// Load saved history when app starts

renderHistory();