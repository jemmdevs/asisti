'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-[var(--color-primary)]">Asisti</span>
            </Link>
            <p className="text-sm text-[var(--color-text-light)] mt-2">
              Sistema de gestión de asistencia para profesores y alumnos
            </p>
          </div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
            <Link href="/acerca-de" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)]">
              Acerca de
            </Link>
            <Link href="/politica-privacidad" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)]">
              Política de Privacidad
            </Link>
            <Link href="/terminos-servicio" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)]">
              Términos de Servicio
            </Link>
          </div>
        </div>
        <div className="mt-6 border-t border-gray-200 pt-6 text-center">
          <div className="flex justify-center space-x-4 mb-3">
            <a 
              href="https://github.com/jemmdevs" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[var(--color-text-light)] hover:text-[var(--color-primary)]"
            >
              GitHub
            </a>
            <a 
              href="https://portfolio-jemmdevs.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[var(--color-text-light)] hover:text-[var(--color-primary)]"
            >
              Portfolio
            </a>
          </div>
          <p className="text-sm text-[var(--color-text-light)]">
            &copy; {currentYear} Asisti. Todos los derechos reservados.
          </p>
          <p className="text-sm text-[var(--color-text-light)] mt-1">
            Desarrollado por <a href="https://github.com/jemmdevs" className="text-[var(--color-primary)] hover:underline" target="_blank" rel="noopener noreferrer">Jemmdevs</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
