'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';

export default function CrearClasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirigir si no está autenticado o no es profesor
  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  if (status === 'authenticated' && session?.user?.role !== 'profesor') {
    router.push('/mis-clases');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre de la clase es obligatorio');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/clases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la clase');
      }
      
      router.push('/clases');
    } catch (error) {
      console.error('Error al crear clase:', error);
      setError(error.message);
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/clases" className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver a mis clases
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Crear Nueva Clase</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-[var(--color-text)] font-medium mb-2">
              Nombre de la Clase *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="Ej: Matemáticas 101"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-[var(--color-text)] font-medium mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="Breve descripción de la clase (opcional)"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label htmlFor="schedule" className="block text-[var(--color-text)] font-medium mb-2">
              Horario
            </label>
            <input
              type="text"
              id="schedule"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="Ej: Lunes y Miércoles, 10:00 - 12:00 (opcional)"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {loading ? (
                <>Creando...</>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Crear Clase
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
