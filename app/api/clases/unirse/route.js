import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Class from '@/models/Class';
import User from '@/models/User';

// POST - Unirse a una clase usando el código
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'alumno') {
      return NextResponse.json({ message: 'Solo los alumnos pueden unirse a clases' }, { status: 403 });
    }

    const { code } = await request.json();

    if (!code || code.trim() === '') {
      return NextResponse.json(
        { message: 'El código de la clase es obligatorio' },
        { status: 400 }
      );
    }

    await connectDB();

    // Buscar la clase por el código
    const classToJoin = await Class.findOne({ code: code.trim() });

    if (!classToJoin) {
      return NextResponse.json(
        { message: 'Clase no encontrada. Verifica el código e intenta nuevamente.' },
        { status: 404 }
      );
    }

    // Verificar si el alumno ya está en la clase
    if (classToJoin.students.includes(session.user.id)) {
      return NextResponse.json(
        { message: 'Ya estás inscrito en esta clase' },
        { status: 400 }
      );
    }

    // Agregar al alumno a la clase
    classToJoin.students.push(session.user.id);
    await classToJoin.save();

    // Agregar la clase al alumno
    await User.findByIdAndUpdate(
      session.user.id,
      { $addToSet: { classes: classToJoin._id } }
    );

    return NextResponse.json({
      message: 'Te has unido a la clase correctamente',
      class: {
        _id: classToJoin._id,
        name: classToJoin.name,
        description: classToJoin.description,
        schedule: classToJoin.schedule,
        teacher: classToJoin.teacher
      }
    });
  } catch (error) {
    console.error('Error al unirse a la clase:', error);
    return NextResponse.json(
      { message: 'Error al unirse a la clase' },
      { status: 500 }
    );
  }
}
