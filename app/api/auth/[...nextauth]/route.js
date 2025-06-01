import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();

        // Verificar email y contraseña
        const { email, password } = credentials;
        
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
          throw new Error('Email o contraseña incorrectos');
        }
        
        // Verificar si la contraseña coincide
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          throw new Error('Email o contraseña incorrectos');
        }
        
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET || 'tu_clave_secreta_temporal',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
