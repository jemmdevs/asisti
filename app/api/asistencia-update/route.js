import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// Asegurarnos de que esta ruta sea accesible
export const dynamic = 'force-dynamic';

// Endpoint para actualizar el estado de asistencia
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar autenticación
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar que el usuario sea profesor
    if (session.user.role !== 'profesor') {
      return NextResponse.json(
        { message: 'Solo los profesores pueden modificar la asistencia' },
        { status: 403 }
      );
    }
    
    // Obtener datos del cuerpo de la solicitud
    const data = await request.json();
    const { id, presente } = data;
    
    if (!id || presente === undefined) {
      return NextResponse.json(
        { message: 'ID de asistencia y estado son requeridos' },
        { status: 400 }
      );
    }
    
    // Validar ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'ID de asistencia inválido' },
        { status: 400 }
      );
    }
    
    await connectDB();
    const db = mongoose.connection.db;
    
    // Obtener la asistencia para verificar permisos
    const asistencia = await db.collection('attendance').findOne({
      _id: new ObjectId(id)
    });
    
    if (!asistencia) {
      return NextResponse.json(
        { message: 'Registro de asistencia no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar que el profesor tenga permisos para modificar esta asistencia
    const clase = await db.collection('classes').findOne({
      _id: new ObjectId(asistencia.classId),
      'teacher._id': session.user.id.toString()
    });
    
    if (!clase) {
      return NextResponse.json(
        { message: 'No tienes permisos para modificar esta asistencia' },
        { status: 403 }
      );
    }
    
    // Actualizar el estado de asistencia
    const result = await db.collection('attendance').updateOne(
      { _id: new ObjectId(id) },
      { $set: { presente } }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'No se pudo actualizar el estado de asistencia' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Estado de asistencia actualizado correctamente' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error al actualizar estado de asistencia:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
