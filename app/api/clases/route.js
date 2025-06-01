import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Class from '@/models/Class';
import { nanoid } from 'nanoid';

// GET - Obtener todas las clases del profesor
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    // Si es profesor, obtener sus clases
    if (session.user.role === 'profesor') {
      const classes = await Class.find({ teacher: session.user.id })
        .populate('students', 'name email')
        .sort({ createdAt: -1 });
      
      return NextResponse.json(classes);
    } 
    // Si es alumno, obtener las clases a las que pertenece
    else if (session.user.role === 'alumno') {
      const classes = await Class.find({ students: session.user.id })
        .populate('teacher', 'name')
        .sort({ createdAt: -1 });
      
      return NextResponse.json(classes);
    }
    
    return NextResponse.json({ message: 'Rol no válido' }, { status: 403 });
  } catch (error) {
    console.error('Error al obtener clases:', error);
    return NextResponse.json(
      { message: 'Error al obtener clases' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva clase
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'profesor') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { name, description, schedule } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { message: 'El nombre de la clase es obligatorio' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generar un código único para la clase
    const code = nanoid(6).toUpperCase();

    const newClass = new Class({
      name,
      description,
      schedule,
      code,
      teacher: session.user.id,
      students: []
    });

    await newClass.save();

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error al crear clase:', error);
    return NextResponse.json(
      { message: 'Error al crear la clase' },
      { status: 500 }
    );
  }
}
