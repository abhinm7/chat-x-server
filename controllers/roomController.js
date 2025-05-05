import Room from '../models/Room.js';
import User from '../models/User.js';

// Create Room - unchanged
export const createRoom = async (req, res) => {
  try {
    const { fakeName } = req.body;
    const user = await User.findById(req.user.id);

    const roomCode = Math.floor(1000 + Math.random() * 9000).toString().toUpperCase();

    console.log('Creating room with code:', roomCode);

    const room = await Room.create({ code: roomCode });

    user.rooms.push({ roomCode, fakeName });
    await user.save();

    room.participants.push({ user: user._id, fakeName });
    await room.save();

    res.json({ roomCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate Room Code - NEW
export const validateRoom = async (req, res) => {
  try {
    let { roomCode } = req.body;
    roomCode = roomCode.toString().trim().toUpperCase();

    const room = await Room.findOne({ code: roomCode });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ message: 'Room exists', roomCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join Room - expects real fakeName
export const joinRoom = async (req, res) => {
  try {
    let { roomCode, fakeName } = req.body;
    roomCode = roomCode.toString().trim().toUpperCase();

    const user = await User.findById(req.user.id);
    const room = await Room.findOne({ code: roomCode });

    if (!room) return res.status(404).json({ message: 'Room not found' });

    // if (user.rooms.some(r => r.roomCode.toUpperCase() === roomCode)) {
    //   return res.status(400).json({ message: 'Already in room' });
    // }

    user.rooms.push({ roomCode, fakeName });
    await user.save();

    room.participants.push({ user: user._id, fakeName });
    await room.save();

    res.json({ roomCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
