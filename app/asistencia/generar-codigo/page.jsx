'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiRefreshCw, FiCopy, FiClock } from 'react-icons/fi';
import Link from 'next/link';

export default function GenerarCodigoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const claseId = searchParams.get('clase');
  
  const [clases, setClases] = useState([]);
  const [selectedClase, setSelectedClase] = useState(claseId || '');
  const [codigo, setCodigo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [intervalo, setIntervalo] = useState(null);

  useEffect(() => {
    // Redirigir si no está autenticado o no es profesor
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'profesor') {
      router.push('/mis-clases');
    }

    // Cargar clases del profesor
    if (status === 'authenticated' && session?.user?.role === 'profesor') {
      fetchClases();
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [status, session, router]);

  useEffect(() => {
    // Si hay un claseId en la URL y ya tenemos las clases cargadas, seleccionarla
    if (claseId && clases.length > 0) {
      setSelectedClase(claseId);
      
      // Verificar si la clase existe
      const claseExiste = clases.some(clase => clase._id === claseId);
      if (claseExiste) {
        verificarCodigoActivo(claseId);
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
    } catch (error) {
      console.error('Error al cargar clases:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const verificarCodigoActivo = async (claseId) => {
    try {
      const response = await fetch(`/api/asistencia/codigo?clase=${claseId}`);
      
      if (!response.ok) {
        if (response.status !== 404) {
          throw new Error('Error al verificar código activo');
        }
        return;
      }
      
      const data = await response.json();
      
      if (data && data.active) {
        setCodigo(data);
        
        // Calcular tiempo restante
        const ahora = new Date();
        const expiracion = new Date(data.expiresAt);
        const tiempoMs = expiracion - ahora;
        
        if (tiempoMs > 0) {
          setTiempoRestante(Math.floor(tiempoMs / 1000));
          
          // Iniciar contador
          const nuevoIntervalo = setInterval(() => {
            setTiempoRestante(prev => {
              if (prev <= 1) {
                clearInterval(nuevoIntervalo);
                setCodigo(null);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          setIntervalo(nuevoIntervalo);
        }
      }
    } catch (error) {
      console.error('Error al verificar código activo:', error);
    }
  };

  const handleClaseChange = (e) => {
    const nuevoClaseId = e.target.value;
    setSelectedClase(nuevoClaseId);
    
    if (intervalo) {
      clearInterval(intervalo);
      setIntervalo(null);
    }
    
    setCodigo(null);
    setTiempoRestante(0);
    
    if (nuevoClaseId) {
      verificarCodigoActivo(nuevoClaseId);
    }
  };

  const generarCodigo = async () => {
    if (!selectedClase) {
      setError('Selecciona una clase para generar el código');
      return;
    }
    
    try {
      setGenerando(true);
      setError(null);
      
      // Limpiar intervalo anterior si existe
      if (intervalo) {
        clearInterval(intervalo);
        setIntervalo(null);
      }
      
      const response = await fetch('/api/asistencia/codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claseId: selectedClase,
          duracion: 15 // Duración en minutos
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar código');
      }
      
      const data = await response.json();
      setCodigo(data);
      
      // Calcular tiempo restante y configurar contador
      const ahora = new Date();
      const expiracion = new Date(data.expiresAt);
      const tiempoMs = expiracion - ahora;
      
      if (tiempoMs > 0) {
        setTiempoRestante(Math.floor(tiempoMs / 1000));
        
        const nuevoIntervalo = setInterval(() => {
          setTiempoRestante(prev => {
            if (prev <= 1) {
              clearInterval(nuevoIntervalo);
              setCodigo(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        setIntervalo(nuevoIntervalo);
      }
    } catch (error) {
      console.error('Error al generar código:', error);
      setError(error.message);
    } finally {
      setGenerando(false);
    }
  };

  const copiarCodigo = () => {
    if (!codigo) return;
    
    navigator.clipboard.writeText(codigo.code)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
      });
  };

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs < 10 ? '0' : ''}${segs}`;
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
        <Link href="/clases" className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver a mis clases
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Generar Código de Asistencia</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="clase" className="block text-[var(--color-text)] font-medium mb-2">
            Selecciona una Clase
          </label>
          <select
            id="clase"
            value={selectedClase}
            onChange={handleClaseChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            disabled={generando}
          >
            <option value="">-- Selecciona una clase --</option>
            {clases.map(clase => (
              <option key={clase._id} value={clase._id}>
                {clase.name}
              </option>
            ))}
          </select>
        </div>
        
        {codigo ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="text-[var(--color-text-light)] mb-2">Código de asistencia:</div>
              <div className="text-6xl font-bold text-[var(--color-primary-dark)] tracking-wider mb-2">
                {codigo.code}
              </div>
              <button 
                onClick={copiarCodigo}
                className="flex items-center mx-auto text-[var(--color-primary-dark)] hover:underline"
              >
                <FiCopy className="mr-1" />
                {copiado ? 'Copiado!' : 'Copiar código'}
              </button>
            </div>
            
            <div className="flex items-center justify-center text-[var(--color-text-light)] mb-6">
              <FiClock className="mr-2" />
              <span>Expira en: {formatearTiempo(tiempoRestante)}</span>
            </div>
            
            <button
              onClick={generarCodigo}
              disabled={generando}
              className="flex items-center mx-auto px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              <FiRefreshCw className="mr-2" />
              {generando ? 'Generando...' : 'Generar Nuevo Código'}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[var(--color-text-light)] mb-6">
              {selectedClase 
                ? 'No hay código activo para esta clase. Genera uno nuevo para que los alumnos registren su asistencia.' 
                : 'Selecciona una clase para generar un código de asistencia.'}
            </p>
            
            {selectedClase && (
              <button
                onClick={generarCodigo}
                disabled={generando || !selectedClase}
                className="flex items-center mx-auto px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
              >
                {generando ? 'Generando...' : 'Generar Código'}
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Instrucciones</h2>
        <ul className="list-disc pl-5 space-y-2 text-[var(--color-text-light)]">
          <li>El código generado será válido durante 15 minutos.</li>
          <li>Comparte el código con tus estudiantes para que registren su asistencia.</li>
          <li>Los estudiantes deben ingresar el código en la sección "Registrar Asistencia" de su aplicación.</li>
          <li>Puedes generar un nuevo código en cualquier momento, pero esto invalidará el código anterior.</li>
          <li>Una vez expirado el código, los estudiantes no podrán registrar su asistencia con ese código.</li>
        </ul>
      </div>
    </div>
  );
}
