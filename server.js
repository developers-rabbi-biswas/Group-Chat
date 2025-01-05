const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// File upload route
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (file) {
    io.to(req.body.room).emit('fileMessage', {
      username: req.body.username,
      filename: file.originalname,
      filePath: `/uploads/${file.filename}`
    });
    res.status(200).json({ message: 'File uploaded successfully' });
  } else {
    res.status(400).json({ message: 'File upload failed' });
  }
});

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket connection
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ room, username }) => {
    socket.join(room);
    socket.broadcast.to(room).emit('message', `${username} has joined the chat`);
    socket.on('chatMessage', (msg) => {
      io.to(room).emit('message', { username, text: msg });
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
