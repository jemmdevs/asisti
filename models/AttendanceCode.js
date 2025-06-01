import mongoose from 'mongoose';

const AttendanceCodeSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Por favor proporciona la clase a la que pertenece este código'],
  },
  code: {
    type: String,
    required: [true, 'Por favor proporciona un código de asistencia'],
    minlength: 3,
    maxlength: 3,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Por favor proporciona una fecha de expiración para el código'],
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.AttendanceCode || mongoose.model('AttendanceCode', AttendanceCodeSchema);
