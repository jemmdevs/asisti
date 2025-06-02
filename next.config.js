/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Habilitar soporte mejorado para rutas dinámicas
    serverComponentsExternalPackages: [],
  },
  // Configuración para asegurar que las rutas dinámicas funcionen correctamente
  async rewrites() {
    return [
      // Rewrite para la ruta de asistencia
      {
        source: '/api/asistencia/:id',
        destination: '/api/asistencia/[id]/route',
      },
      // Rewrite para la ruta de eliminar estudiantes
      {
        source: '/api/clases/:id/students/:studentId',
        destination: '/api/clases/[id]/students/[studentId]/route',
      },
    ];
  },
};

module.exports = nextConfig;
