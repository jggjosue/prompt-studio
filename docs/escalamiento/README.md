# Sistema operativo para escalar Prompt Studio

## Decisión ejecutiva

Prompt Studio no debería contratar 10 personas de inmediato. La siguiente etapa razonable es un núcleo de **4 a 6 personas**, apoyado por automatizaciones supervisadas, hasta demostrar activación, retención, margen y una carga operativa que justifique crecer. Los escenarios de 10, 20, 30 y 50 describen estructuras objetivo, no cuotas ni fechas de contratación.

La prioridad antes de escalar plantilla es reducir el riesgo de una base de producto muy amplia: consolidar el flujo `proyecto → brief → generación → evaluación → publicación`, fortalecer E2E, medir coste y margen por generación, formalizar producción e incidentes y eliminar trabajo manual repetitivo.

## Hechos comprobados en el repositorio

Medición realizada el 9 de septiembre de 2026 sobre el árbol local:

| Señal | Evidencia |
| --- | ---: |
| Aplicación | Next.js 15, React 19 y TypeScript |
| Código TypeScript en `src` | ~68,000 líneas |
| Páginas App Router | 90 |
| Handlers API | 101 |
| Modelos Mongoose | 41 |
| Pruebas unitarias | 48 archivos |
| Pruebas E2E | 3 archivos |
| Integraciones | Clerk, MongoDB, Stripe, R2, Resend, Genkit y proveedores de IA |
| CI | Typecheck, unitarias, datos, caché y Playwright en GitHub Actions |
| Producción declarada | Vercel; existe además configuración de Firebase App Hosting con una instancia máxima |
| Observabilidad | Eventos de navegador, servidor, IA, MongoDB y comercio; retención documentada de 90 días |

## Información no disponible

No se encontraron cifras verificables de empleados actuales, usuarios activos, clientes, MRR/ARR, churn, tickets, coste cloud, consumo de API, margen bruto, runway, SLA o pipeline comercial. Los costes y umbrales de estos documentos son hipótesis para planificación y deben sustituirse con datos reales antes de contratar.

## Recomendación inmediata

Si el fundador es hoy la única persona, contrataría primero:

1. **Senior full-stack/product engineer** para reducir el cuello de botella de entrega.
2. **Senior AI/platform engineer** para proveedores, evaluación, colas, costes y fiabilidad.
3. **Product designer con research**, inicialmente fraccional o contratado por proyecto.
4. **Growth/customer operator** solo después de instrumentar el embudo y tener usuarios activos.
5. **QA automation o platform engineer** cuando los fallos y regresiones consuman más de 20% del tiempo de ingeniería.

No contrataría todavía managers puros, Kubernetes specialists, equipo móvil, data science de investigación, SDRs múltiples, HR interno ni departamentos independientes de legal y finanzas. Esas funciones pueden cubrirse de forma fraccional hasta que la carga las haga recurrentes.

## Condiciones para crecer

| Transición | Evidencia mínima recomendada |
| --- | --- |
| Núcleo → 10 | Flujo principal estable; analítica de coste; 3 meses de retención medible; trabajo priorizado para 2 squads; ≥18 meses de runway después de contratar |
| 10 → 20 | PMF inicial; crecimiento repetible; soporte supera capacidad del equipo; ≥2 squads con ownership claro; margen bruto conocido; pipeline comercial suficiente |
| 20 → 30 | Tres líneas de trabajo sostenibles; disponibilidad y compliance generan trabajo especializado; managers con 5–8 reportes; contratación financiada por ingresos o capital asignado |
| 30 → 50 | Ventas y retención predecibles; expansión internacional o enterprise real; cuatro o cinco squads; guardia e incidentes maduros; revenue por empleado no se deteriora |

Nunca se debe crecer solo porque pasó un trimestre. Si el cuello de botella es mala priorización, deuda o automatización ausente, contratar amplifica el problema.

## Tabla maestra

Costes mensuales en USD, totalmente cargados, sin incluir coste variable extraordinario de campañas. Son rangos de planificación remota para Norteamérica/LatAm y requieren calibración geográfica.

| Etapa | Humanos | Agentes activos | Engineering | Producto | Plataforma/QA/Seguridad | GTM y soporte | Operaciones | Coste mensual estimado | Permanencia orientativa |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Núcleo | 4–6 | 5–7 | 2–3 | 1 | 0.5–1 | 1 | Fraccional | $45k–$95k | Hasta demostrar retención |
| A | 10 | 7–9 | 5 | 1 | 1 | 2 | 1 | $95k–$170k | 6–12 meses, condicionado |
| B | 20 | 10–13 | 10 | 2 | 2 | 4 | 2 | $190k–$340k | 9–18 meses, condicionado |
| C | 30 | 13–17 | 15 | 3 | 3 | 6 | 3 | $290k–$510k | 12–24 meses, condicionado |
| D | 50 | 17–22 | 24 | 5 | 6 | 10 | 5 | $500k–$900k | Solo con escala demostrada |

## Documentos del sistema

- [Equipos y organigramas](equipos-y-organigramas.md)
- [Agentes, controles y automatización](agentes-y-automatizacion.md)
- [Ingeniería, infraestructura y seguridad](ingenieria-infraestructura-seguridad.md)
- [Producto, comunicación, soporte y crecimiento](producto-operaciones-crecimiento.md)
- [Métricas, costes, roadmap y transiciones](metricas-costes-roadmap.md)

## Regla de interpretación

Cada recomendación debe convertirse en una decisión con responsable, fecha, métrica inicial y criterio de salida. Un agente es una capacidad automatizada con permisos limitados, no un equivalente contable de una persona. Ningún agente aprueba pagos, cambios de acceso, contratos, despidos, incidentes críticos ni despliegues irreversibles sin supervisión humana.

