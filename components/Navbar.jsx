'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-[var(--color-primary)]">Asisti</span>
            </Link>
          </div>

          {/* Menú para pantallas medianas y grandes */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {session ? (
              <>
                {session.user.role === 'profesor' ? (
                  <>
                    <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Dashboard
                    </Link>
                    <Link href="/clases" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Mis Clases
                    </Link>
                    <Link href="/asistencia/historial" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Asistencia
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/mis-clases" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Mis Clases
                    </Link>
                    <Link href="/asistencia/registrar" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Registrar Asistencia
                    </Link>
                    <Link href="/asistencia/historial" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Mi Asistencia
                    </Link>
                  </>
                )}
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <Link href="/perfil" className="flex items-center hover:text-[var(--color-primary)]">
                      <FiUser className="h-5 w-5 mr-2 text-[var(--color-text-light)]" />
                      <span className="text-sm font-medium text-[var(--color-text-light)] mr-3 hover:text-[var(--color-primary)]">
                        {session.user.name}
                      </span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="p-2 rounded-full text-[var(--color-text-light)] hover:bg-[var(--color-background-dark)]"
                    >
                      <FiLogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                  Iniciar Sesión
                </Link>
                <Link href="/auth/register" className="px-3 py-2 rounded-md text-sm font-medium bg-[var(--color-primary)] text-[var(--color-text)] hover:bg-[var(--color-primary-dark)]">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Botón de menú para dispositivos móviles */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-[var(--color-text-light)] hover:bg-[var(--color-background-dark)]"
            >
              {isMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {session ? (
              <>
                {session.user.role === 'profesor' ? (
                  <>
                    <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Dashboard
                    </Link>
                    <Link href="/clases" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Mis Clases
                    </Link>
                    <Link href="/asistencia/historial" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Asistencia
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/mis-clases" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Mis Clases
                    </Link>
                    <Link href="/asistencia/registrar" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Registrar Asistencia
                    </Link>
                    <Link href="/asistencia/historial" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                      Mi Asistencia
                    </Link>
                  </>
                )}
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <FiUser className="h-8 w-8 rounded-full text-[var(--color-text-light)]" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-[var(--color-text)]">{session.user.name}</div>
                      <div className="text-sm font-medium text-[var(--color-text-light)]">{session.user.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <Link 
                      href="/perfil" 
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)] flex items-center"
                    >
                      <FiUser className="mr-2" />
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)] flex items-center"
                    >
                      <FiLogOut className="mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                  Iniciar Sesión
                </Link>
                <Link href="/auth/register" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-background-dark)]">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
