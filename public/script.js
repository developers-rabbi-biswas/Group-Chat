// Frontend JavaScript

const socket = io();
let room = '';
let username = '';

// Join room function with Enter key
function joinRoom() {
  room = document.getElementById('room').value;
  username = document.getElementById('username').value;
  if (room && username) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('chat-container').style.display = 'flex';
    
    // Set room name and user name in header
    document.getElementById('room-name').textContent = `Room: ${room}`;
    document.getElementById('user-name').textContent = `User: ${username}`;

    socket.emit('joinRoom', { room, username });
  }
}

// Listen for Enter key in the login form
document.getElementById('room').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') joinRoom();
});
document.getElementById('username').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') joinRoom();
});

// Send message with Enter key
function sendMessage() {
  const message = document.getElementById('message').value;
  if (message) {
    socket.emit('chatMessage', message);
    document.getElementById('message').value = '';
  }
}

// Add Enter key listener for sending messages
document.getElementById('message').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

// Automatically upload files when a file is selected
document.getElementById('file').addEventListener('change', () => {
  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];

  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('room', room);
    formData.append('username', username);

    fetch('/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then(() => {
        fileInput.value = ''; // Clear the file input after upload
      });
    
    // Show preview if the file is an image
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const previewElement = document.createElement('div');
        previewElement.innerHTML = `${username}: <img src="${e.target.result}" alt="Image Preview" style="max-width: 100px;">`;
        const chatBox = document.getElementById('chat-box');
        chatBox.appendChild(previewElement);
        chatBox.scrollTop = chatBox.scrollHeight;
      };
      reader.readAsDataURL(file);
    }
  }
});

// Socket listeners
socket.on('message', (msg) => {
  const chatBox = document.getElementById('chat-box');
  const messageElement = document.createElement('div');
  messageElement.textContent = `${msg.username || 'System'}: ${msg.text}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('fileMessage', (data) => {
  const chatBox = document.getElementById('chat-box');
  const fileElement = document.createElement('div');
  fileElement.innerHTML = `${data.username}: <a href="${data.filePath}" >${data.filename}</a>`;
  chatBox.appendChild(fileElement);
  chatBox.scrollTop = chatBox.scrollHeight;
});
