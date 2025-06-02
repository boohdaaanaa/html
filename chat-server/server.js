const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/chat_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err));

// MySQL Connection Pool
const mysqlPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'student_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Store user sessions
const userSessions = new Map(); // userId -> { socketId, currentChatRoom, onMessagesPage }

// Test MySQL Connection
async function testMySQLConnection() {
  try {
    const connection = await mysqlPool.getConnection();
    console.log('MySQL connected successfully');
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM students');
    console.log('Total students in database:', rows[0].count);
    const [testRows] = await connection.execute('SELECT * FROM students WHERE id IN (19, 21, 22) LIMIT 3');
    console.log('Test students:', testRows);
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL connection failed:', error);
    return false;
  }
}

// MongoDB Schemas
const chatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participants: [{ type: Number, required: true }], // MySQL student IDs
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  author: { type: Number, required: true }, // MySQL student ID
  text: { type: String, required: true },
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  createdAt: { type: Date, default: Date.now }
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
const Message = mongoose.model('Message', messageSchema);

// Helper function to get student info from MySQL
async function getStudentInfo(studentId) {
  try {
    console.log('Fetching student info for ID:', studentId);
    const [rows] = await mysqlPool.execute(
      'SELECT id, name, surname, gender, birthday, status, group_name FROM students WHERE id = ?',
      [studentId]
    );
    if (rows.length > 0) {
      console.log('Student found:', rows[0]);
      return rows[0];
    }
    console.log('No student found with ID:', studentId);
    return null;
  } catch (error) {
    console.error('Error fetching student info:', error);
    return null;
  }
}

