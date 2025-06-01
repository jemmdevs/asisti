'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiUsers, FiCalendar, FiClock, FiBarChart2 } from 'react-icons/fi';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    attendanceRate: 0,
    recentSessions: []
  });

  useEffect(() => {
    // Redirigir si no está autenticado o no es profesor
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'profesor') {
      router.push('/mis-clases');
    }

    // Cargar estadísticas del profesor
    if (status === 'authenticated' && session?.user?.role === 'profesor') {
      fetchStats();
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-[var(--color-text-light)]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated' && session?.user?.role !== 'profesor') {
    return null; // Se redirigirá en el useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Dashboard del Profesor</h1>
        <p className="text-[var(--color-text-light)]">
          Bienvenido, {session?.user?.name}. Aquí tienes un resumen de tus clases y asistencias.
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[var(--color-text)]">Total de Clases</h2>
            <div className="w-10 h-10 bg-[var(--color-primary)] bg-opacity-20 rounded-full flex items-center justify-center">
              <FiCalendar className="text-[var(--color-primary-dark)] text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text)]">{stats.totalClasses}</p>
          <p className="text-sm text-[var(--color-text-light)] mt-2">Clases activas</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[var(--color-text)]">Total de Alumnos</h2>
            <div className="w-10 h-10 bg-[var(--color-primary)] bg-opacity-20 rounded-full flex items-center justify-center">
              <FiUsers className="text-[var(--color-primary-dark)] text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text)]">{stats.totalStudents}</p>
          <p className="text-sm text-[var(--color-text-light)] mt-2">En todas tus clases</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[var(--color-text)]">Tasa de Asistencia</h2>
            <div className="w-10 h-10 bg-[var(--color-primary)] bg-opacity-20 rounded-full flex items-center justify-center">
              <FiBarChart2 className="text-[var(--color-primary-dark)] text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text)]">{stats.attendanceRate}%</p>
          <p className="text-sm text-[var(--color-text-light)] mt-2">Promedio global</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[var(--color-text)]">Sesiones Recientes</h2>
            <div className="w-10 h-10 bg-[var(--color-primary)] bg-opacity-20 rounded-full flex items-center justify-center">
              <FiClock className="text-[var(--color-primary-dark)] text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text)]">{stats.recentSessions.length}</p>
          <p className="text-sm text-[var(--color-text-light)] mt-2">Últimos 7 días</p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/clases/crear" className="bg-[var(--color-background-light)] hover:bg-[var(--color-background-dark)] transition-colors p-4 rounded-md text-center">
            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-2">
              <FiCalendar className="text-[var(--color-text)] text-xl" />
            </div>
            <p className="font-medium text-[var(--color-text)]">Crear Clase</p>
          </Link>

          <Link href="/asistencia/generar-codigo" className="bg-[var(--color-background-light)] hover:bg-[var(--color-background-dark)] transition-colors p-4 rounded-md text-center">
            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-2">
              <FiClock className="text-[var(--color-text)] text-xl" />
            </div>
            <p className="font-medium text-[var(--color-text)]">Generar Código</p>
          </Link>

          <Link href="/asistencia/historial" className="bg-[var(--color-background-light)] hover:bg-[var(--color-background-dark)] transition-colors p-4 rounded-md text-center">
            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-2">
              <FiBarChart2 className="text-[var(--color-text)] text-xl" />
            </div>
            <p className="font-medium text-[var(--color-text)]">Ver Asistencias</p>
          </Link>

          <Link href="/clases" className="bg-[var(--color-background-light)] hover:bg-[var(--color-background-dark)] transition-colors p-4 rounded-md text-center">
            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-2">
              <FiUsers className="text-[var(--color-text)] text-xl" />
            </div>
            <p className="font-medium text-[var(--color-text)]">Gestionar Clases</p>
          </Link>
        </div>
      </div>

      {/* Sesiones recientes */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[var(--color-text)]">Sesiones Recientes</h2>
          <Link href="/asistencia/historial" className="text-sm text-[var(--color-primary-dark)] hover:underline">
            Ver todas
          </Link>
        </div>

        {stats.recentSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[var(--color-background-light)]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                    Clase
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                    Asistencia
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                    Tasa
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentSessions.map((session, index) => (
                  <tr key={index} className="hover:bg-[var(--color-background-light)]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text)]">
                      {session.className}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-light)]">
                      {new Date(session.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-light)]">
                      {session.attendedCount}/{session.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        session.rate > 75 
                          ? 'bg-green-100 text-green-800' 
                          : session.rate > 50 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {session.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[var(--color-text-light)]">No hay sesiones recientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
