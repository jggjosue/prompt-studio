import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, FileText, Navigation, RefreshCw, ShieldAlert } from 'lucide-react';

const sections = [
  {
    title: 'Contenido original y valioso',
    icon: FileText,
    points: [
      'Publica prompts y descripciones con contexto propio, no solo texto copiado.',
      'Aporta valor adicional: ejemplos, matices, comparaciones o casos de uso.',
      'Actualiza el catálogo con frecuencia para mantener relevancia.',
    ],
  },
  {
    title: 'Evitar contenido duplicado',
    icon: ShieldAlert,
    points: [
      'Evita publicar el mismo prompt en múltiples entradas sin cambios sustanciales.',
      'Si hay contenido parecido, combínalo o amplía una versión principal.',
      'No reutilices contenido de terceros sin aportar valor editorial.',
    ],
  },
  {
    title: 'Experiencia de usuario',
    icon: Navigation,
    points: [
      'Mantén navegación clara por secciones y tags.',
      'Asegura legibilidad, enlaces correctos y estructura consistente en móvil y desktop.',
      'Evita interfaces confusas o páginas con poco contenido útil.',
    ],
  },
  {
    title: 'Mantenimiento y revisión',
    icon: RefreshCw,
    points: [
      'Revisa periódicamente prompts, previews y enlaces rotos.',
      'Valida cumplimiento de políticas de contenido antes de monetizar.',
      'Documenta cambios para facilitar auditoría y calidad editorial.',
    ],
  },
];

export default function PublisherGuidelinesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Calidad de contenido y UX</h1>
            <p className="mt-3 text-muted-foreground">
              Recomendaciones prácticas para mantener una experiencia apta para monetización con AdSense.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <Card key={section.title}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Icon className="h-5 w-5 text-primary" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {section.points.map(point => (
                        <li key={point} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
