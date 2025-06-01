import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import mongoose from 'mongoose';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

// GET - Obtener historial de asistencias
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

    // Construir el filtro de consulta
    const query = { class: claseId };

    // Filtrar por alumno si es profesor y se especifica un alumno
    const alumnoId = searchParams.get('alumno');
    if (isTeacher && alumnoId && mongoose.Types.ObjectId.isValid(alumnoId)) {
      query.student = alumnoId;
    } else if (isStudent) {
      // Si es alumno, solo mostrar sus propias asistencias
      query.student = session.user.id;
    }

    // Filtrar por rango de fechas si se especifica
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    
    if (fechaInicio && fechaFin) {
      query.date = {
        $gte: startOfDay(parseISO(fechaInicio)),
        $lte: endOfDay(parseISO(fechaFin))
      };
    }

    // Obtener asistencias
    const asistencias = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('student', 'name email')
      .populate('class', 'name');

    // Calcular total de registros esperados (para estadísticas)
    let total = 0;
    
    if (isTeacher) {
      if (alumnoId) {
        // Total para un alumno específico
        total = 1; // Simplificación: asumimos un registro por día
      } else {
        // Total para todos los alumnos
        const totalAlumnos = classData.students.length;
        total = totalAlumnos; // Simplificación: asumimos un registro por día para cada alumno
      }
    } else if (isStudent) {
      // Total para el alumno actual
      total = 1; // Simplificación: asumimos un registro por día
    }

    return NextResponse.json({
      asistencias,
      total
    });
  } catch (error) {
    console.error('Error al obtener historial de asistencias:', error);
    return NextResponse.json(
      { message: 'Error al obtener historial de asistencias' },
      { status: 500 }
    );
  }
}

// POST - Marcar asistencia o falta manualmente (solo para profesores)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'profesor') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { claseId, alumnoId, fecha, estado, justificacion } = await request.json();

    if (!claseId || !mongoose.Types.ObjectId.isValid(claseId) || 
        !alumnoId || !mongoose.Types.ObjectId.isValid(alumnoId) || 
        !fecha) {
      return NextResponse.json(
        { message: 'Datos incompletos o inválidos' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar que la clase exista y pertenezca al profesor
    const classData = await Class.findOne({
      _id: claseId,
      teacher: session.user.id
    });

    if (!classData) {
      return NextResponse.json(
        { message: 'Clase no encontrada o no tienes permiso para modificar asistencias' },
        { status: 404 }
      );
    }

    // Verificar que el alumno pertenezca a la clase
    const alumnoEnClase = classData.students.includes(alumnoId);
    if (!alumnoEnClase) {
      return NextResponse.json(
        { message: 'El alumno no pertenece a esta clase' },
        { status: 400 }
      );
    }

    const fechaAsistencia = new Date(fecha);
    
    // Si es asistencia, crear un nuevo registro
    if (estado === 'asistio') {
      // Verificar si ya existe un registro para este alumno en esta fecha
      const asistenciaExistente = await Attendance.findOne({
        class: claseId,
        student: alumnoId,
        date: {
          $gte: startOfDay(fechaAsistencia),
          $lte: endOfDay(fechaAsistencia)
        }
      });

      if (asistenciaExistente) {
        return NextResponse.json(
          { message: 'Ya existe un registro de asistencia para este alumno en esta fecha' },
          { status: 400 }
        );
      }

      // Crear nuevo registro de asistencia
      const nuevaAsistencia = new Attendance({
        class: claseId,
        student: alumnoId,
        date: fechaAsistencia,
        justified: false
      });

      await nuevaAsistencia.save();

      return NextResponse.json({
        message: 'Asistencia registrada correctamente',
        attendance: nuevaAsistencia
      });
    } 
    // Si es falta justificada, actualizar el registro existente
    else if (estado === 'justificada') {
      // Buscar el registro de asistencia para actualizar
      const asistencia = await Attendance.findOne({
        class: claseId,
        student: alumnoId,
        date: {
          $gte: startOfDay(fechaAsistencia),
          $lte: endOfDay(fechaAsistencia)
        }
      });

      if (!asistencia) {
        return NextResponse.json(
          { message: 'No se encontró registro de asistencia para justificar' },
          { status: 404 }
        );
      }

      // Actualizar justificación
      asistencia.justified = true;
      asistencia.justification = justificacion || 'Justificada por el profesor';
      await asistencia.save();

      return NextResponse.json({
        message: 'Falta justificada correctamente',
        attendance: asistencia
      });
    }

    return NextResponse.json(
      { message: 'Estado de asistencia no válido' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error al modificar asistencia:', error);
    return NextResponse.json(
      { message: 'Error al modificar asistencia' },
      { status: 500 }
    );
  }
}
