// Script para crear la cuenta de profesor
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

async function createProfesor() {
  try {
    // Conectar a la base de datos
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI no está definido en el archivo .env');
      process.exit(1);
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Conexión a MongoDB establecida correctamente');
    
    // Verificar si el profesor ya existe
    const existingUser = await User.findOne({ email: 'profesor@gmail.com' });
    
    if (existingUser) {
      console.log('El usuario profesor@gmail.com ya existe en la base de datos');
      await mongoose.disconnect();
      return;
    }
    
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('19Septiembre', salt);
    
    // Crear el usuario profesor
    const newProfesor = new User({
      name: 'Profesor Demo',
      email: 'profesor@gmail.com',
      password: hashedPassword,
      role: 'profesor'
    });
    
    await newProfesor.save();
    
    console.log('Usuario profesor creado exitosamente:');
    console.log({
      name: newProfesor.name,
      email: newProfesor.email,
      role: newProfesor.role,
      id: newProfesor._id
    });
    
    // Desconectar de la base de datos
    await mongoose.disconnect();
    console.log('Desconexión de MongoDB realizada correctamente');
    
  } catch (error) {
    console.error('Error al crear el usuario profesor:', error);
    process.exit(1);
  }
}

// Ejecutar la función
createProfesor();
