import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import Message from './models/Message.js';
import Chatroom from './models/Chatroom.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Створення Express та HTTP серверу
const app = express();
const server = http.createServer(app);

// Ініціалізація Socket.IO
const io = new Server(server, {
  cors: { origin: '*' }
});

// Для ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Глобальна змінна для MySQL з'єднання
let mysqlConn;

// Підключення до MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/chat_app')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Підключення до MySQL
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

// Middleware
app.use(cors());
app.use(express.json());
// Проксі PHP до Apache (завжди перед express.static)
app.use(/.*\.php$/, createProxyMiddleware({
  target: 'http://127.0.0.1:80/html/public', // або 8080, якщо треба
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

// API для отримання студентів
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

// Статичні файли (тільки HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html', 'js', 'css'],
  index: false
}));



// Статичні HTML сторінки
const staticPages = ['index', 'students', 'tasks', 'messages', 'header'];
staticPages.forEach(page => {
  app.get(`/${page}.html`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обробка JS-файлів
app.get(/.*\.js$/, (req, res) => {
  res.type('application/javascript').sendFile(path.join(__dirname, 'public', req.path));
});

// ВИДАЛЯЄМО це - не потрібно окремо обробляти index.php
// Він повинен оброблятися через PHP-FPM як і інші PHP файли


// Логаут


// Віддача PHP скриптів (як файлів)
['add_student.php', 'update_student.php', 'delete_students.php'].forEach(file => {
  app.post(`/${file}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', file));
  });
});

// Створення чату
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

// Отримання чатів користувача
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

// Отримання повідомлень чату
app.get('/messages/:chatroomId', async (req, res) => {
  try {
    const messages = await Message.find({ chatroomId: req.params.chatroomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ error: 'Помилка при отриманні повідомлень' });
  }
});

// WebSocket логіка
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

// Глобальний обробник помилок
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Внутрішня помилка сервера',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3001; // Змінили з 3000 на 3001
server.listen(PORT, () => {
  console.log(`✅ Сервер запущено: http://localhost:${PORT}`);
});