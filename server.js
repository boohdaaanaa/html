import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { createProxyMiddleware } from 'http-proxy-middleware';
import Message from './models/Message.js'; 
import Chatroom from './models/Chatroom.js'; 

// Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mysqlConn;

// MySQL Connection
async function connectToMySQL() {
  try {
    mysqlConn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'student_app'
    });
    console.log('✅ Connected to MySQL');
  } catch (error) {
    console.error('❌ MySQL connection error:', error);
  }
}
connectToMySQL();

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/chat_app')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());

// PHP Proxy Middleware
app.use(/.*\.php$/, createProxyMiddleware({
  target: 'http://127.0.0.1:80/html/public',
  changeOrigin: true,
  pathRewrite: { '^/': '/' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying PHP request: ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('PHP Proxy Error:', err);
    res.status(500).send('PHP processing error');
  }
}));

// API Routes
app.get('/students', async (req, res) => {
  try {
    if (!mysqlConn) throw new Error('MySQL connection not available');
    const [rows] = await mysqlConn.execute('SELECT * FROM students');
    res.json(rows);
  } catch (error) {
    console.error('❌ MySQL error:', error);
    res.status(500).json({
      error: 'Помилка отримання студентів',
      details: error.message
    });
  }
});

// Роут для отримання інформації про користувача
app.get('/get_user.php', (req, res) => {
    // Проксування запиту до PHP файлу
    res.redirect('/get_user.php');
});

// Роут для логіну
app.post('/AuthController.php', (req, res) => {
    // Проксування запиту до PHP файлу
    res.redirect('/AuthController.php');
});

// Роут для логауту
app.get('/logout', async (req, res) => {
    try {
        // Можна додати логіку очищення сесії тут
        // або проксувати до PHP
        const response = await fetch('http://127.0.0.1:80/html/public/logout.php');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.json({ success: true }); // Fallback
    }
});

// Додай цей middleware для кращої обробки PHP файлів
app.use('/get_user.php', createProxyMiddleware({
    target: 'http://127.0.0.1:80/html/public',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying getuser.php request`);
    }
}));

app.use('/AuthController.php', createProxyMiddleware({
    target: 'http://127.0.0.1:80/html/public',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying login.php request`);
    }
}));

// Static Files
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html', 'js', 'css'],
  index: false
}));

// Static HTML Pages
const staticPages = ['index', 'students', 'tasks', 'messages', 'header'];
staticPages.forEach(page => {
  app.get(`/${page}.html`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  });
});

// Root Route
app.get('/', (req, res) => {
  res.redirect('/index.php');
});

// PHP Scripts
['add_student.php', 'update_student.php', 'delete_students.php'].forEach(file => {
  app.post(`/${file}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', file));
  });
});

// Chatroom and Message Routes
app.post('/chatrooms', async (req, res) => {
  try {
    const { name, members } = req.body;
    const chatroom = new Chatroom({
      name,
      participants: members.map(m => m.id)
    });
    await chatroom.save();
    res.json(chatroom);
  } catch (error) {
    console.error('❌ Chatroom creation error:', error);
    res.status(500).json({ error: 'Помилка створення чату' });
  }
});

app.get('/chatrooms/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const rooms = await Chatroom.find({ participants: studentId });
    res.json(rooms);
  } catch (error) {
    console.error('❌ Get chatrooms error:', error);
    res.status(500).json({ error: 'Помилка при отриманні чатів' });
  }
});

app.get('/messages/:chatroomId', async (req, res) => {
  try {
    const messages = await Message.find({ chatroomId: req.params.chatroomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ error: 'Помилка при отриманні повідомлень' });
  }
});

// WebSocket Logic
io.on('connection', (socket) => {
  console.log('🔌 Користувач підключився');
  socket.on('joinRoom', (chatroomId) => {
    socket.join(chatroomId);
    console.log(`👥 Користувач приєднався до чату: ${chatroomId}`);
  });
  socket.on('sendMessage', async ({ chatroomId, authorId, text }) => {
    try {
      const message = new Message({
        chatroomId,
        authorId,
        text,
        timestamp: new Date()
      });
      await message.save();
      io.to(chatroomId).emit('newMessage', message);
    } catch (error) {
      console.error('❌ Send message error:', error);
    }
  });
  socket.on('disconnect', () => {
    console.log('🚫 Користувач вийшов');
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Внутрішня помилка сервера',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Сервер запущено: http://localhost:${PORT}`);
});