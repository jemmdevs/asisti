import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    // Buscar el usuario en la base de datos para obtener datos actualizados
    const user = await User.findById(session.user.id).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return NextResponse.json(
      { message: 'Error al obtener datos del usuario' },
      { status: 500 }
    );
  }
}
