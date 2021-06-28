import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: 'String',
    maxLength: 50,
    required: true
  },
  password: {
    type: 'String',
    maxLength: 100,
    required: true
  },
});

const User = mongoose.model('user', UserSchema);
export default User;