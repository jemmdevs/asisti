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
      // Obtener todas las asistencias agrupadas por clase y fecha para calcular correctamente
      const attendanceStats = await Attendance.aggregate([
        {
          $match: {
            class: { $in: classIds },
            presente: { $ne: false } // Solo contar asistencias marcadas como presentes
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
        }
      ]);
      
      // Para cada clase y fecha, calcular la tasa de asistencia
      let totalAttendedCount = 0;
      let totalStudentsCount = 0;
      
      // Procesar cada sesión (clase + fecha)
      await Promise.all(attendanceStats.map(async (stat) => {
        const classInfo = await Class.findById(stat._id.class);
        if (classInfo && classInfo.students) {
          // Contar estudiantes que asistieron a esta sesión
          totalAttendedCount += stat.attendedCount;
          // Contar el total de estudiantes que deberían haber asistido
          totalStudentsCount += classInfo.students.length;
        }
      }));
      
      // Calcular la tasa de asistencia global como porcentaje de asistencias sobre el total posible
      attendanceRate = totalStudentsCount > 0 
        ? Math.min(100, Math.round((totalAttendedCount / totalStudentsCount) * 100))
        : 0;
    }

    // Obtener sesiones recientes (últimos 7 días)
    const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
    
    // Obtener asistencias agrupadas por clase y fecha
    const recentAttendances = await Attendance.aggregate([
      {
        $match: {
          class: { $in: classIds },
          date: { $gte: sevenDaysAgo },
          presente: { $ne: false } // Solo contar asistencias marcadas como presentes
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
          rate: totalStudents > 0 ? Math.min(100, Math.round((attendance.attendedCount / totalStudents) * 100)) : 0
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
