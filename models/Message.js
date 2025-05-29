import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatroomId: String,
  authorId: Number,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);
