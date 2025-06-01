import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Por favor proporciona la clase a la que pertenece esta asistencia'],
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Por favor proporciona el estudiante que asistió'],
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Por favor proporciona la fecha de asistencia'],
  },
  justified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Índice compuesto para evitar duplicados de asistencia en el mismo día para el mismo estudiante y clase
AttendanceSchema.index({ class: 1, student: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
