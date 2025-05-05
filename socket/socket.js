import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Room from '../models/Room.js';

export const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id);
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-room', async (roomCode) => {
      socket.join(roomCode);
      const room = await Room.findOne({ code: roomCode });
      socket.emit('message-history', room.messages);
    });

    socket.on('send-message', async ({ roomCode, content }) => {
      try {
        const room = await Room.findOne({ code: roomCode });
        if (!room) {
          console.error('Room not found:', roomCode);
          return;
        }
    
        // Find participant info for the sender
        const participant = room.participants.find(
          (p) => p.user.toString() === socket.user._id.toString()
        );
    
        if (!participant) {
          console.error(`User is not a participant of room: ${roomCode}`);
          return;
        }
    
        // Create new message object
        const newMessage = {
          sender: socket.user._id.toString(), // store as string for consistency
          fakeName: participant.fakeName,
          content,
          timestamp: new Date().toISOString(), // ISO string preferred for frontend parsing
        };
    
        // Add message to room
        room.messages.push(newMessage);
        await room.save();
    
        // Emit updated messages to all clients in the room, including sender
        io.to(roomCode).emit('new-message', room.messages);
      } catch (error) {
        console.error('Error in send-message:', error);
      }
    });
    
    

    socket.on('catch-attempt', async ({ roomCode, fakeName, realName }) => {
      try {
        const room = await Room.findOne({ code: roomCode });
        if (!room) {
          console.error('Room not found:', roomCode);
          return;
        }
    
        if (!room.participants || !Array.isArray(room.participants)) {
          console.error('Room participants missing or invalid');
          return;
        }
    
        const user = await User.findOne({ realName });
        if (!user) {
          console.error('User with realName not found:', realName);
          return;
        }
    
        const participant = room.participants.find(p =>
          p.fakeName === fakeName && p.user.toString() === user._id.toString()
        );
    
        if (participant) {
          participant.revealed = true;
          await room.save();
          io.to(roomCode).emit('reveal-identity', { fakeName, realName });
        } else {
          const guesser = room.participants.find(p =>
            p.user.toString() === socket.user._id.toString()
          );
    
          if (!guesser) {
            console.error('Guesser participant not found in room:', socket.user._id);
            return;
          }
    
          guesser.revealed = true;
          await room.save();
          io.to(roomCode).emit('reveal-identity', {
            fakeName: guesser.fakeName,
            realName: socket.user.realName
          });
        }
      } catch (error) {
        console.error('Error in catch-attempt:', error);
      }
    });    
    
  });
};
