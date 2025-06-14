'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiEdit, FiTrash2, FiUsers, FiCalendar, FiClock, FiClipboard, FiBarChart2 } from 'react-icons/fi';

export default function DetalleClasePage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = params;
  
  const [clase, setClase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalSesiones: 0,
    asistenciaPromedio: 0,
    asistenciaUltimaSesion: 0,
    ultimaSesion: null
  });
  const [tipoAsistencia, setTipoAsistencia] = useState('todas'); // 'todas', 'ultima', 'fecha'
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [sesionesAgrupadas, setSesionesAgrupadas] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  // Eliminada funcionalidad de eliminar alumnos
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Redirigir si no está autenticado
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    // Cargar detalles de la clase
    if (status === 'authenticated' && id) {
      fetchClaseDetails();
    }
  }, [status, id, router]);

  const fetchClaseDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clases/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los detalles de la clase');
      }
      
      const data = await response.json();
      setClase(data);
      
      // Si hay estudiantes en la clase, guardarlos
      if (data.students && data.students.length > 0) {
        setAlumnos(data.students);
      }
      
      // Cargar estadísticas de asistencia para esta clase
      await fetchEstadisticas();
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar detalles de la clase:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const response = await fetch(`/api/asistencia/historial?clase=${id}`);
      
      if (!response.ok) {
        return; // No mostrar error, simplemente no cargar estadísticas
      }
      
      const data = await response.json();
      
      // Calcular estadísticas
      const asistencias = data.asistencias || [];
      
      // Ordenar asistencias por fecha (más reciente primero)
      asistencias.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Obtener fechas únicas de sesiones
      const fechasUnicas = [...new Set(asistencias.map(a => 
        new Date(a.date).toISOString().split('T')[0]
      ))];
      
      const totalSesiones = fechasUnicas.length || 0;
      
      // Calcular asistencia promedio de todas las sesiones
      // Primero agrupamos por fecha para calcular correctamente
      const asistenciasPorFecha = {};
      const estudiantesPorFecha = {};
      
      // Inicializar contadores por fecha
      fechasUnicas.forEach(fecha => {
        asistenciasPorFecha[fecha] = 0;
        estudiantesPorFecha[fecha] = 0;
      });
      
      // Contar asistencias por fecha
      asistencias.forEach(asistencia => {
        const fecha = new Date(asistencia.date).toISOString().split('T')[0];
        if (asistencia.presente !== false) {
          asistenciasPorFecha[fecha]++;
        }
        estudiantesPorFecha[fecha]++;
      });
      
      // Calcular promedio total (todas las fechas)
      let totalAsistencias = 0;
      let totalPosibles = 0;
      
      Object.keys(asistenciasPorFecha).forEach(fecha => {
        totalAsistencias += asistenciasPorFecha[fecha];
        totalPosibles += clase.students.length; // Usar el total de estudiantes inscritos
      });
      
      const asistenciaPromedio = totalPosibles > 0 
        ? Math.min(100, Math.round((totalAsistencias / totalPosibles) * 100)) 
        : 0;
      
      // Calcular asistencia de la última sesión
      let asistenciaUltimaSesion = 0;
      let ultimaSesion = null;
      
      if (fechasUnicas.length > 0) {
        ultimaSesion = fechasUnicas[0];
        const asistenciasUltimaSesion = asistenciasPorFecha[ultimaSesion] || 0;
        const totalEstudiantesClase = clase.students.length;
        
        asistenciaUltimaSesion = totalEstudiantesClase > 0
          ? Math.min(100, Math.round((asistenciasUltimaSesion / totalEstudiantesClase) * 100))
          : 0;
      }
      
      setEstadisticas({
        totalSesiones,
        asistenciaPromedio,
        asistenciaUltimaSesion,
        ultimaSesion,
        fechasUnicas,
        asistenciasPorFecha,
        estudiantesPorFecha
      });
      
      // Guardar las asistencias para mostrarlas
      setSesiones(asistencias);
      
      // Agrupar asistencias por fecha para mostrar sesiones
      const sesionesAgrupadas = {};
      asistencias.forEach(asistencia => {
        const fecha = new Date(asistencia.date).toLocaleDateString('es-ES');
        if (!sesionesAgrupadas[fecha]) {
          sesionesAgrupadas[fecha] = [];
        }
        sesionesAgrupadas[fecha].push(asistencia);
      });
      
      setSesionesAgrupadas(sesionesAgrupadas);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/clases/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la clase');
      }
      
      router.push('/clases');
    } catch (error) {
      console.error('Error al eliminar la clase:', error);
      setError(error.message);
    }
  };

  const handleGenerarCodigo = () => {
    router.push(`/asistencia/generar-codigo?clase=${id}`);
  };

  const handleVerHistorial = () => {
    router.push(`/asistencia/historial?clase=${id}`);
  };

  // Eliminada funcionalidad de eliminar alumnos

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <Link href="/clases" className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver a mis clases
        </Link>
      </div>
    );
  }

  if (!clase) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Clase no encontrada</p>
        </div>
        <Link href="/clases" className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver a mis clases
        </Link>
      </div>
    );
  }

  const isProfesor = session?.user?.role === 'profesor' && clase.teacher?._id === session.user.id;
  const isAlumno = session?.user?.role === 'alumno';
  
  // Función para que un alumno salga de la clase
  const handleLeaveClass = async () => {
    try {
      const response = await fetch('/api/clases/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al salir de la clase');
      }
      
      setSuccessMessage('Has salido de la clase correctamente');
      setTimeout(() => {
        router.push('/mis-clases');
      }, 2000);
    } catch (error) {
      console.error('Error al salir de la clase:', error);
      setError(error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <Link href={isProfesor ? "/clases" : "/mis-clases"} className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver a mis clases
        </Link>
        
        {isProfesor && (
          <div className="flex space-x-2">
            <Link
              href={`/clases/editar/${id}`}
              className="flex items-center px-3 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)]"
            >
              <FiEdit className="mr-2" />
              Editar
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <FiTrash2 className="mr-2" />
              Eliminar
            </button>
          </div>
        )}
        
        {isAlumno && (
          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <FiTrash2 className="mr-2" />
            Salir de la clase
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">{clase.name}</h1>
            {clase.description && (
              <p className="text-[var(--color-text-light)] mb-4">{clase.description}</p>
            )}
            <div className="flex items-center text-[var(--color-text-light)] mb-2">
              <FiCalendar className="mr-2" />
              <span>{clase.schedule || 'Horario no especificado'}</span>
            </div>
            <div className="flex items-center text-[var(--color-text-light)]">
              <FiUsers className="mr-2" />
              <span>{alumnos.length} {alumnos.length === 1 ? 'alumno' : 'alumnos'}</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="bg-[var(--color-background-light)] p-4 rounded-md">
              <p className="text-sm font-medium text-[var(--color-text-light)] mb-2">Código de la clase:</p>
              <div className="flex items-center">
                <span className="text-xl font-bold text-[var(--color-text)]">{clase.code}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(clase.code);
                    alert('Código copiado al portapapeles');
                  }}
                  className="ml-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                >
                  <FiClipboard />
                </button>
              </div>
              <p className="text-xs text-[var(--color-text-light)] mt-2">
                Comparte este código con tus alumnos para que puedan unirse a la clase
              </p>
            </div>
          </div>
        </div>
        
        {isProfesor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleGenerarCodigo}
              className="flex items-center justify-center px-4 py-3 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)]"
            >
              <FiClock className="mr-2" />
              Generar Código de Asistencia
            </button>
            <button
              onClick={handleVerHistorial}
              className="flex items-center justify-center px-4 py-3 bg-[var(--color-background-dark)] text-[var(--color-text)] rounded-md hover:bg-gray-200"
            >
              <FiBarChart2 className="mr-2" />
              Ver Historial de Asistencia
            </button>
          </div>
        )}
        
        {/* Estadísticas */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Estadísticas de Asistencia</h2>
            <div className="flex items-center">
              <label htmlFor="tipoAsistencia" className="text-sm text-[var(--color-text-light)] mr-2">
                Mostrar asistencia de:
              </label>
              <select
                id="tipoAsistencia"
                value={tipoAsistencia}
                onChange={(e) => setTipoAsistencia(e.target.value)}
                className="text-sm border rounded-md px-2 py-1 text-[var(--color-text)]"
              >
                <option value="todas">Todas las sesiones</option>
                <option value="ultima">Última sesión</option>
                {estadisticas.fechasUnicas && estadisticas.fechasUnicas.length > 1 && (
                  <option value="fecha">Sesión específica</option>
                )}
              </select>
            </div>
          </div>
          
          {tipoAsistencia === 'fecha' && (
            <div className="mb-4">
              <select
                value={fechaSeleccionada || (estadisticas.fechasUnicas && estadisticas.fechasUnicas[0])}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="w-full text-sm border rounded-md px-2 py-1 text-[var(--color-text)]"
              >
                {estadisticas.fechasUnicas && estadisticas.fechasUnicas.map(fecha => (
                  <option key={fecha} value={fecha}>
                    {new Date(fecha).toLocaleDateString('es-ES')}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--color-background-light)] p-4 rounded-md">
              <p className="text-sm font-medium text-[var(--color-text-light)] mb-1">Total de sesiones:</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{estadisticas.totalSesiones}</p>
            </div>
            <div className="bg-[var(--color-background-light)] p-4 rounded-md">
              <p className="text-sm font-medium text-[var(--color-text-light)] mb-1">Asistencia promedio:</p>
              <p className={`text-2xl font-bold ${(() => {
                const asistencia = tipoAsistencia === 'todas' 
                  ? estadisticas.asistenciaPromedio 
                  : tipoAsistencia === 'ultima' 
                    ? estadisticas.asistenciaUltimaSesion 
                    : tipoAsistencia === 'fecha' && fechaSeleccionada 
                      ? Math.min(100, Math.round((estadisticas.asistenciasPorFecha?.[fechaSeleccionada] || 0) / clase.students.length * 100)) 
                      : estadisticas.asistenciaPromedio;
                return asistencia < 50 
                  ? 'text-red-500' 
                  : asistencia < 75 
                    ? 'text-yellow-500' 
                    : 'text-green-500';
              })()}`}>
                {(() => {
                  if (tipoAsistencia === 'todas') {
                    return estadisticas.asistenciaPromedio;
                  } else if (tipoAsistencia === 'ultima') {
                    return estadisticas.asistenciaUltimaSesion;
                  } else if (tipoAsistencia === 'fecha' && fechaSeleccionada) {
                    const asistencias = estadisticas.asistenciasPorFecha?.[fechaSeleccionada] || 0;
                    const total = clase.students.length;
                    return total > 0 ? Math.min(100, Math.round((asistencias / total) * 100)) : 0;
                  } else {
                    return estadisticas.asistenciaPromedio;
                  }
                })()}%
              </p>
              <p className="text-xs text-[var(--color-text-light)] mt-1">
                {tipoAsistencia === 'todas' && 'Basado en todas las sesiones'}
                {tipoAsistencia === 'ultima' && 'Basado en la última sesión'}
                {tipoAsistencia === 'fecha' && fechaSeleccionada && 
                  `Sesión del ${new Date(fechaSeleccionada).toLocaleDateString('es-ES')}`}
              </p>
            </div>
            <div className="bg-[var(--color-background-light)] p-4 rounded-md">
              <p className="text-sm font-medium text-[var(--color-text-light)] mb-1">Última sesión:</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">
                {estadisticas.ultimaSesion 
                  ? new Date(estadisticas.ultimaSesion).toLocaleDateString('es-ES')
                  : 'No hay sesiones'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Sesiones de asistencia */}
        {Object.keys(sesionesAgrupadas).length > 0 && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Sesiones de Asistencia</h2>
            
            {Object.keys(sesionesAgrupadas).sort((a, b) => new Date(b) - new Date(a)).map(fecha => {
              const asistenciasEnFecha = sesionesAgrupadas[fecha];
              const hora = new Date(asistenciasEnFecha[0].date).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              });
              
              // Obtener alumnos presentes en esta sesión
              const alumnosPresentes = asistenciasEnFecha
                .filter(a => a.presente !== false)
                .map(a => a.student?._id || a.student);
              
              // Obtener alumnos ausentes (los que no están en alumnosPresentes)
              const alumnosAusentes = alumnos
                .filter(alumno => !alumnosPresentes.includes(alumno._id));
              
              return (
                <div key={fecha} className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      Sesión del {fecha} - {hora}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Alumnos presentes */}
                    <div>
                      <h4 className="text-md font-medium text-[var(--color-text)] mb-2">Alumnos Presentes ({alumnosPresentes.length})</h4>
                      {alumnosPresentes.length > 0 ? (
                        <ul className="space-y-2">
                          {asistenciasEnFecha
                            .filter(a => a.presente !== false)
                            .map(asistencia => {
                              const alumnoId = asistencia.student?._id || asistencia.student;
                              const alumno = alumnos.find(a => a._id === alumnoId);
                              return (
                                <li key={alumnoId} className="flex items-center">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span className="text-[var(--color-text)]">{alumno?.name || 'Alumno desconocido'}</span>
                                </li>
                              );
                            })}
                        </ul>
                      ) : (
                        <p className="text-[var(--color-text-light)] italic">Ningún alumno presente</p>
                      )}
                    </div>
                    
                    {/* Alumnos ausentes */}
                    <div>
                      <h4 className="text-md font-medium text-[var(--color-text)] mb-2">Alumnos Ausentes ({alumnosAusentes.length})</h4>
                      {alumnosAusentes.length > 0 ? (
                        <ul className="space-y-2">
                          {alumnosAusentes.map(alumno => (
                            <li key={alumno._id} className="flex items-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                              <span className="text-[var(--color-text)]">{alumno.name}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[var(--color-text-light)] italic">Todos los alumnos presentes</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Lista de alumnos */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Alumnos Inscritos</h2>
        
        {alumnos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[var(--color-background-light)]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                    Email
                  </th>
                  {isProfesor && (
                    <>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                        Asistencia
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wider">
                        Acciones
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alumnos.map((alumno) => (
                  <tr key={alumno._id} className="hover:bg-[var(--color-background-light)]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text)]">
                      {alumno.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-light)]">
                      {alumno.email}
                    </td>
                    {isProfesor && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-light)]">
                          <Link
                            href={`/asistencia/historial?clase=${id}&alumno=${alumno._id}`}
                            className="text-[var(--color-primary)] hover:underline"
                          >
                            Ver asistencia
                          </Link>
                        </td>
                        {/* Eliminada funcionalidad de eliminar alumnos */}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[var(--color-text-light)]">No hay alumnos inscritos en esta clase</p>
            {isProfesor && (
              <p className="mt-2 text-sm text-[var(--color-text-light)]">
                Comparte el código de la clase con tus alumnos para que puedan unirse
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Modal de confirmación para eliminar clase */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">¿Eliminar esta clase?</h3>
            <p className="text-[var(--color-text-light)] mb-6">
              Esta acción no se puede deshacer. Se eliminarán todos los datos relacionados con esta clase, incluyendo registros de asistencia.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Eliminada funcionalidad de eliminar alumno */}
      
      {/* Modal de confirmación para salir de la clase */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">¿Salir de esta clase?</h3>
            <p className="text-[var(--color-text-light)] mb-6">
              ¿Estás seguro de que deseas salir de esta clase? 
              Perderás acceso a los materiales y registros de asistencia.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleLeaveClass}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
