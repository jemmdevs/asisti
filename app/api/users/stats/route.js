import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    // Obtener el usuario actual
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener las clases a las que pertenece el usuario
    const classes = await Class.find({ students: session.user.id });
    const classIds = classes.map(cls => cls._id);

    // Calcular tasa de asistencia
    let attendanceRate = 0;
    let totalAttendedCount = 0;
    let totalSessionsCount = 0;

    // Obtener todas las asistencias del usuario agrupadas por clase y fecha
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          student: user._id,
          presente: { $ne: false } // Solo contar asistencias marcadas como presentes
        }
      },
      {
        $group: {
          _id: {
            class: '$class',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Contar asistencias
    totalAttendedCount = attendanceStats.length;

    // Contar total de sesiones posibles (una por cada clase y fecha única)
    const allSessions = await Attendance.aggregate([
      {
        $match: {
          class: { $in: classIds }
        }
      },
      {
        $group: {
          _id: {
            class: '$class',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
          }
        }
      }
    ]);

    totalSessionsCount = allSessions.length;

    // Calcular tasa de asistencia
    attendanceRate = totalSessionsCount > 0 
      ? Math.min(100, Math.round((totalAttendedCount / totalSessionsCount) * 100))
      : 0;

    return NextResponse.json({
      totalClasses: classIds.length,
      attendanceRate
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del usuario:', error);
    return NextResponse.json(
      { message: 'Error al obtener estadísticas del usuario' },
      { status: 500 }
    );
  }
}
