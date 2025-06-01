// Script para crear la cuenta de alumno
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Definición del modelo de Usuario
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, proporciona un nombre'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Por favor, proporciona un email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Por favor, proporciona una contraseña'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['profesor', 'alumno'],
    default: 'alumno'
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Crear el modelo
const User = mongoose.model('User', userSchema);

async function createAlumno() {
  try {
    // Conectar a la base de datos
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI no está definido en el archivo .env');
      process.exit(1);
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Conexión a MongoDB establecida correctamente');
    
    // Verificar si el alumno ya existe
    const existingUser = await User.findOne({ email: 'alumno@gmail.com' });
    
    if (existingUser) {
      console.log('El usuario alumno@gmail.com ya existe en la base de datos');
      await mongoose.disconnect();
      return;
    }
    
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Crear el usuario alumno
    const newAlumno = new User({
      name: 'Alumno Demo',
      email: 'alumno@gmail.com',
      password: hashedPassword,
      role: 'alumno'
    });
    
    await newAlumno.save();
    
    console.log('Usuario alumno creado exitosamente:');
    console.log({
      name: newAlumno.name,
      email: newAlumno.email,
      role: newAlumno.role,
      id: newAlumno._id
    });
    
    // Desconectar de la base de datos
    await mongoose.disconnect();
    console.log('Desconexión de MongoDB realizada correctamente');
    
  } catch (error) {
    console.error('Error al crear el usuario alumno:', error);
    process.exit(1);
  }
}

// Ejecutar la función
createAlumno();
