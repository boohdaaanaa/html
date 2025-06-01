// server.js
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
});

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

// Store user sessions and their current chat rooms
const userSessions = new Map(); // userId -> { socketId, currentChatRoom }

// Тест підключення MySQL
async function testMySQLConnection() {
  try {
    const connection = await mysqlPool.getConnection();
    console.log('MySQL connected successfully');
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM students');
    console.log('Total students in database:', rows[0].count);
    
    // Test specific students
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
    console.log('Searching for student with ID:', studentId);
    
    const [rows] = await mysqlPool.execute(
      'SELECT id, name, surname, gender, birthday, status, group_name FROM students WHERE id = ?',
      [studentId]
    );
    
    console.log('MySQL query result for ID', studentId, ':', rows);
    
    if (rows && rows.length > 0) {
      console.log('Found student:', rows[0]);
      return rows[0];
    } else {
      console.log('No student found with ID:', studentId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching student info for ID:', studentId, error);
    return null;
  }
}

// API Routes

// Get all chat rooms for a user
app.get('/api/chatrooms/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Find chat rooms where user is a participant
    const chatRooms = await ChatRoom.find({
      participants: userId
    }).sort({ createdAt: -1 });

    // Get participant info for each chat room
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
          _id: room._id,
          name: room.name,
          participants: participantInfo.filter(p => p !== null),
          createdAt: room.createdAt
        };
      })
    );

    res.json(chatRoomsWithInfo);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a specific chat room
app.get('/api/messages/:chatRoomId', async (req, res) => {
  try {
    const chatRoomId = req.params.chatRoomId;
    
    const messages = await Message.find({
      chatRoomId: chatRoomId
    }).sort({ createdAt: 1 });

    // Get author info for each message
    const messagesWithAuthorInfo = await Promise.all(
      messages.map(async (message) => {
        const author = await getStudentInfo(message.author);
        return {
          _id: message._id,
          text: message.text,
          author: author ? {
            id: author.id,
            name: author.name,
            surname: author.surname,
            fullName: `${author.name} ${author.surname}`,
            group: author.group_name
          } : { id: message.author, name: 'Unknown', surname: 'User', fullName: 'Unknown User' },
          chatRoomId: message.chatRoomId,
          createdAt: message.createdAt
        };
      })
    );

    res.json(messagesWithAuthorInfo);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new chat room
app.post('/api/chatrooms', async (req, res) => {
  try {
    console.log('Received chat room creation request:', req.body);
    
    const { name, participants } = req.body;
    
    if (!name || !participants || !Array.isArray(participants)) {
      console.log('Invalid request data:', { name, participants });
      return res.status(400).json({ error: 'Name and participants array are required' });
    }
    
    console.log('Validating participants:', participants);
    
    // Validate that all participants exist in MySQL
    const validParticipants = [];
    for (const participantId of participants) {
      console.log('Checking participant:', participantId);
      const student = await getStudentInfo(participantId);
      console.log('Student found:', student);
      if (student) {
        validParticipants.push(participantId);
      }
    }

    console.log('Valid participants:', validParticipants);

    if (validParticipants.length === 0) {
      return res.status(400).json({ error: 'No valid participants found. Please check student IDs.' });
    }

    const chatRoom = new ChatRoom({
      name: name,
      participants: validParticipants
    });

    await chatRoom.save();
    console.log('Chat room saved:', chatRoom);

    // Get participant info for response
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
      _id: chatRoom._id,
      name: chatRoom.name,
      participants: participantInfo,
      createdAt: chatRoom.createdAt
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User authentication - register user session
  socket.on('authenticate', (userId) => {
    userSessions.set(userId, {
      socketId: socket.id,
      currentChatRoom: null
    });
    socket.userId = userId;
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });

  // Join chat room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    
    // Update user's current chat room
    if (socket.userId && userSessions.has(socket.userId)) {
      const session = userSessions.get(socket.userId);
      session.currentChatRoom = roomId;
      userSessions.set(socket.userId, session);
    }
    
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Leave chat room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    
    // Clear user's current chat room
    if (socket.userId && userSessions.has(socket.userId)) {
      const session = userSessions.get(socket.userId);
      session.currentChatRoom = null;
      userSessions.set(socket.userId, session);
    }
    
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  // Handle new message
  socket.on('send-message', async (data) => {
    try {
      const { chatRoomId, authorId, text } = data;

      // Save message to database
      const message = new Message({
        author: authorId,
        text: text,
        chatRoomId: chatRoomId
      });

      await message.save();

      // Get author info
      const author = await getStudentInfo(authorId);

      // Create message object with author info
      const messageWithAuthor = {
        _id: message._id,
        text: message.text,
        author: author ? {
          id: author.id,
          name: author.name,
          surname: author.surname,
          fullName: `${author.name} ${author.surname}`,
          group: author.group_name
        } : { id: authorId, name: 'Unknown', surname: 'User', fullName: 'Unknown User' },
        chatRoomId: message.chatRoomId,
        createdAt: message.createdAt
      };

      // Get chat room info to find all participants
      const chatRoom = await ChatRoom.findById(chatRoomId);
      
      if (chatRoom) {
        // Send message to all users in the room
        io.to(chatRoomId).emit('new-message', messageWithAuthor);
        
        // Send notifications to users who are not in the current chat room
        for (const participantId of chatRoom.participants) {
          // Don't send notification to the message author
          if (participantId !== authorId) {
            const participantSession = userSessions.get(participantId);
            
            if (participantSession) {
              // Check if user is not currently in this chat room
              if (participantSession.currentChatRoom !== chatRoomId) {
                // Send notification to this user
                io.to(participantSession.socketId).emit('new-notification', {
                  chatRoomId: chatRoomId,
                  chatRoomName: chatRoom.name,
                  message: {
                    text: text.length > 50 ? text.substring(0, 50) + '...' : text,
                    author: messageWithAuthor.author,
                    createdAt: message.createdAt
                  }
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Handle user navigating to messages page
  socket.on('enter-messages-page', () => {
    if (socket.userId && userSessions.has(socket.userId)) {
      const session = userSessions.get(socket.userId);
      session.onMessagesPage = true;
      userSessions.set(socket.userId, session);
    }
  });

  // Handle user leaving messages page
  socket.on('leave-messages-page', () => {
    if (socket.userId && userSessions.has(socket.userId)) {
      const session = userSessions.get(socket.userId);
      session.onMessagesPage = false;
      session.currentChatRoom = null;
      userSessions.set(socket.userId, session);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user session
    if (socket.userId) {
      userSessions.delete(socket.userId);
    }
  });
});

// Ініціалізація сервера
async function startServer() {
  // Тестуємо підключення до MySQL
  const mysqlConnected = await testMySQLConnection();
  
  if (!mysqlConnected) {
    console.error('Cannot start server: MySQL connection failed');
    process.exit(1);
  }

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('MySQL connection pool ready');
  });
}

// Запускаємо сервер
startServer();