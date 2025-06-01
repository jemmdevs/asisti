import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Class from '@/models/Class';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import { startOfDay, subDays } from 'date-fns';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'profesor') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    await connectDB();

    // Obtener todas las clases del profesor
    const classes = await Class.find({ teacher: session.user.id });
    const classIds = classes.map(cls => cls._id);

    // Contar estudiantes únicos en todas las clases
    const studentsCount = await User.countDocuments({
      classes: { $in: classIds },
      role: 'alumno'
    });

    // Calcular tasa de asistencia global
    let attendanceRate = 0;
    if (classIds.length > 0) {
      const totalAttendances = await Attendance.countDocuments({
        class: { $in: classIds }
      });

      const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
      const totalPossibleAttendances = await User.countDocuments({
        classes: { $in: classIds },
        role: 'alumno'
      }) * classes.length; // Simplificación: cada estudiante debería asistir a cada clase una vez

      attendanceRate = totalPossibleAttendances > 0 
        ? Math.round((totalAttendances / totalPossibleAttendances) * 100) 
        : 0;
    }

    // Obtener sesiones recientes (últimos 7 días)
    const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
    
    // Obtener asistencias agrupadas por clase y fecha
    const recentAttendances = await Attendance.aggregate([
      {
        $match: {
          class: { $in: classIds },
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            class: '$class',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
          },
          attendedCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Enriquecer los datos de asistencia con información de la clase
    const recentSessions = await Promise.all(
      recentAttendances.map(async (attendance) => {
        const classInfo = await Class.findById(attendance._id.class);
        const totalStudents = classInfo.students.length;
        
        return {
          className: classInfo.name,
          date: attendance._id.date,
          attendedCount: attendance.attendedCount,
          totalStudents,
          rate: totalStudents > 0 ? Math.round((attendance.attendedCount / totalStudents) * 100) : 0
        };
      })
    );

    return NextResponse.json({
      totalClasses: classes.length,
      totalStudents: studentsCount,
      attendanceRate,
      recentSessions
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { message: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
