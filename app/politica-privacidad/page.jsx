import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function PoliticaPrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver a la página principal
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-6">Política de Privacidad</h1>
        
        <div className="prose max-w-none text-[var(--color-text-light)]">
          <p className="mb-4">
            Última actualización: 1 de junio de 2025
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">1. Introducción</h2>
          <p className="mb-4">
            Bienvenido a Asisti. Nos comprometemos a proteger su privacidad y a manejar sus datos personales con transparencia. 
            Esta Política de Privacidad explica cómo recopilamos, utilizamos y protegemos su información cuando utiliza nuestra plataforma.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">2. Información que recopilamos</h2>
          <p className="mb-2">
            Recopilamos la siguiente información:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Información de registro: nombre, dirección de correo electrónico y contraseña.</li>
            <li className="mb-2">Información de perfil: rol (profesor o alumno) y otros datos que decida proporcionar.</li>
            <li className="mb-2">Datos de asistencia: registros de asistencia a clases, fechas y horas.</li>
            <li className="mb-2">Información de uso: cómo interactúa con nuestra plataforma.</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">3. Cómo utilizamos su información</h2>
          <p className="mb-2">
            Utilizamos su información para:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Proporcionar y mantener nuestro servicio.</li>
            <li className="mb-2">Mejorar y personalizar su experiencia.</li>
            <li className="mb-2">Gestionar los registros de asistencia.</li>
            <li className="mb-2">Comunicarnos con usted sobre actualizaciones o cambios en nuestro servicio.</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">4. Compartir información</h2>
          <p className="mb-4">
            No vendemos ni alquilamos su información personal a terceros. Compartimos información solo en las siguientes circunstancias:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Con profesores y administradores para la gestión de asistencia.</li>
            <li className="mb-2">Con proveedores de servicios que nos ayudan a operar nuestra plataforma.</li>
            <li className="mb-2">Cuando sea requerido por ley o para proteger nuestros derechos.</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">5. Seguridad de datos</h2>
          <p className="mb-4">
            Implementamos medidas de seguridad diseñadas para proteger sus datos personales. Sin embargo, ningún sistema es completamente seguro, y no podemos garantizar la seguridad absoluta de su información.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">6. Sus derechos</h2>
          <p className="mb-2">
            Dependiendo de su ubicación, puede tener los siguientes derechos:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Acceder a su información personal.</li>
            <li className="mb-2">Corregir información inexacta.</li>
            <li className="mb-2">Eliminar su información personal.</li>
            <li className="mb-2">Oponerse al procesamiento de sus datos.</li>
            <li className="mb-2">Solicitar la portabilidad de sus datos.</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">7. Cambios a esta política</h2>
          <p className="mb-4">
            Podemos actualizar esta política de privacidad periódicamente. Le notificaremos cualquier cambio publicando la nueva política de privacidad en esta página.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">8. Contacto</h2>
          <p className="mb-4">
            Si tiene preguntas sobre esta política de privacidad, puede contactarnos en:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              <a href="https://github.com/jemmdevs" className="text-[var(--color-primary)] hover:underline" target="_blank" rel="noopener noreferrer">
                GitHub: github.com/jemmdevs
              </a>
            </li>
            <li className="mb-2">
              <a href="https://portfolio-jemmdevs.vercel.app/" className="text-[var(--color-primary)] hover:underline" target="_blank" rel="noopener noreferrer">
                Blog: portfolio-jemmdevs.vercel.app
              </a>
            </li>
          </ul>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p>
              Desarrollado por <a href="https://github.com/jemmdevs" className="text-[var(--color-primary)] font-medium hover:underline" target="_blank" rel="noopener noreferrer">Jemmdevs</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
