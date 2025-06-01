import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor proporciona un nombre'],
  },
  email: {
    type: String,
    required: [true, 'Por favor proporciona un email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor proporciona un email válido',
    ],
  },
  password: {
    type: String,
    required: [true, 'Por favor proporciona una contraseña'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['alumno', 'profesor'],
    default: 'alumno',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }]
});

// Encriptar contraseña usando bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
