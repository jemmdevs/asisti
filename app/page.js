import Image from "next/image";
import Link from "next/link";
import { FiCheckCircle, FiUsers, FiClock } from "react-icons/fi";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-[var(--color-background-light)] to-[var(--color-background)] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
                Sistema de Gestión de Asistencia
              </h1>
              <p className="text-lg text-[var(--color-text-light)] mb-8">
                Simplifica el registro de asistencia para profesores y alumnos con una solución moderna y eficiente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="btn-primary inline-flex items-center justify-center">
                  Registrarse como Alumno
                </Link>
                <Link href="/auth/login" className="btn-secondary inline-flex items-center justify-center">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <div className="text-center p-4 mb-4 bg-[var(--color-background-light)] rounded-md">
                    <h2 className="text-2xl font-bold text-[var(--color-text)]">Código de Asistencia</h2>
                    <div className="mt-4 p-6 bg-white border-2 border-[var(--color-primary)] rounded-md">
                      <span className="text-5xl font-bold tracking-wider text-[var(--color-text)]">
                        123
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-[var(--color-text-light)]">
                      Este código expirará en: <span className="font-medium">04:59</span>
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-[var(--color-text-light)]">Clase:</p>
                      <p className="font-medium text-[var(--color-text)]">Matemáticas Avanzadas</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-text-light)]">Fecha:</p>
                      <p className="font-medium text-[var(--color-text)]">01/06/2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-text)]">Características Principales</h2>
            <p className="mt-4 text-lg text-[var(--color-text-light)]">Descubre cómo Asisti puede mejorar la gestión de asistencia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--color-background-light)] p-6 rounded-lg">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-4">
                <FiCheckCircle className="text-[var(--color-text)] text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Registro Simplificado</h3>
              <p className="text-[var(--color-text-light)]">Registra la asistencia con un simple código de tres dígitos mostrado por el profesor.</p>
            </div>

            <div className="bg-[var(--color-background-light)] p-6 rounded-lg">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-4">
                <FiUsers className="text-[var(--color-text)] text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Gestión de Clases</h3>
              <p className="text-[var(--color-text-light)]">Los profesores pueden crear y gestionar clases, mientras que los alumnos pueden unirse fácilmente.</p>
            </div>

            <div className="bg-[var(--color-background-light)] p-6 rounded-lg">
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-4">
                <FiClock className="text-[var(--color-text)] text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Estadísticas Detalladas</h3>
              <p className="text-[var(--color-text-light)]">Visualiza estadísticas de asistencia por día, semana, mes y más para un seguimiento completo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 bg-[var(--color-background-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-text)]">¿Cómo Funciona?</h2>
            <p className="mt-4 text-lg text-[var(--color-text-light)]">Un proceso simple para profesores y alumnos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center mr-2 text-[var(--color-text)]">1</span>
                Para Profesores
              </h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-[var(--color-background-dark)] rounded-full flex items-center justify-center mr-2 text-xs">1</span>
                  <span className="text-[var(--color-text-light)]">Inicia sesión con tus credenciales de profesor.</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-[var(--color-background-dark)] rounded-full flex items-center justify-center mr-2 text-xs">2</span>
                  <span className="text-[var(--color-text-light)]">Crea clases y comparte el código de clase con tus alumnos.</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-[var(--color-background-dark)] rounded-full flex items-center justify-center mr-2 text-xs">3</span>
                  <span className="text-[var(--color-text-light)]">Genera códigos de asistencia para cada sesión de clase.</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-[var(--color-background-dark)] rounded-full flex items-center justify-center mr-2 text-xs">4</span>
                  <span className="text-[var(--color-text-light)]">Visualiza y gestiona la asistencia de tus alumnos.</span>
                </li>
              </ol>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center mr-2 text-[var(--color-text)]">2</span>
                Para Alumnos
              </h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-[var(--color-background-dark)] rounded-full flex items-center justify-center mr-2 text-xs">1</span>
                  <span className="text-[var(--color-text-light)]">Regístrate e inicia sesión en la plataforma.</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-[var(--color-background-dark)] rounded-full flex items-center justify-center mr-2 text-xs">2</span>
                  <span className="text-[var(--color-text-light)]">Únete a las clases utilizando el código proporcionado por tu profesor.</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-[var(--color-background-dark)] rounded-full flex items-center justify-center mr-2 text-xs">3</span>
                  <span className="text-[var(--color-text-light)]">Registra tu asistencia introduciendo el código mostrado en clase.</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-[var(--color-background-dark)] rounded-full flex items-center justify-center mr-2 text-xs">4</span>
                  <span className="text-[var(--color-text-light)]">Consulta tu historial de asistencia en cualquier momento.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 bg-[var(--color-accent)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Comienza a utilizar Asisti hoy mismo</h2>
          <p className="text-lg mb-8 opacity-90">Simplifica la gestión de asistencia y mejora el seguimiento de tus clases</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-[var(--color-accent)] px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors">
              Registrarse
            </Link>
            <Link href="/auth/login" className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-[var(--color-accent)] transition-colors">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
