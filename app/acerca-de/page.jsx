import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiGithub, FiGlobe, FiMail } from 'react-icons/fi';

export default function AcercaDePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver a la página principal
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-6">Acerca de Asisti</h1>
        
        <div className="prose max-w-none text-[var(--color-text-light)]">
          <p className="mb-6">
            Asisti es una plataforma moderna de gestión de asistencia diseñada para simplificar el proceso de registro y seguimiento de asistencia en entornos educativos. Nuestra misión es proporcionar una herramienta intuitiva y eficiente que ayude a profesores y alumnos a gestionar mejor la asistencia a clases.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">Nuestra Visión</h2>
          <p className="mb-6">
            Creemos en la importancia de la asistencia regular para el éxito académico. Asisti nació con la visión de eliminar las barreras tradicionales en el registro de asistencia, como las hojas de papel que pueden perderse o dañarse, y los procesos manuales que consumen tiempo valioso de clase.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">Características Principales</h2>
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Generación de códigos de asistencia temporales para cada sesión</li>
            <li className="mb-2">Interfaz intuitiva para profesores y alumnos</li>
            <li className="mb-2">Estadísticas detalladas de asistencia</li>
            <li className="mb-2">Exportación de datos en formato CSV</li>
            <li className="mb-2">Sistema de justificación de faltas</li>
            <li className="mb-2">Gestión de múltiples clases</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">Tecnologías Utilizadas</h2>
          <p className="mb-2">
            Asisti está construido con tecnologías modernas para garantizar un rendimiento óptimo y una experiencia de usuario fluida:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Next.js 15 - Framework de React para aplicaciones web</li>
            <li className="mb-2">MongoDB - Base de datos NoSQL para almacenamiento flexible</li>
            <li className="mb-2">NextAuth.js - Autenticación segura y gestión de sesiones</li>
            <li className="mb-2">Tailwind CSS - Framework de CSS para un diseño moderno y responsivo</li>
            <li className="mb-2">React Icons - Biblioteca de iconos para mejorar la interfaz de usuario</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">Desarrollador</h2>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-[var(--color-background-light)] rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-[var(--color-primary)]">JD</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Jemmdevs</h3>
              <p className="text-[var(--color-text-light)] mb-2">Desarrollador Full Stack</p>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/jemmdevs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-[var(--color-text-light)] hover:text-[var(--color-primary)]"
                >
                  <FiGithub className="mr-1" />
                  GitHub
                </a>
                <a 
                  href="https://portfolio-jemmdevs.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-[var(--color-text-light)] hover:text-[var(--color-primary)]"
                >
                  <FiGlobe className="mr-1" />
                  Portfolio
                </a>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">Contacto</h2>
          <p className="mb-6">
            ¿Tienes preguntas, sugerencias o comentarios sobre Asisti? Nos encantaría saber de ti. Puedes contactarnos a través de:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">
              <a href="https://github.com/jemmdevs" className="text-[var(--color-primary)] hover:underline" target="_blank" rel="noopener noreferrer">
                GitHub: github.com/jemmdevs
              </a>
            </li>
            <li className="mb-2">
              <a href="https://portfolio-jemmdevs.vercel.app/" className="text-[var(--color-primary)] hover:underline" target="_blank" rel="noopener noreferrer">
                Portfolio: portfolio-jemmdevs.vercel.app
              </a>
            </li>
          </ul>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-[var(--color-text-light)]">
              © {new Date().getFullYear()} Asisti - Todos los derechos reservados
            </p>
            <p className="mt-2">
              Desarrollado con ❤️ por <a href="https://github.com/jemmdevs" className="text-[var(--color-primary)] font-medium hover:underline" target="_blank" rel="noopener noreferrer">Jemmdevs</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
