import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  realName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rooms: [{
    roomCode: String,
    fakeName: String,
    catchUsed: { type: Boolean, default: false }
  }]
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
