# Equipos y organigramas

## Principios

- Equipos de producto de 4–7 personas con una misión y métricas propias.
- Un manager cuando existan al menos 5 reportes sostenidos o la coordinación reste más de 30% del tiempo a un lead.
- Un lead técnico guía diseño y calidad; no debe convertirse automáticamente en manager.
- Finanzas, legal, seguridad especializada y People pueden comenzar como funciones fraccionales.
- Cada puesto se abre contra un cuello de botella medido y un resultado de 6–12 meses.

## Escenario A: 10 personas

| Puesto | Nº / nivel | Responsabilidad y problema que resuelve | Momento | IA delegable / supervisión humana |
| --- | --- | --- | --- | --- |
| CEO/founder | 1 | Estrategia, capital, clientes clave y contratación | Actual; imprescindible | Research y borradores / estrategia y compromisos humanos |
| Tech lead o CTO hands-on | 1 Senior/Lead | Arquitectura, seguridad y velocidad técnica | Actual; imprescindible | Análisis y propuestas / decisiones y producción |
| Full-stack engineers | 3 Senior/Mid | Flujo principal, APIs e interfaz | Inmediato; imprescindible | Scaffolding y pruebas / diseño y revisión |
| AI/platform engineer | 1 Senior | Proveedores, evaluación, colas, coste y fiabilidad | Inmediato; imprescindible | Experimentos / selección y límites |
| Product manager | 1 Senior | Discovery, prioridades y métricas | Tras señal de usuarios; recomendable | Síntesis / roadmap final |
| Product designer | 1 Senior | Investigación, UX y sistema visual | Temprano; recomendable | Variantes / investigación y aprobación |
| Growth/customer operator | 1 Mid/Senior | Activación, soporte y contenido inicial | Con tráfico y usuarios; recomendable | Segmentación y borradores / contacto sensible |
| Operations/generalist | 1 Mid | Finanzas operativas, vendors y coordinación | Con carga recurrente; opcional | Conciliación preliminar / pagos y contratos |

Legal, contabilidad, pentesting y recruiting se cubren de forma fraccional. No hay Engineering Manager separado: el tech lead conserva como máximo cuatro reportes técnicos.

```text
CEO
├── Tech Lead/CTO
│   ├── 3 Full-stack Engineers
│   └── AI/Platform Engineer
├── Product Manager ── Product Designer
└── Growth/Customer ── Operations
```

## Escenario B: 20 personas

| Puesto o grupo | Nº | Nivel recomendado | Mandato |
| --- | ---: | --- | --- |
| CEO | 1 | Executive | Estrategia, capital y clientes clave |
| CTO | 1 | Executive, hands-on | Arquitectura, engineering y seguridad |
| Head of Product/PM | 1 | Head | Discovery, portfolio y métricas |
| Operations/Finance Lead | 1 | Senior/Lead | Presupuesto, vendors y operaciones |
| Product engineers, incluidos 2 tech leads | 8 | 2 Lead, 4 Senior, 2 Mid | Squads Creation y Publish/Commerce |
| AI/platform engineers | 2 | Senior | Proveedores, evaluación, colas y datos |
| DevOps/SRE | 1 | Senior | CI/CD, observabilidad y fiabilidad |
| QA automation | 1 | Senior | Estrategia y automatización de calidad |
| Product designer | 1 | Senior | UX, research y sistema de diseño |
| Growth/content | 1 | Senior | Adquisición, experimentación y SEO |
| Sales generalist | 1 | Senior | Founder-led sales escalado y CRM |
| Support/Customer Success | 1 | Mid/Senior | Soporte, onboarding y voz del cliente |
| **Total** | **20** |  |  |

Aquí aparece un Engineering Manager sustituyendo uno de los puestos de engineering —no como headcount adicional— si el CTO supera ocho reportes o deja de hacer trabajo técnico estratégico. Legal, People y contabilidad siguen externos o fraccionales. Mobile continúa fuera salvo demanda comprobada.

```text
CEO
├── CTO ── Engineering Manager
│   ├── Squad Creation
│   ├── Squad Publish/Commerce
│   └── Platform/QA
├── Head of Product ── Design
├── Growth/Sales ── Customer
└── Operations ── Finance/People
```

## Escenario C: 30 personas

| Puesto o grupo | Nº | Estructura |
| --- | ---: | --- |
| CEO, CTO, Head of Product y COO | 4 | Liderazgo con áreas y métricas explícitas |
| Product engineers, incluidos 3 leads | 12 | Squads Create, Evaluate y Publish/Commerce |
| AI/data/platform engineers | 3 | Plataforma compartida, routing, evaluación y datos |
| SRE | 1 | Guardia, SLO y capacidad |
| QA automation | 1 | Quality enablement y regresión |
| Security engineer | 1 | AppSec, accesos y respuesta |
| Product manager adicional | 1 | Segunda misión de producto |
| Product designers/research | 2 | Diseño e investigación compartidos |
| Growth/marketing | 2 | Growth y content/product marketing |
| Account Executive | 1 | Venta consultiva con playbook validado |
| Support | 1 | Resolución y operaciones de tickets |
| Customer Success | 1 | Onboarding, retención y expansión |
| **Total** | **30** | Legal, People y contabilidad continúan fraccionales |

Se introduce un manager de ingeniería con 2–3 leads. Cada squad conserva 4–6 miembros; no se crean capas adicionales. El security engineer puede seguir adscrito a Platform y con independencia para bloquear releases.

## Escenario D: 50 personas

| Puesto o grupo | Nº | Estructura |
| --- | ---: | --- |
| CEO, CTO, CPO y COO | 4 | Equipo ejecutivo compacto |
| Product engineers, incluidos managers/leads | 20 | Cuatro squads: Discover, Create, Evaluate y Publish/Commerce |
| Platform/Data/SRE/Security/QA | 8 | Plataforma interna, datos, reliability, AppSec y quality enablement |
| Product managers adicionales | 3 | Ownership de journeys y segmentos |
| Design/Research | 4 | Diseñadores por misión y research compartido |
| Sales/Growth/Marketing | 6 | Sales lead, AE, SDR, growth, product marketing y content/SEO |
| Customer Success/Support | 3 | CS lead y cobertura por severidad |
| Finance | 1 | Planificación, control y cierre; contabilidad especializada externa |
| People/Recruiting | 1 | Hiring, onboarding y managers; asesoría laboral externa |
| **Total** | **50** | Legal/compliance especializado continúa externo o híbrido |

La dirección máxima recomendada sigue siendo CEO → heads → leads → contributors. Ninguna persona gestiona más de ocho reportes directos. Los squads se dividen por saturación de ownership y misión estable, no por tecnologías frontend/backend.

## Contratación y ciclo de vida

1. **Apertura:** scorecard con resultado, nivel, presupuesto y evidencia del cuello de botella.
2. **Selección:** llamada estructurada, ejercicio pequeño relacionado con el puesto, entrevista de colaboración y referencias cuando proceda.
3. **Decisión:** rúbrica común; nunca delegada por completo a IA.
4. **Onboarding 30/60/90:** producto, seguridad, entorno, buddy, primera entrega reversible y ownership progresivo.
5. **Accesos:** por rol, mínimo privilegio, fecha de revisión y propietario.
6. **Evaluación:** resultados y comportamientos observables; no actividad superficial.
7. **Offboarding:** revocar accesos el mismo día, rotar secretos, transferir ownership y conservar evidencia legal necesaria.
