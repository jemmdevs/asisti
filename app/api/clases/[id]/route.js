import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';
import AttendanceCode from '@/models/AttendanceCode';
import mongoose from 'mongoose';

// GET - Obtener una clase específica
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID de clase no válido' }, { status: 400 });
    }

    await connectDB();

    const classData = await Class.findById(id)
      .populate('teacher', 'name email')
      .populate('students', 'name email');

    if (!classData) {
      return NextResponse.json({ message: 'Clase no encontrada' }, { status: 404 });
    }

    // Verificar que el usuario tenga acceso a esta clase
    const isTeacher = session.user.role === 'profesor' && 
                     classData.teacher._id.toString() === session.user.id;
    const isStudent = session.user.role === 'alumno' && 
                     classData.students.some(student => student._id.toString() === session.user.id);

    if (!isTeacher && !isStudent) {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error al obtener clase:', error);
    return NextResponse.json(
      { message: 'Error al obtener la clase' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una clase
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'profesor') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID de clase no válido' }, { status: 400 });
    }

    const { name, description, schedule } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { message: 'El nombre de la clase es obligatorio' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar que la clase exista y pertenezca al profesor
    const classToUpdate = await Class.findOne({
      _id: id,
      teacher: session.user.id
    });

    if (!classToUpdate) {
      return NextResponse.json(
        { message: 'Clase no encontrada o no tienes permiso para editarla' },
        { status: 404 }
      );
    }

    // Actualizar la clase
    classToUpdate.name = name;
    classToUpdate.description = description;
    classToUpdate.schedule = schedule;

    await classToUpdate.save();

    return NextResponse.json(classToUpdate);
  } catch (error) {
    console.error('Error al actualizar clase:', error);
    return NextResponse.json(
      { message: 'Error al actualizar la clase' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una clase
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'profesor') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID de clase no válido' }, { status: 400 });
    }

    await connectDB();

    // Verificar que la clase exista y pertenezca al profesor
    const classToDelete = await Class.findOne({
      _id: id,
      teacher: session.user.id
    });

    if (!classToDelete) {
      return NextResponse.json(
        { message: 'Clase no encontrada o no tienes permiso para eliminarla' },
        { status: 404 }
      );
    }

    // Eliminar todos los códigos de asistencia relacionados
    await AttendanceCode.deleteMany({ class: id });

    // Eliminar todos los registros de asistencia relacionados
    await Attendance.deleteMany({ class: id });

    // Eliminar la clase
    await Class.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Clase eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar clase:', error);
    return NextResponse.json(
      { message: 'Error al eliminar la clase' },
      { status: 500 }
    );
  }
}
