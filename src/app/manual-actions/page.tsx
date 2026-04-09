import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ClipboardCheck, SearchCheck, ShieldAlert, Route, Code2, AlertTriangle } from 'lucide-react';

const checklist = [
  'Revisar en Search Console si existe acción manual activa.',
  'Confirmar el alcance: todo el sitio o patrones de URL específicos.',
  'Eliminar o reescribir contenido duplicado, superficial o sin valor añadido.',
  'Corregir páginas puerta, enlaces engañosos y promesas falsas.',
  'Verificar que Google puede rastrear URLs afectadas (sin bloqueos de robots/noindex/login).',
  'Documentar cambios realizados antes de solicitar reconsideración.',
];

const reconsiderationTemplate = [
  'Problema identificado: explica la infracción concreta detectada.',
  'Qué corregiste: lista páginas y tipo de corrección (eliminación, reescritura, consolidación).',
  'Evidencia: muestra ejemplos de contenido retirado y nuevo contenido útil añadido.',
  'Prevención: describe controles que evitarán recurrencia (QA editorial, revisión periódica, políticas internas).',
];

const aggressiveSpamRecoveryPlan = [
  'Detener publicación automática/masiva hasta completar auditoría editorial.',
  'Eliminar o consolidar contenido de bajo valor, duplicado o generado en masa sin revisión.',
  'Corregir encubrimiento, redirecciones condicionales y cualquier diferencia Googlebot vs usuario.',
  'Auditar patrones repetitivos: títulos clónicos, páginas doorway y bloques de texto reciclado.',
  'Registrar cambios con ejemplos “antes/después” por URL para la reconsideración.',
  'Mantener un calendario de revisión continua para evitar reincidencias.',
];

const reconsiderationEvidence = [
  'URLs retiradas o corregidas y motivo de cada cambio.',
  'Ejemplos de contenido de calidad añadido con valor editorial real.',
  'Fecha de implementación de controles y proceso interno de QA.',
];

const cloakingAndRedirectChecklist = [
  'Compara en Search Console (Inspección de URLs) lo que ve Googlebot vs lo que ve un usuario real.',
  'Busca redirecciones condicionales por referrer, user-agent o IP.',
  'Revisa JavaScript de cliente, reglas de servidor y .htaccess para redirecciones no esperadas.',
  'Elimina cualquier lógica que muestre contenido distinto a Google y usuarios.',
];

const paywallStructuredDataSnippet = `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Título del contenido",
  "isAccessibleForFree": false,
  "hasPart": {
    "@type": "WebPageElement",
    "isAccessibleForFree": false,
    "cssSelector": ".paywall"
  }
}`;

const imageCloakingChecklist = [
  'Verificar que la imagen visible en la página sea la misma URL/base visual que indexa Google.',
  'Evitar overlays opacos o bloques que oculten la imagen principal.',
  'No servir miniaturas distintas por user-agent o referrer.',
  'Alinear metadatos OG/Twitter con la misma imagen que ve el usuario.',
];

const hiddenTextAndKeywordsChecklist = [
  'Comprueba con Search Console si Google detecta texto que el usuario no ve.',
  'Busca texto del mismo color que el fondo o escondido por CSS (display:none, off-screen, opacity:0).',
  'Evita bloques de palabras repetidas sin contexto y listas de términos forzadas.',
  'Revisa títulos y texto alternativo para evitar cadenas repetitivas sin valor.',
  'Si ocultas contenido por UX, asegúrate de que siga siendo accesible/visible para usuarios.',
];

const ampParityChecklist = [
  'Verifica que la URL AMP apunte a su canónica correcta y que la canónica apunte a AMP cuando corresponda.',
  'Asegura paridad de contenido: mismo tema, misma intención y mismas acciones principales para el usuario.',
  'Comprueba en Search Console (Inspección de URL) el render de Google en AMP y canónica.',
  'Revisa robots.txt para no bloquear recursos críticos (CSS/JS/imagenes) en ninguna versión.',
  'Si no usas AMP, evita referencias AMP en metadata para no crear relaciones inconsistentes.',
];

