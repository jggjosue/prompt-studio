import type { Metadata } from 'next';
import LoginComponentsClient from './login-components-client';

export const metadata: Metadata = {
  title: 'Componentes de Login | Prompt Studio',
  description: 'Explora 50 diseños de login, visualiza sus estados y copia prompts profesionales para React y Next.js.',
  alternates: { canonical: '/login-components' },
};

export default function LoginComponentsPage() {
  return <LoginComponentsClient />;
}
