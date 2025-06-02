import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// Asegurarnos de que esta ruta sea accesible
export const dynamic = 'force-dynamic';

// Endpoint para que un alumno salga de una clase
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar autenticación
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar que el usuario sea alumno
    if (session.user.role !== 'alumno') {
      return NextResponse.json(
        { message: 'Solo los alumnos pueden salir de una clase' },
        { status: 403 }
      );
    }
    
    // Obtener datos del cuerpo de la solicitud
    const data = await request.json();
    const { classId } = data;
    
    if (!classId) {
      return NextResponse.json(
        { message: 'ID de clase es requerido' },
        { status: 400 }
      );
    }
    
    // Validar ID
    if (!ObjectId.isValid(classId)) {
      return NextResponse.json(
        { message: 'ID de clase inválido' },
        { status: 400 }
      );
    }
    
    await connectDB();
    const db = mongoose.connection.db;
    
    // Verificar que la clase exista y el alumno esté en ella
    const clase = await db.collection('classes').findOne({
      _id: new ObjectId(classId),
      'students._id': session.user.id
    });
    
    if (!clase) {
      return NextResponse.json(
        { message: 'Clase no encontrada o no estás inscrito en esta clase' },
        { status: 404 }
      );
    }
    
    // Eliminar al alumno de la clase
    const result = await db.collection('classes').updateOne(
      { _id: new ObjectId(classId) },
      { $pull: { students: { _id: session.user.id } } }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'No se pudo salir de la clase' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Has salido de la clase correctamente' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error al salir de la clase:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
