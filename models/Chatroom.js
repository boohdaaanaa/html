import mongoose from 'mongoose';

const chatroomSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  participants: [Number], // ID студентів з MySQL
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Chatroom', chatroomSchema);