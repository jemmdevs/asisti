'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function EditarClasePage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = params;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Redirigir si no está autenticado o no es profesor
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'profesor') {
      router.push('/dashboard');
    }

    // Cargar datos de la clase
    if (status === 'authenticated' && session?.user?.role === 'profesor' && id) {
      fetchClaseDetails();
    }
  }, [status, session, id, router]);

  const fetchClaseDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clases/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los detalles de la clase');
      }
      
      const data = await response.json();
      
      // Verificar si el usuario es el profesor de la clase
      if (data.teacher?._id !== session.user.id) {
        setError('No tienes permiso para editar esta clase');
        setLoading(false);
        return;
      }
      
      setFormData({
        name: data.name || '',
        description: data.description || '',
        schedule: data.schedule || ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar detalles de la clase:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name.trim()) {
      setError('El nombre de la clase es obligatorio');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`/api/clases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la clase');
      }
      
      setSuccess('Clase actualizada correctamente');
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        router.push(`/clases/${id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error al actualizar la clase:', error);
      setError(error.message);
    } finally {
      setSaving(false);
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href={`/clases/${id}`} className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver a detalles de la clase
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Editar Clase</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>{success}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-[var(--color-text)] font-medium mb-2">
              Nombre de la Clase*
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
              placeholder="Descripción breve de la clase (opcional)"
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
              placeholder="Ej: Lunes y Miércoles 10:00 - 12:00"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {saving ? (
                <>Guardando...</>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
