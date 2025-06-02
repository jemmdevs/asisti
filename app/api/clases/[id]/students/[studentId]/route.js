import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// Endpoint para eliminar un alumno de una clase
export async function DELETE(request, { params }) {
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
        { message: 'Solo los profesores pueden eliminar alumnos de una clase' },
        { status: 403 }
      );
    }
    
    const { id, studentId } = params;
    
    // Validar IDs
    if (!ObjectId.isValid(id) || !ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { message: 'ID de clase o alumno inválido' },
        { status: 400 }
      );
    }
    
    await connectDB();
    const db = mongoose.connection.db;
    
    // Verificar que la clase exista y pertenezca al profesor
    const clase = await db.collection('classes').findOne({
      _id: new ObjectId(id),
      'teacher._id': session.user.id.toString()
    });
    
    if (!clase) {
      return NextResponse.json(
        { message: 'Clase no encontrada o no tienes permisos para modificarla' },
        { status: 404 }
      );
    }
    
    // Verificar que el alumno esté en la clase
    const studentInClass = clase.students.some(student => 
      student._id.toString() === studentId
    );
    
    if (!studentInClass) {
      return NextResponse.json(
        { message: 'El alumno no está inscrito en esta clase' },
        { status: 404 }
      );
    }
    
    // Eliminar al alumno de la clase
    const result = await db.collection('classes').updateOne(
      { _id: new ObjectId(id) },
      { $pull: { students: { _id: new ObjectId(studentId) } } }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'No se pudo eliminar al alumno de la clase' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Alumno eliminado de la clase correctamente' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error al eliminar alumno de la clase:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
