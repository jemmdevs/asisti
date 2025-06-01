import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor proporciona un nombre para la clase'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Por favor proporciona un código para la clase'],
    unique: true,
    trim: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Por favor proporciona un profesor para la clase'],
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
  }
});

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);
