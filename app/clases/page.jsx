'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiUsers, FiClock, FiEdit, FiTrash2, FiCopy } from 'react-icons/fi';

export default function ClasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [claseBorrar, setClaseBorrar] = useState(null);

  useEffect(() => {
    // Redirigir si no está autenticado o no es profesor
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'profesor') {
      router.push('/mis-clases');
    }

    // Cargar clases del profesor
    if (status === 'authenticated' && session?.user?.role === 'profesor') {
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

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
      });
  };

  const confirmarBorrado = (clase) => {
    setClaseBorrar(clase);
  };

  const borrarClase = async () => {
    if (!claseBorrar) return;
    
    try {
      const response = await fetch(`/api/clases/${claseBorrar._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la clase');
      }
      
      // Actualizar la lista de clases
      setClasses(classes.filter(c => c._id !== claseBorrar._id));
      setClaseBorrar(null);
    } catch (error) {
      console.error('Error al eliminar clase:', error);
      setError(error.message);
    }
  };

  const cancelarBorrado = () => {
    setClaseBorrar(null);
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
            Gestiona tus clases y estudiantes
          </p>
        </div>
        <Link 
          href="/clases/crear" 
          className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)]"
        >
          <FiPlus className="mr-2" />
          Nueva Clase
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-[var(--color-primary)] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="text-[var(--color-primary-dark)] text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">No tienes clases creadas</h2>
          <p className="text-[var(--color-text-light)] mb-6">
            Crea tu primera clase para comenzar a gestionar la asistencia de tus alumnos
          </p>
          <Link 
            href="/clases/crear" 
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)]"
          >
            Crear Primera Clase
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((clase) => (
            <div key={clase._id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">{clase.name}</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => router.push(`/clases/editar/${clase._id}`)}
                    className="p-1 text-[var(--color-text-light)] hover:text-[var(--color-primary-dark)]"
                    title="Editar clase"
                  >
                    <FiEdit />
                  </button>
                  <button 
                    onClick={() => confirmarBorrado(clase)}
                    className="p-1 text-[var(--color-text-light)] hover:text-red-500"
                    title="Eliminar clase"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="bg-[var(--color-background-light)] px-3 py-1 rounded-full text-sm text-[var(--color-text-light)] flex items-center">
                  <span>Código: {clase.code}</span>
                  <button 
                    onClick={() => copiarCodigo(clase.code)}
                    className="ml-2 text-[var(--color-primary-dark)]"
                    title="Copiar código"
                  >
                    <FiCopy />
                  </button>
                </div>
                {copiado && <span className="ml-2 text-xs text-green-500">¡Copiado!</span>}
              </div>
              
              <div className="flex items-center mb-4">
                <FiUsers className="text-[var(--color-text-light)] mr-2" />
                <span className="text-[var(--color-text-light)]">
                  {clase.students.length} estudiantes
                </span>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <Link 
                  href={`/clases/${clase._id}`}
                  className="flex-1 text-center px-3 py-2 bg-[var(--color-background-light)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-background-dark)]"
                >
                  Ver Detalles
                </Link>
                <Link 
                  href={`/asistencia/generar-codigo?clase=${clase._id}`}
                  className="flex-1 text-center px-3 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)]"
                >
                  Generar Código
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación de borrado */}
      {claseBorrar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">Confirmar eliminación</h3>
            <p className="text-[var(--color-text-light)] mb-6">
              ¿Estás seguro de que deseas eliminar la clase <strong>{claseBorrar.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={cancelarBorrado}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button 
                onClick={borrarClase}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
