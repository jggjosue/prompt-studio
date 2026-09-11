# Métricas, costes, roadmap y transiciones

## Métricas por etapa

| Dominio | Núcleo/10 | 20 | 30–50 |
| --- | --- | --- | --- |
| Producto | Activación, tiempo al primer valor, retención y conversión | Cohortes, repetición, churn y experimentos | Retención/expansión por segmento |
| Engineering | Lead time, deploy frequency, fallos y MTTR | SLO, change failure rate y deuda con impacto | Error budgets, capacidad y developer experience |
| IA | Éxito, coste, p50/p95, reintentos, aprobación humana | Calidad y margen por proveedor/caso | Regresión, routing y drift |
| Soporte | Volumen, first response, resolución y CSAT | Reapertura y coste/ticket | SLA y health/expansión |
| Comercial | Leads cualificados, conversión y aprendizaje | CAC, payback, pipeline y win rate | NRR, forecast y revenue por empleado |
| Empresa | Burn, runway, MRR y margen bruto | ARR, LTV/CAC con cohortes | Eficiencia de crecimiento y concentración |

No usar LTV/CAC hasta disponer de cohortes y churn suficientes. No optimizar deploy frequency sin medir fallos. El KPI principal propuesto es **proyectos que llegan a un resultado aprobado y publicado con margen positivo**.

## Hipótesis de costes

Todos los importes son USD mensuales y excluyen impuestos locales. Nómina significa coste empresarial total; el rango depende de ubicación y seniority. IA incluye modelos usados por agentes internos, no el consumo facturable de clientes, que debe tratarse como coste de ingresos.

| Etapa | Nómina | Cloud/SaaS/seguridad | Agentes IA | Marketing/operación | Total mensual | Total anual | Runway recomendado |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Núcleo 4–6 | $35k–$75k | $3k–$8k | $1k–$5k | $6k–$12k | $45k–$95k | $540k–$1.14M | 18 meses: $810k–$1.71M |
| 10 | $75k–$125k | $6k–$15k | $2k–$8k | $12k–$22k | $95k–$170k | $1.14M–$2.04M | 18 meses: $1.71M–$3.06M |
| 20 | $150k–$250k | $12k–$30k | $4k–$15k | $24k–$45k | $190k–$340k | $2.28M–$4.08M | 18 meses: $3.42M–$6.12M |
| 30 | $225k–$360k | $20k–$45k | $7k–$22k | $38k–$83k | $290k–$510k | $3.48M–$6.12M | 18 meses: $5.22M–$9.18M |
| 50 | $375k–$625k | $35k–$80k | $12k–$35k | $78k–$160k | $500k–$900k | $6M–$10.8M | 18 meses: $9M–$16.2M |

Escenario conservador = extremo inferior con contratación distribuida y servicios fraccionales; medio = punto medio; agresivo = extremo superior con seniority alto, GTM y compliance. El coste por persona implícito no debe usarse como salario: mezcla infraestructura y funciones externas.

## Roadmap condicionado

| Periodo | Qué / por qué | Responsable | Duración/coste incremental | Resultado y medición |
| --- | --- | --- | --- | --- |
| 0–30 días | Definir funnel, coste por generación, inventario de producción, owners y top 7 E2E | Founder + Tech Lead | 3–5 semanas; principalmente tiempo | Baseline fiable y riesgos priorizados |
| 1–3 meses | Consolidar experiencia principal, staging, rollback, SLO, provider contracts y soporte/KB | Product + Engineering | 2–3 meses; $10k–$40k además del equipo | Mayor activación, menos fallos y MTTR |
| 3–6 meses | Contratar núcleo 4–6 solo con runway; automatizar QA/FinOps; experimentos con flags | CEO/CTO/Product | $45k–$95k/mes | Retención y margen por proyecto comprobables |
| 6–12 meses | Llegar hasta 10 si hay PMF inicial; dos misiones de producto, AppSec y sales founder-led | Leadership | $95k–$170k/mes | Flujo repetible, soporte sostenible y pipeline |
| 12–18 meses | Llegar hasta 20 si hay demanda; squads, platform owner, CS y primer AE | Leadership | $190k–$340k/mes | Ownership distribuido y crecimiento repetible |
| 18–24 meses | Evaluar 30; no planificar 50 sin señales posteriores | Board/Leadership | $290k–$510k/mes | Tres misiones sostenibles y operación madura |

## Gates detallados

### De 10 a 20

- Retención de al menos tres cohortes y churn explicado.
- Dos trimestres de crecimiento con canal identificable.
- Margen bruto y coste de IA reconciliados.
- Backlog de outcomes para dos squads, no veinte listas de funciones.
- Soporte o entrega consistentemente saturados pese a automatización.
- 18 meses de runway tras las contrataciones.

### De 20 a 30

- Tres dominios con ownership estable y demanda independiente.
- Managers con 5–8 reportes o leads saturados por coordinación.
- SLO y carga de incidentes justifican SRE/security/QA dedicados.
- Pipeline ponderado y expansión sostienen el plan de contratación.
- Revenue por empleado no cae por dos trimestres sin explicación.

### De 30 a 50

- NRR, retención y forecast predecibles por segmento.
- Requisitos enterprise/regionales concretos, con contratos o pipeline avanzado.
- Cuatro o cinco squads financiables y plataforma compartida saturada.
- Proceso de contratación mantiene calidad y onboarding llega a productividad.
- Runway y downside plan aprobados por liderazgo/board.

## Cuellos de botella y prevención

| Etapa | Principal | Segundo | Riesgo técnico | Organizacional/financiero | Acción preventiva |
| --- | --- | --- | --- | --- | --- |
| Núcleo/10 | Founder como decisión única | Amplitud del producto | Regresiones y proveedores | Contratar antes de PMF | Un flujo, owners, E2E y gates |
| 20 | Coordinación entre squads | Plataforma compartida | Cola/datos/observabilidad | Managers tardíos o prematuros | Límites de dominio y EM por necesidad |
| 30 | Dependencias transversales | GTM vs capacidad | Reliability/compliance | Capas y burn | Plataforma, portfolio y headcount gates |
| 50 | Alineación por segmento | Calidad de contratación | Escala y acceso | Burocracia/runway | OKRs pocos, spans sanos y FinOps |

## Revisión mensual del plan

El dashboard de dirección debe incluir: proyectos activos y publicados, activación y retención por cohorte, margen por proyecto/proveedor, SLO e incidentes, soporte, pipeline ponderado, MRR/ARR, burn, runway, headcount y revenue por empleado. Cada contratación abierta debe indicar cuál de estas señales pretende cambiar y cuándo se cancela si la evidencia desaparece.