// API Routes

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT id, name, surname FROM students');
    console.log('Fetched students:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all chat rooms for a user
app.get('/api/chatrooms/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const chatRooms = await ChatRoom.find({ participants: userId }).sort({ createdAt: -1 });
    const chatRoomsWithInfo = await Promise.all(
      chatRooms.map(async (room) => {
        const participantInfo = await Promise.all(
          room.participants.map(async (participantId) => {
            const student = await getStudentInfo(participantId);
            return student ? {
              id: student.id,
              name: student.name,
              surname: student.surname,
              fullName: `${student.name} ${student.surname}`,
              group: student.group_name
            } : null;
          })
        );
        return {
          _id: room._id.toString(),
          name: room.name,
          participants: participantInfo.filter(p => p !== null),
          createdAt: room.createdAt
        };
      })
    );
    console.log('Fetched chat rooms for user', userId, ':', chatRoomsWithInfo);
    res.json(chatRoomsWithInfo);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a chat room
app.get('/api/messages/:chatRoomId', async (req, res) => {
  try {
    const chatRoomId = req.params.chatRoomId;
    const messages = await Message.find({ chatRoomId }).sort({ createdAt: 1 });
    const messagesWithAuthorInfo = await Promise.all(
      messages.map(async (message) => {
        const author = await getStudentInfo(message.author);
        return {
          _id: message._id.toString(),
          text: message.text,
          author: author ? {
            id: author.id,
            name: author.name,
            surname: author.surname,
            fullName: `${author.name} ${author.surname}`,
            group: author.group_name
          } : { id: message.author, fullName: 'Unknown User' },
          chatRoomId: message.chatRoomId.toString(),
          createdAt: message.createdAt
        };
      })
    );
    console.log('Fetched messages for room', chatRoomId, ':', messagesWithAuthorInfo);
    res.json(messagesWithAuthorInfo);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new chat room
app.post('/api/chatrooms', async (req, res) => {
  try {
    console.log('Creating chat room:', req.body);
    const { name, participants } = req.body;
    if (!name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ error: 'Name and participants array are required' });
    }
    const validParticipants = [];
    for (const participantId of participants) {
      const student = await getStudentInfo(participantId);
      if (student) validParticipants.push(participantId);
    }
    if (validParticipants.length === 0) {
      return res.status(400).json({ error: 'No valid participants found' });
    }
    const chatRoom = new ChatRoom({
      name,
      participants: validParticipants
    });
    await chatRoom.save();
    const participantInfo = await Promise.all(
      validParticipants.map(async (participantId) => {
        const student = await getStudentInfo(participantId);
        return {
          id: student.id,
          name: student.name,
          surname: student.surname,
          fullName: `${student.name} ${student.surname}`,
          group: student.group_name
        };
      })
    );
    const response = {
      _id: chatRoom._id.toString(),
      name: chatRoom.name,
      participants: participantInfo,
      createdAt: chatRoom.createdAt
    };
    console.log('Chat room created:', response);
    res.json(response);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add participants to chat room
app.post('/api/chatrooms/:id/add-participants', async (req, res) => {
  try {
    const chatRoomId = req.params.id;
    const { participants } = req.body;
    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({ error: 'Participants array is required' });
    }
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    const validParticipants = [];
    for (const participantId of participants) {
      const student = await getStudentInfo(participantId);
      if (student && !chatRoom.participants.includes(participantId)) {
        validParticipants.push(participantId);
      }
    }
    if (validParticipants.length === 0) {
      return res.status(400).json({ error: 'No valid new participants' });
    }
    chatRoom.participants.push(...validParticipants);
    await chatRoom.save();
    const participantInfo = await Promise.all(
      chatRoom.participants.map(async (participantId) => {
        const student = await getStudentInfo(participantId);
        return student ? {
          id: student.id,
          name: student.name,
          surname: student.surname,
          fullName: `${student.name} ${student.surname}`,
          group: student.group_name
        } : null;
      })
    );
    const response = {
      _id: chatRoom._id.toString(),
      name: chatRoom.name,
      participants: participantInfo.filter(p => p !== null),
      createdAt: chatRoom.createdAt
    };
    console.log('Participants added to chat room:', response);
    res.json(response);
  } catch (error) {
    console.error('Error adding participants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('authenticate', (userId) => {
    userSessions.set(userId, {
      socketId: socket.id,
      currentChatRoom: null,
      onMessagesPage: false
    });
    socket.userId = userId;
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    if (socket.userId && userSessions.has(socket.userId)) {
      const session = userSessions.get(socket.userId);
      session.currentChatRoom = roomId;
      userSessions.set(socket.userId, session);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    }
  });
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    if (socket.userId && userSessions.has(socket.userId)) {
      const session = userSessions.get(socket.userId);
      session.currentChatRoom = null;
      userSessions.set(socket.userId, session);
      console.log(`User ${socket.userId} left room ${roomId}`);
    }
  });
  socket.on('enter-messages-page', () => {
    if (socket.userId && userSessions.has(socket.userId)) {
      const session = userSessions.get(socket.userId);
      session.onMessagesPage = true;
      userSessions.set(socket.userId, session);
      console.log(`User ${socket.userId} entered messages page`);
    }
  });
  socket.on('leave-messages-page', () => {
    if (socket.userId && userSessions.has(socket.userId)) {
      const session = userSessions.get(socket.userId);
      session.onMessagesPage = false;
      session.currentChatRoom = null;
      userSessions.set(socket.userId, session);
      console.log(`User ${socket.userId} left messages page`);
    }
  });
  socket.on('send-message', async (messageData) => {
    try {
      console.log('Received message:', messageData);
      const { chatRoomId, authorId, text } = messageData;
      if (!chatRoomId || !authorId || !text) {
        socket.emit('message-error', { error: 'Missing required message data' });
        return;
      }
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        socket.emit('message-error', { error: 'Chat room not found' });
        return;
      }
      const author = await getStudentInfo(authorId);
      if (!author) {
        socket.emit('message-error', { error: 'Author not found' });
        return;
      }
      const newMessage = new Message({
        chatRoomId,
        author: authorId,
        text,
        createdAt: new Date()
      });
      await newMessage.save();
      const messageWithAuthorInfo = {
        _id: newMessage._id.toString(),
        chatRoomId: newMessage.chatRoomId.toString(),
        text: newMessage.text,
        author: {
          id: author.id,
          name: author.name,
          surname: author.surname,
          fullName: `${author.name} ${author.surname}`,
          group: author.group_name
        },
        createdAt: newMessage.createdAt
      };
      io.to(chatRoomId).emit('new-message', messageWithAuthorInfo);
      socket.emit('message-saved', messageWithAuthorInfo);
      await sendNotificationsToUsers(chatRoomId, messageWithAuthorInfo, authorId);
      console.log(`Message sent to room ${chatRoomId} by user ${authorId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });
  socket.on('disconnect', () => {
    if (socket.userId && userSessions.has(socket.userId)) {
      userSessions.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Send notifications
async function sendNotificationsToUsers(chatRoomId, message, authorId) {
  try {
    console.log('Sending notifications for room:', chatRoomId);
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      console.error('Chat room not found:', chatRoomId);
      return;
    }
    const participants = chatRoom.participants.map(String);
    const onlineUsers = Array.from(userSessions.entries()).filter(([userId]) =>
      userId !== authorId.toString() && participants.includes(userId)
    );
    for (const [userId, session] of onlineUsers) {
      const shouldReceiveNotification =
        !session.onMessagesPage ||
        session.currentChatRoom !== chatRoomId.toString();
      if (shouldReceiveNotification) {
        const notification = {
          chatRoomId: chatRoomId.toString(),
          chatRoomName: chatRoom.name,
          message: {
            author: message.author,
            text: message.text,
            createdAt: message.createdAt
          }
        };
        console.log(`Emitting notification to user ${userId}:`, notification);
        io.to(session.socketId).emit('new-notification', notification);
      }
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

// Start server
async function startServer() {
  if (!(await testMySQLConnection())) {
    console.error('Cannot start server: MySQL connection failed');
    process.exit(1);
  }
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();