import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function TerminosServicioPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-[var(--color-primary-dark)] hover:underline">
          <FiArrowLeft className="mr-2" />
          Volver a la página principal
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-6">Términos de Servicio</h1>
        
        <div className="prose max-w-none text-[var(--color-text-light)]">
          <p className="mb-4">
            Última actualización: 1 de junio de 2025
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">1. Aceptación de los Términos</h2>
          <p className="mb-4">
            Al acceder y utilizar Asisti, usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">2. Descripción del Servicio</h2>
          <p className="mb-4">
            Asisti es una plataforma de gestión de asistencia que permite a profesores crear clases, generar códigos de asistencia y realizar un seguimiento de la asistencia de los alumnos. Los alumnos pueden unirse a clases, registrar su asistencia y consultar su historial.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">3. Cuentas de Usuario</h2>
          <p className="mb-4">
            Para utilizar Asisti, debe crear una cuenta y proporcionar información precisa y completa. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.
          </p>
          <p className="mb-4">
            Nos reservamos el derecho de suspender o terminar su cuenta si detectamos actividades que violen estos términos o que consideremos inapropiadas.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">4. Uso Aceptable</h2>
          <p className="mb-4">
            Usted acepta no utilizar Asisti para:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Actividades ilegales o fraudulentas.</li>
            <li className="mb-2">Enviar o transmitir contenido abusivo, difamatorio, obsceno o de otro modo objetable.</li>
            <li className="mb-2">Interferir con o interrumpir la integridad o el rendimiento de Asisti.</li>
            <li className="mb-2">Intentar acceder, manipular o utilizar áreas no públicas de Asisti.</li>
            <li className="mb-2">Registrar asistencia en nombre de otros usuarios o falsificar registros de asistencia.</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">5. Propiedad Intelectual</h2>
          <p className="mb-4">
            Asisti y su contenido original, características y funcionalidad son propiedad de Jemmdevs y están protegidos por leyes de propiedad intelectual. No puede duplicar, copiar o reutilizar ninguna parte del HTML/CSS, JavaScript o conceptos visuales sin el permiso expreso de Jemmdevs.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">6. Privacidad</h2>
          <p className="mb-4">
            Su uso de Asisti está sujeto a nuestra <Link href="/politica-privacidad" className="text-[var(--color-primary)] hover:underline">Política de Privacidad</Link>. Al utilizar nuestro servicio, usted acepta la recopilación y uso de información de acuerdo con esta política.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">7. Limitación de Responsabilidad</h2>
          <p className="mb-4">
            En ningún caso Jemmdevs, sus directores, empleados o agentes serán responsables de cualquier daño directo, indirecto, incidental, especial, punitivo o consecuente que surja del uso de Asisti o la imposibilidad de utilizar Asisti.
          </p>
          <p className="mb-4">
            Asisti se proporciona "tal cual" y "según disponibilidad" sin garantías de ningún tipo, ya sean expresas o implícitas.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">8. Cambios en el Servicio</h2>
          <p className="mb-4">
            Nos reservamos el derecho de modificar o descontinuar, temporal o permanentemente, Asisti o cualquier parte del servicio sin previo aviso. No seremos responsables ante usted o terceros por cualquier modificación, suspensión o interrupción del servicio.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">9. Cambios en los Términos</h2>
          <p className="mb-4">
            Nos reservamos el derecho de modificar estos términos de servicio en cualquier momento. Le notificaremos de cualquier cambio publicando los nuevos términos en esta página. Se recomienda revisar estos términos periódicamente para estar informado de cualquier cambio.
          </p>
          
          <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6 mb-3">10. Contacto</h2>
          <p className="mb-4">
            Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos en:
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
