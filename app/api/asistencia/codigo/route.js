import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Class from '@/models/Class';
import AttendanceCode from '@/models/AttendanceCode';
import Attendance from '@/models/Attendance';
import mongoose from 'mongoose';
import { addMinutes } from 'date-fns';

// Función para generar un código aleatorio de 3 dígitos
const generarCodigoAleatorio = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};

// GET - Obtener código activo para una clase
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const claseId = searchParams.get('clase');

    if (!claseId || !mongoose.Types.ObjectId.isValid(claseId)) {
      return NextResponse.json({ message: 'ID de clase no válido' }, { status: 400 });
    }

    await connectDB();

    // Verificar que el usuario tenga acceso a esta clase
    const classData = await Class.findById(claseId);
    
    if (!classData) {
      return NextResponse.json({ message: 'Clase no encontrada' }, { status: 404 });
    }

    const isTeacher = session.user.role === 'profesor' && 
                     classData.teacher.toString() === session.user.id;
    const isStudent = session.user.role === 'alumno' && 
                     classData.students.includes(session.user.id);

    if (!isTeacher && !isStudent) {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    // Buscar código activo para esta clase
    const codigoActivo = await AttendanceCode.findOne({
      class: claseId,
      active: true,
      expiresAt: { $gt: new Date() }
    });

    if (!codigoActivo) {
      return NextResponse.json({ message: 'No hay código activo para esta clase' }, { status: 404 });
    }

    return NextResponse.json(codigoActivo);
  } catch (error) {
    console.error('Error al obtener código de asistencia:', error);
    return NextResponse.json(
      { message: 'Error al obtener código de asistencia' },
      { status: 500 }
    );
  }
}

// POST - Generar nuevo código de asistencia
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'profesor') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { claseId, duracion = 15 } = await request.json();

    if (!claseId || !mongoose.Types.ObjectId.isValid(claseId)) {
      return NextResponse.json({ message: 'ID de clase no válido' }, { status: 400 });
    }

    await connectDB();

    // Verificar que la clase exista y pertenezca al profesor
    const classData = await Class.findOne({
      _id: claseId,
      teacher: session.user.id
    });

    if (!classData) {
      return NextResponse.json(
        { message: 'Clase no encontrada o no tienes permiso para generar códigos' },
        { status: 404 }
      );
    }

    // Desactivar códigos previos para esta clase
    await AttendanceCode.updateMany(
      { class: claseId, active: true },
      { active: false }
    );

    // Generar un nuevo código aleatorio
    let code = generarCodigoAleatorio();
    let codigoExiste = await AttendanceCode.findOne({ code, active: true });
    
    // Asegurar que el código sea único entre los activos
    while (codigoExiste) {
      code = generarCodigoAleatorio();
      codigoExiste = await AttendanceCode.findOne({ code, active: true });
    }

    // Crear nuevo código con fecha de expiración
    const fechaExpiracion = addMinutes(new Date(), duracion);
    
    const nuevoCodigo = new AttendanceCode({
      class: claseId,
      code,
      expiresAt: fechaExpiracion,
      active: true
    });

    await nuevoCodigo.save();

    return NextResponse.json(nuevoCodigo, { status: 201 });
  } catch (error) {
    console.error('Error al generar código de asistencia:', error);
    return NextResponse.json(
      { message: 'Error al generar código de asistencia' },
      { status: 500 }
    );
  }
}

// PUT - Verificar código y registrar asistencia
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'alumno') {
      return NextResponse.json({ message: 'Solo los alumnos pueden registrar asistencia' }, { status: 403 });
    }

    const { code, claseId } = await request.json();

    if (!code || !claseId || !mongoose.Types.ObjectId.isValid(claseId)) {
      return NextResponse.json({ message: 'Código o ID de clase no válidos' }, { status: 400 });
    }

    await connectDB();

    // Verificar que el alumno pertenezca a la clase
    const classData = await Class.findOne({
      _id: claseId,
      students: session.user.id
    });

    if (!classData) {
      return NextResponse.json(
        { message: 'No estás inscrito en esta clase o la clase no existe' },
        { status: 404 }
      );
    }

    // Verificar que el código sea válido y activo
    const codigoValido = await AttendanceCode.findOne({
      class: claseId,
      code,
      active: true,
      expiresAt: { $gt: new Date() }
    });

    if (!codigoValido) {
      return NextResponse.json(
        { message: 'Código inválido o expirado' },
        { status: 400 }
      );
    }

    // Verificar si el alumno ya registró asistencia hoy para esta clase
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const asistenciaExistente = await Attendance.findOne({
      class: claseId,
      student: session.user.id,
      date: {
        $gte: hoy,
        $lt: manana
      }
    });

    if (asistenciaExistente) {
      return NextResponse.json(
        { message: 'Ya has registrado tu asistencia hoy para esta clase' },
        { status: 400 }
      );
    }

    // Registrar asistencia
    const nuevaAsistencia = new Attendance({
      class: claseId,
      student: session.user.id,
      date: new Date(),
      attendanceCode: codigoValido._id
    });

    await nuevaAsistencia.save();

    return NextResponse.json({ 
      message: 'Asistencia registrada correctamente',
      attendance: nuevaAsistencia
    });
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    return NextResponse.json(
      { message: 'Error al registrar asistencia' },
      { status: 500 }
    );
  }
}
