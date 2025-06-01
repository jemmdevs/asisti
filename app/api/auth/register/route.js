import connectDB from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { name, email, password, role = 'alumno' } = await request.json();

    // Conectar a la base de datos
    await connectDB();

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json(
        { message: 'El usuario con este email ya existe' },
        { status: 400 }
      );
    }

    // Crear el nuevo usuario
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    return NextResponse.json(
      { 
        message: 'Usuario registrado correctamente',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json(
      { message: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
