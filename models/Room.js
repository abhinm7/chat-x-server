import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fakeName: String,
    revealed: { type: Boolean, default: false }
  }],
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fakeName: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const Room = mongoose.model('Room', roomSchema);

export default Room