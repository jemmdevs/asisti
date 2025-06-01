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
            <Link href="/about" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)]">
              Acerca de
            </Link>
            <Link href="/privacy" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)]">
              Política de Privacidad
            </Link>
            <Link href="/terms" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)]">
              Términos de Servicio
            </Link>
          </div>
        </div>
        <div className="mt-6 border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-[var(--color-text-light)]">
            &copy; {currentYear} Asisti. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
