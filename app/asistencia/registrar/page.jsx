'use client';

import { Suspense } from 'react';
import { FiArrowLeft, FiCheck, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// Componente principal que no usa useSearchParams directamente
export default function RegistrarAsistenciaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver al dashboard
        </Link>
      </div>
      
      <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
        <RegistrarAsistenciaContent />
      </Suspense>
    </div>
  );
}

// Componente cliente que usa useSearchParams
function RegistrarAsistenciaContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const claseId = searchParams.get('clase');
  
  const [clases, setClases] = useState([]);
  const [selectedClase, setSelectedClase] = useState(claseId || '');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [claseInfo, setClaseInfo] = useState(null);

  useEffect(() => {
    // Redirigir si no está autenticado o no es alumno
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'alumno') {
      router.push('/dashboard');
    }

    // Cargar clases del alumno
    if (status === 'authenticated' && session?.user?.role === 'alumno') {
      fetchClases();
    }
  }, [status, session, router]);

  useEffect(() => {
    // Si hay un claseId en la URL y ya tenemos las clases cargadas, seleccionarla
    if (claseId && clases.length > 0) {
      setSelectedClase(claseId);
      
      // Verificar si la clase existe
      const claseExiste = clases.some(clase => clase._id === claseId);
      if (claseExiste) {
        fetchClaseInfo(claseId);
      }
    }
  }, [claseId, clases]);

  const fetchClases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clases');
      
      if (!response.ok) {
        throw new Error('Error al cargar las clases');
      }
      
      const data = await response.json();
      setClases(data);
      setLoading(false);
      
      // Si hay un claseId en la URL, verificar si existe
      if (claseId) {
        const claseExiste = data.some(clase => clase._id === claseId);
        if (claseExiste) {
          setSelectedClase(claseId);
          fetchClaseInfo(claseId);
        }
      }
    } catch (error) {
      console.error('Error al cargar clases:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchClaseInfo = async (id) => {
    try {
      const response = await fetch(`/api/clases/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar información de la clase');
      }
      
      const data = await response.json();
      setClaseInfo(data);
    } catch (error) {
      console.error('Error al cargar información de la clase:', error);
    }
  };

  const handleClaseChange = (e) => {
    const nuevoClaseId = e.target.value;
    setSelectedClase(nuevoClaseId);
    setError(null);
    setSuccess(null);
    
    if (nuevoClaseId) {
      fetchClaseInfo(nuevoClaseId);
    } else {
      setClaseInfo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClase) {
      setError('Selecciona una clase para registrar asistencia');
      return;
    }
    
    if (!codigo.trim()) {
      setError('Ingresa el código de asistencia');
      return;
    }
    
    try {
      setRegistrando(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/asistencia/codigo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: codigo.trim(),
          claseId: selectedClase
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar asistencia');
      }
      
      const data = await response.json();
      setSuccess(data.message || 'Asistencia registrada correctamente');
      setCodigo('');
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      setError(error.message);
    } finally {
      setRegistrando(false);
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
        <Link href="/mis-clases" className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver a mis clases
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Registrar Asistencia</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
            <FiCheck className="mr-2" />
            <p>{success}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="clase" className="block text-[var(--color-text)] font-medium mb-2">
              Selecciona una Clase
            </label>
            <select
              id="clase"
              value={selectedClase}
              onChange={handleClaseChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              disabled={registrando}
            >
              <option value="">-- Selecciona una clase --</option>
              {clases.map(clase => (
                <option key={clase._id} value={clase._id}>
                  {clase.name}
                </option>
              ))}
            </select>
          </div>
          
          {claseInfo && (
            <div className="mb-6 p-4 bg-[var(--color-background-light)] rounded-md">
              <h3 className="font-medium text-[var(--color-text)] mb-2">Información de la clase:</h3>
              <p className="text-[var(--color-text-light)] mb-1">
                <span className="font-medium">Profesor:</span> {claseInfo.teacher?.name || 'No disponible'}
              </p>
              {claseInfo.schedule && (
                <p className="text-[var(--color-text-light)]">
                  <span className="font-medium">Horario:</span> {claseInfo.schedule}
                </p>
              )}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="codigo" className="block text-[var(--color-text)] font-medium mb-2">
              Código de Asistencia
            </label>
            <input
              type="text"
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="Ingresa el código de 3 dígitos"
              maxLength="3"
              disabled={registrando || !selectedClase}
            />
            <p className="mt-2 text-sm text-[var(--color-text-light)] flex items-center">
              <FiClock className="mr-1" />
              El código es proporcionado por tu profesor y tiene una validez limitada
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={registrando || !selectedClase}
              className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {registrando ? (
                <>Registrando...</>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Registrar Asistencia
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Instrucciones</h2>
        <ul className="list-disc pl-5 space-y-2 text-[var(--color-text-light)]">
          <li>Selecciona la clase en la que deseas registrar tu asistencia.</li>
          <li>Ingresa el código de 3 dígitos proporcionado por tu profesor.</li>
          <li>El código tiene una validez limitada, generalmente de 15 minutos.</li>
          <li>Solo puedes registrar tu asistencia una vez al día para cada clase.</li>
          <li>Si tienes problemas para registrar tu asistencia, contacta a tu profesor.</li>
        </ul>
      </div>
    </div>
  );
}
