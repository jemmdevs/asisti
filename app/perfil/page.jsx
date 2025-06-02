'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiMail, FiCalendar, FiUsers, FiEdit, FiKey } from 'react-icons/fi';

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalClases: 0,
    asistenciaPromedio: 0,
    // Solo para profesores
    totalAlumnos: 0,
  });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    // Redirigir si no está autenticado
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    // Cargar datos del usuario
    if (status === 'authenticated') {
      fetchUserData();
      fetchUserStats();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/me');
      
      if (!response.ok) {
        throw new Error('Error al cargar datos del usuario');
      }
      
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Diferentes endpoints según el rol
      const endpoint = session.user.role === 'profesor' 
        ? '/api/dashboard/stats' 
        : '/api/users/stats';
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        return; // No mostrar error, simplemente no cargar estadísticas
      }
      
      const data = await response.json();
      
      if (session.user.role === 'profesor') {
        setStats({
          totalClases: data.totalClasses || 0,
          totalAlumnos: data.totalStudents || 0,
          asistenciaPromedio: data.attendanceRate || 0,
        });
      } else {
        setStats({
          totalClases: data.totalClasses || 0,
          asistenciaPromedio: data.attendanceRate || 0,
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setPasswordError(null);
      
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar la contraseña');
      }
      
      // Mostrar mensaje de éxito
      setPasswordSuccess(true);
      
      // Limpiar formulario
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setPasswordError(error.message);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-[var(--color-text-light)]">Cargando...</p>
        </div>
      </div>
    );
  }

  const isProfesor = session?.user?.role === 'profesor';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <Link href={isProfesor ? "/dashboard" : "/mis-clases"} className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Mi Perfil</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
          <div className="bg-[var(--color-primary)] text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mb-4 md:mb-0 md:mr-6">
            {userData?.name?.charAt(0) || session?.user?.name?.charAt(0) || '?'}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">
              {userData?.name || session?.user?.name}
            </h2>
            <p className="text-[var(--color-text-light)] mb-2">
              {isProfesor ? 'Profesor' : 'Alumno'}
            </p>
            <div className="flex items-center text-[var(--color-text-light)]">
              <FiMail className="mr-2" />
              <span>{userData?.email || session?.user?.email}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">Estadísticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--color-background-light)] p-4 rounded-md">
              <p className="text-sm font-medium text-[var(--color-text-light)] mb-1">
                Total de clases:
              </p>
              <p className="text-2xl font-bold text-[var(--color-text)]">
                {stats.totalClases}
              </p>
            </div>
            
            <div className="bg-[var(--color-background-light)] p-4 rounded-md">
              <p className="text-sm font-medium text-[var(--color-text-light)] mb-1">
                Asistencia promedio:
              </p>
              <p className={`text-2xl font-bold ${
                stats.asistenciaPromedio < 50 
                  ? 'text-red-500' 
                  : stats.asistenciaPromedio < 75 
                    ? 'text-yellow-500' 
                    : 'text-green-500'
              }`}>
                {stats.asistenciaPromedio}%
              </p>
            </div>
            
            {isProfesor && (
              <div className="bg-[var(--color-background-light)] p-4 rounded-md">
                <p className="text-sm font-medium text-[var(--color-text-light)] mb-1">
                  Total de alumnos:
                </p>
                <p className="text-2xl font-bold text-[var(--color-text)]">
                  {stats.totalAlumnos}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">Acciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="flex items-center justify-center px-4 py-3 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)]"
            >
              <FiKey className="mr-2" />
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal para cambiar contraseña */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">Cambiar Contraseña</h3>
            
            {passwordError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{passwordError}</p>
              </div>
            )}
            
            {passwordSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p>Contraseña cambiada exitosamente</p>
              </div>
            )}
            
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-[var(--color-text)] font-medium mb-2">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-[var(--color-text)] font-medium mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-[var(--color-text)] font-medium mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordError(null);
                    setPasswordSuccess(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)]"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
