import type { Metadata } from 'next';
import FormComponentsClient from './form-components-client';

export const metadata: Metadata = { title:'Componentes de Formularios | Prompt Studio',description:'Explora 50 formularios funcionales y copia prompts profesionales para React y Next.js.',alternates:{canonical:'/form-components'} };
export default function FormComponentsPage(){return <FormComponentsClient/>;}
