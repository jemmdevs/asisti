'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiUsers, FiClock, FiCalendar, FiCheckCircle } from 'react-icons/fi';

export default function MisClasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningClass, setJoiningClass] = useState(false);
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    // Redirigir si no está autenticado
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    // Cargar clases del alumno
    if (status === 'authenticated') {
      fetchClasses();
    }
  }, [status, session, router]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clases');
      
      if (!response.ok) {
        throw new Error('Error al cargar las clases');
      }
      
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error al cargar clases:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      setJoinError('Ingresa un código de clase');
      return;
    }
    
    try {
      setJoiningClass(true);
      setJoinError(null);
      
      const response = await fetch('/api/clases/unirse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al unirse a la clase');
      }
      
      // Actualizar lista de clases
      await fetchClasses();
      
      // Cerrar modal
      setShowJoinModal(false);
      setJoinCode('');
    } catch (error) {
      console.error('Error al unirse a clase:', error);
      setJoinError(error.message);
    } finally {
      setJoiningClass(false);
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

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-500">Error: {error}</p>
          <button 
            onClick={fetchClasses}
            className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Mis Clases</h1>
          <p className="text-[var(--color-text-light)]">
            Gestiona tus clases y asistencias
          </p>
        </div>
        <button 
          onClick={() => setShowJoinModal(true)}
          className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)]"
        >
          <FiPlus className="mr-2" />
          Unirse a Clase
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-[var(--color-primary)] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="text-[var(--color-primary-dark)] text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">No estás inscrito en ninguna clase</h2>
          <p className="text-[var(--color-text-light)] mb-6">
            Únete a una clase utilizando el código proporcionado por tu profesor
          </p>
          <button 
            onClick={() => setShowJoinModal(true)}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)]"
          >
            Unirse a una Clase
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((clase) => (
            <div key={clase._id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">{clase.name}</h2>
              
              {clase.description && (
                <p className="text-[var(--color-text-light)] mb-4 line-clamp-2">
                  {clase.description}
                </p>
              )}
              
              <div className="flex items-center mb-2">
                <FiUsers className="text-[var(--color-text-light)] mr-2" />
                <span className="text-[var(--color-text-light)]">
                  Profesor: {clase.teacher?.name || 'No disponible'}
                </span>
              </div>
              
              {clase.schedule && (
                <div className="flex items-center mb-4">
                  <FiCalendar className="text-[var(--color-text-light)] mr-2" />
                  <span className="text-[var(--color-text-light)]">
                    {clase.schedule}
                  </span>
                </div>
              )}
              
              <div className="mt-6 flex space-x-3">
                <Link 
                  href={`/clases/${clase._id}`}
                  className="flex-1 text-center px-3 py-2 bg-[var(--color-background-light)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-background-dark)]"
                >
                  Ver Detalles
                </Link>
                <Link 
                  href={`/asistencia/registrar?clase=${clase._id}`}
                  className="flex-1 text-center px-3 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)]"
                >
                  Registrar Asistencia
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para unirse a una clase */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">Unirse a una Clase</h3>
            
            {joinError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{joinError}</p>
              </div>
            )}
            
            <form onSubmit={handleJoinClass}>
              <div className="mb-4">
                <label htmlFor="joinCode" className="block text-[var(--color-text)] font-medium mb-2">
                  Código de la Clase
                </label>
                <input
                  type="text"
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="Ingresa el código de la clase"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                    setJoinError(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={joiningClass}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
                >
                  {joiningClass ? 'Uniéndose...' : 'Unirse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