const mobileRedirectChecklist = [
  'Compara la misma URL desde desktop y móvil (real o emulado) para validar destino equivalente.',
  'Revisa redirecciones condicionadas por user-agent, referrer de Google o rangos de IP.',
  'Inspecciona scripts/iframes de terceros (ads, widgets, trackers) que puedan redirigir en móvil.',
  'Verifica que no exista código inyectado por compromiso de seguridad (malware/hack).',
  'Elimina redirecciones no relacionadas con el contenido esperado y revalida desde SERP móvil.',
];

const mobileRedirectPrevention = [
  'Prioriza partners publicitarios con políticas claras de calidad de tráfico.',
  'Monitorea analíticas móviles (tiempo en página, rebote, salidas abruptas) para detectar anomalías.',
  'Configura alertas por caídas bruscas de engagement móvil.',
  'Audita periódicamente JS de terceros y cambios en CMS/plugins.',
];

const siteReputationAbuseChecklist = [
  'Identifica contenido de terceros en patrones de URL señalados por Search Console.',
  'Decide remediación por bloque: reescribir como contenido propio, retirar o mover a dominio nuevo.',
  'Si enlazas al dominio nuevo, usa rel="nofollow" y evita redirecciones 301/302 desde URLs afectadas.',
  'Si mantienes temporalmente contenido infractor, aplica noindex (sin bloquear por robots.txt).',
  'No uses subdominios/subdirectorios para eludir la política: puede escalar la acción manual.',
  'Documenta evidencia por URL (antes/después) para la solicitud de reconsideración.',
];

const siteReputationDoNot = [
  'No redirigir automáticamente URLs antiguas al nuevo dominio del contenido infractor.',
  'No bloquear por robots.txt una URL que deba ser noindex (Google no verá la directiva).',
  'No mover el mismo contenido de terceros a otro sitio “fuerte” sin cambiar su naturaleza editorial.',
];

export default function ManualActionsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-5xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Informe de Acciones Manuales</h1>
            <p className="text-muted-foreground">
              Guía operativa para corregir incidencias de spam/calidad y solicitar revisión en Google Search Console.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SearchCheck className="h-5 w-5 text-primary" />
                  Checklist de corrección
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {checklist.map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Solicitud de reconsideración
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {reconsiderationTemplate.map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-primary" />
                  Encubrimiento y redirecciones engañosas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {cloakingAndRedirectChecklist.map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  Muro de pago (datos estructurados)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Si partes del contenido requieren suscripción, marca el paywall para evitar señales de encubrimiento.
                </p>
                <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap">
{paywallStructuredDataSnippet}
                </pre>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchCheck className="h-5 w-5 text-primary" />
                Encubrimiento de imágenes (Google Imágenes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {imageCloakingChecklist.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchCheck className="h-5 w-5 text-primary" />
                Texto oculto y exceso de palabras clave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {hiddenTextAndKeywordsChecklist.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchCheck className="h-5 w-5 text-primary" />
                Paridad AMP y página canónica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {ampParityChecklist.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                Redirecciones engañosas en móviles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {mobileRedirectChecklist.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-md border bg-background p-3">
                <p className="text-sm font-semibold mb-2">Prevención continua</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {mobileRedirectPrevention.map(item => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <ShieldAlert className="h-5 w-5" />
                Riesgos que más suelen activar acciones manuales
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Contenido con poco o ningún valor añadido, contenido copiado, páginas puerta, enlaces artificiales,
              experiencias engañosas y navegación deficiente. Prioriza contenido original, estructura clara y revisión
              editorial continua.
            </CardContent>
          </Card>

          <Card className="border-rose-300 bg-rose-50/50 dark:bg-rose-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-900 dark:text-rose-100">
                <AlertTriangle className="h-5 w-5" />
                Escenario crítico: spam agresivo o infracciones reiteradas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Si el sitio fue marcado por abuso a gran escala, cloaking o incumplimientos graves, aplica un
                saneamiento completo antes de pedir revisión.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {aggressiveSpamRecoveryPlan.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-rose-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-md border bg-background p-3">
                <p className="text-sm font-semibold mb-2">Evidencia recomendada en la reconsideración</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {reconsiderationEvidence.map(item => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                <ShieldAlert className="h-5 w-5" />
                Abuso de reputación del sitio (contenido de terceros)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {siteReputationAbuseChecklist.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-indigo-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-md border bg-background p-3">
                <p className="text-sm font-semibold mb-2">Evita estos errores comunes</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {siteReputationDoNot.map(item => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
