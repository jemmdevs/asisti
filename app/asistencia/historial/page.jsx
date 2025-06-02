'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCalendar, FiFilter, FiDownload, FiCheck, FiX } from 'react-icons/fi';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HistorialAsistenciaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [clases, setClases] = useState([]);
  const [selectedClase, setSelectedClase] = useState('');
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroFecha, setFiltroFecha] = useState('todo');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroAlumno, setFiltroAlumno] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    asistencias: 0,
    faltas: 0,
    porcentaje: 0
  });
  // Eliminada funcionalidad de cambiar estado de asistencia
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Redirigir si no está autenticado
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    // Cargar clases según el rol
    if (status === 'authenticated') {
      fetchClases();
    }
  }, [status, session, router]);

  useEffect(() => {
    // Cuando se selecciona una clase, cargar sus asistencias
    if (selectedClase) {
      fetchAsistencias();
      if (session?.user?.role === 'profesor') {
        fetchAlumnos();
      }
    } else {
      setAsistencias([]);
      setAlumnos([]);
      setEstadisticas({
        total: 0,
        asistencias: 0,
        faltas: 0,
        porcentaje: 0
      });
    }
  }, [selectedClase, filtroFecha, fechaInicio, fechaFin, filtroAlumno]);

  const fetchClases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clases');
      
      if (!response.ok) {
        throw new Error('Error al cargar las clases');
      }
      
      const data = await response.json();
      setClases(data);
      
      // Si solo hay una clase, seleccionarla automáticamente
      if (data.length === 1) {
        setSelectedClase(data[0]._id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar clases:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const response = await fetch(`/api/clases/${selectedClase}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar información de la clase');
      }
      
      const data = await response.json();
      setAlumnos(data.students || []);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
    }
  };

  const fetchAsistencias = async () => {
    try {
      setLoading(true);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      params.append('clase', selectedClase);
      
      // Aplicar filtro de fecha
      if (filtroFecha === 'personalizado' && fechaInicio && fechaFin) {
        params.append('fechaInicio', fechaInicio);
        params.append('fechaFin', fechaFin);
      } else if (filtroFecha === 'mes') {
        const inicio = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const fin = format(endOfMonth(new Date()), 'yyyy-MM-dd');
        params.append('fechaInicio', inicio);
        params.append('fechaFin', fin);
      } else if (filtroFecha === 'semana') {
        const inicio = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const fin = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        params.append('fechaInicio', inicio);
        params.append('fechaFin', fin);
      }
      
      // Aplicar filtro de alumno (solo para profesores)
      if (session?.user?.role === 'profesor' && filtroAlumno) {
        params.append('alumno', filtroAlumno);
      }
      
      const response = await fetch(`/api/asistencia/historial?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el historial de asistencias');
      }
      
      const data = await response.json();
      setAsistencias(data.asistencias || []);
      
      // Calcular estadísticas
      // El total debe ser el número de registros de asistencia posibles (días de clase × alumnos)
      // y no el número de registros existentes
      const registrosExistentes = data.asistencias?.length || 0;
      const totalPosiblesRegistros = data.total || registrosExistentes; // Usar el total de la API o el número de registros si no hay total
      const asistencias = data.asistencias?.filter(a => a.presente !== false)?.length || 0;
      const faltas = registrosExistentes - asistencias;
      // Asegurarnos de que el porcentaje nunca supere el 100%
      const porcentaje = totalPosiblesRegistros > 0 ? Math.min(100, Math.round((asistencias / totalPosiblesRegistros) * 100)) : 0;
      
      setEstadisticas({
        total: totalPosiblesRegistros,
        asistencias,
        faltas,
        porcentaje
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleClaseChange = (e) => {
    setSelectedClase(e.target.value);
    setFiltroAlumno('');
  };

  const handleFiltroFechaChange = (e) => {
    setFiltroFecha(e.target.value);
    
    // Resetear fechas personalizadas si no se selecciona "personalizado"
    if (e.target.value !== 'personalizado') {
      setFechaInicio('');
      setFechaFin('');
    }
  };

  const handleExportarCSV = () => {
    if (!asistencias.length) return;
    
    // Preparar datos para CSV
    const data = asistencias.map(a => ({
      fecha: format(parseISO(a.date), 'dd/MM/yyyy', { locale: es }),
      hora: format(parseISO(a.date), 'HH:mm', { locale: es }),
      alumno: a.student?.name || 'Desconocido',
      clase: a.class?.name || 'Desconocida',
      estado: 'Asistió'
    }));
    
    // Crear CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    // Crear y descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `asistencia_${selectedClase}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Eliminada funcionalidad de cambiar estado de asistencia

  if (status === 'loading' || (loading && !asistencias.length)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-[var(--color-text-light)]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          href={session?.user?.role === 'profesor' ? '/dashboard' : '/mis-clases'} 
          className="flex items-center text-[var(--color-primary-dark)] hover:underline"
        >
          <FiArrowLeft className="mr-2" />
          {session?.user?.role === 'profesor' ? 'Volver al dashboard' : 'Volver a mis clases'}
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Historial de Asistencias</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label htmlFor="clase" className="block text-[var(--color-text)] font-medium mb-2">
              Clase
            </label>
            <select
              id="clase"
              value={selectedClase}
              onChange={handleClaseChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            >
              <option value="">-- Selecciona una clase --</option>
              {clases.map(clase => (
                <option key={clase._id} value={clase._id}>
                  {clase.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="filtroFecha" className="block text-[var(--color-text)] font-medium mb-2">
              Periodo
            </label>
            <select
              id="filtroFecha"
              value={filtroFecha}
              onChange={handleFiltroFechaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              disabled={!selectedClase}
            >
              <option value="todo">Todo el historial</option>
              <option value="mes">Este mes</option>
              <option value="semana">Esta semana</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          
          {filtroFecha === 'personalizado' && (
            <>
              <div>
                <label htmlFor="fechaInicio" className="block text-[var(--color-text)] font-medium mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  id="fechaInicio"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  disabled={!selectedClase}
                />
              </div>
              
              <div>
                <label htmlFor="fechaFin" className="block text-[var(--color-text)] font-medium mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  id="fechaFin"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  disabled={!selectedClase}
                />
              </div>
            </>
          )}
          
          {session?.user?.role === 'profesor' && (
            <div className={filtroFecha === 'personalizado' ? 'lg:col-span-4' : ''}>
              <label htmlFor="filtroAlumno" className="block text-[var(--color-text)] font-medium mb-2">
                Alumno
              </label>
              <select
                id="filtroAlumno"
                value={filtroAlumno}
                onChange={(e) => setFiltroAlumno(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                disabled={!selectedClase}
              >
                <option value="">Todos los alumnos</option>
                {alumnos.map(alumno => (
                  <option key={alumno._id} value={alumno._id}>
                    {alumno.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {selectedClase && (
          <div className="flex justify-end">
            <button
              onClick={handleExportarCSV}
              disabled={asistencias.length === 0}
              className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              <FiDownload className="mr-2" />
              Exportar CSV
            </button>
          </div>
        )}
      </div>
      
      {selectedClase && (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-[var(--color-text)]">Total Registros</h2>
                <div className="w-10 h-10 bg-[var(--color-primary)] bg-opacity-20 rounded-full flex items-center justify-center">
                  <FiCalendar className="text-[var(--color-primary-dark)] text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--color-text)]">{estadisticas.total}</p>
              <p className="text-sm text-[var(--color-text-light)] mt-2">Registros esperados</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-[var(--color-text)]">Asistencias</h2>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheck className="text-green-600 text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--color-text)]">{estadisticas.asistencias}</p>
              <p className="text-sm text-[var(--color-text-light)] mt-2">Registros de asistencia</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-[var(--color-text)]">Faltas</h2>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FiX className="text-red-600 text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--color-text)]">{estadisticas.faltas}</p>
              <p className="text-sm text-[var(--color-text-light)] mt-2">Ausencias</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-[var(--color-text)]">Porcentaje</h2>
                <div className="w-10 h-10 bg-[var(--color-primary)] bg-opacity-20 rounded-full flex items-center justify-center">
                  <FiFilter className="text-[var(--color-primary-dark)] text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--color-text)]">{estadisticas.porcentaje}%</p>
              <p className="text-sm text-[var(--color-text-light)] mt-2">Tasa de asistencia</p>
            </div>
          </div>
          
          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>{successMessage}</p>
            </div>
          )}
          
          {/* Tabla de asistencias */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Registros de Asistencia</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-[var(--color-text-light)]">Cargando asistencias...</p>
              </div>
            ) : asistencias.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[var(--color-background-light)]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                        Hora
                      </th>
                      {session?.user?.role === 'profesor' && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                          Alumno
                        </th>
                      )}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {asistencias.map((asistencia) => (
                      <tr key={asistencia._id} className="hover:bg-[var(--color-background-light)]">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text)]">
                          {format(parseISO(asistencia.date), 'dd/MM/yyyy', { locale: es })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-light)]">
                          {format(parseISO(asistencia.date), 'HH:mm', { locale: es })}
                        </td>
                        {session?.user?.role === 'profesor' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-light)]">
                            {asistencia.student?.name || 'Desconocido'}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {asistencia.presente !== false ? (
                            <div className="flex items-center space-x-2">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Asistió
                              </span>
                              {/* Eliminada funcionalidad de cambiar estado de asistencia */}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Ausente
                              </span>
                              {/* Eliminada funcionalidad de cambiar estado de asistencia */}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[var(--color-text-light)]">No hay registros de asistencia para los filtros seleccionados</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
