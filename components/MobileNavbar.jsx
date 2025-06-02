'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiUsers, FiCalendar, FiUser, FiLogOut } from 'react-icons/fi';

export default function MobileNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  if (!session) return null;
  
  const isProfesor = session?.user?.role === 'profesor';
  
  // Definir los enlaces de navegación según el rol del usuario
  const navLinks = isProfesor 
    ? [
        { href: '/dashboard', icon: <FiHome className="w-6 h-6" />, label: 'Inicio' },
        { href: '/clases', icon: <FiUsers className="w-6 h-6" />, label: 'Clases' },
        { href: '/asistencia/historial', icon: <FiCalendar className="w-6 h-6" />, label: 'Asistencia' },
        { href: '/perfil', icon: <FiUser className="w-6 h-6" />, label: 'Perfil' },
      ]
    : [
        { href: '/mis-clases', icon: <FiHome className="w-6 h-6" />, label: 'Inicio' },
        { href: '/asistencia', icon: <FiCalendar className="w-6 h-6" />, label: 'Asistir' },
        { href: '/perfil', icon: <FiUser className="w-6 h-6" />, label: 'Perfil' },
      ];
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive 
                  ? 'text-[var(--color-primary)]' 
                  : 'text-gray-500 hover:text-[var(--color-primary)]'
              }`}
            >
              {link.icon}
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
