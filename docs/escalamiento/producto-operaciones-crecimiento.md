# Producto, comunicación, soporte y crecimiento

## Sistema de producto

La experiencia principal debe ser `descubrir → crear dentro de un proyecto → evaluar → aprobar → publicar/comprar`. El roadmap se organiza por resultados de ese embudo, no por cantidad de funciones.

| Etapa | Responsable | Cadencia | Artefactos |
| --- | --- | --- | --- |
| Núcleo/10 | Founder + PM o product lead | Discovery semanal, revisión quincenal | Problema, hipótesis, métrica, decisión |
| 20 | Head of Product + PM por misión | Reviews de squad y portfolio mensual | Roadmap por outcomes, research repository |
| 30 | 2 PM + Head | Bets trimestrales, discovery continuo | OKRs, experimentos, segmentación |
| 50 | 3–4 PM + research/design | Portfolio trimestral con capacity guardrails | Estrategia por segmento y lifecycle |

Priorización recomendada: impacto esperado × confianza ÷ esfuerzo y riesgo, complementada por obligaciones de seguridad. Cada experimento define población, métrica primaria, guardrail de margen, duración mínima y criterio de decisión. Los flags se eliminan al terminar.

## Embudo y feedback

Embudo autoritativo: `proyecto creado → brief completo → primera generación → resultado aprobado → publicación/compra → repetición`. Medir tiempo al primer valor, coste hasta aprobación, abandono y margen por proyecto. Feedback cualitativo se relaciona con la etapa del embudo sin guardar prompts privados en analítica general.

## Comunicación interna

| Ritual | Formato | Etapa |
| --- | --- | --- |
| Estado diario | Asíncrono: avance, siguiente, bloqueo | Todas |
| Planning | 45–60 min semanal por squad | 10+ |
| Product review/demo | 45 min quincenal | Todas |
| Retro | 45 min mensual o tras hito | Todas |
| Architecture review | Asíncrono con ADR; reunión solo por desacuerdo/riesgo | Todas |
| Engineering review | 60 min mensual: SLO, deuda, coste, incidentes | 10+ |
| One-on-one | Quincenal, privada | Cuando haya managers |
| Leadership | 60 min semanal con decisiones preleídas | 20+ |
| Company update | 30 min mensual + memo | 20+ |

No usar reuniones para leer estados. Toda reunión debe tener decisión, dueño y notas. Evitar ceremonias de sprint si un flujo continuo con límites WIP funciona mejor.

## Documentación mínima

- README y configuración local menores a cinco minutos.
- Mapa de arquitectura y límites de dominios.
- ADR para decisiones duraderas y costosas de revertir.
- OpenAPI o referencia equivalente para APIs compartidas.
- Runbooks de deploy, rollback, incidentes, backup y proveedores.
- Manual de producto, eventos analíticos y definiciones de KPI.
- Onboarding 30/60/90 y directorio de ownership.
- Políticas de seguridad, acceso, retención, privacidad y vendors.
- Engineering handbook a partir de 10 personas.
- Employee handbook y políticas laborales revisadas localmente antes de 20.

## Soporte y Customer Success

| Etapa | Modelo | SLA inicial orientativo |
| --- | --- | --- |
| Núcleo/10 | Bandeja única; founder/operator; IA clasifica y propone | P1 2 h hábiles, normal 1 día hábil |
| 20 | Support owner + rotación técnica; KB basada en tickets | P1 1 h, normal 8 h hábiles |
| 30 | Support y CS separados; health scores y onboarding | Por plan y severidad |
| 50 | Cobertura regional solo si contratos la financian | SLA contractual medido |

La IA puede clasificar, buscar artículos, pedir datos no sensibles y responder FAQs con alta confianza. Debe escalar pagos, reembolsos, privacidad, abuso, seguridad, cuentas bloqueadas, clientes molestos y cualquier baja confianza. CSAT, first response, tiempo de resolución, reaperturas y coste por ticket deben revisarse juntos.

## Ventas y marketing

No contratar un equipo de ventas antes de que el fundador cierre repetidamente un perfil de cliente reconocible. Secuencia:

1. Founder-led sales y entrevistas; Growth generalist prueba canales.
2. Primer AE cuando existe pipeline que el founder no puede atender y playbook repetible.
3. SDR solo cuando la prospección muestra conversión y CAC recuperable.
4. Product marketing cuando segmentación, posicionamiento y lanzamientos son cuellos reales.
5. Customer Success dedicado cuando expansión/renovación justifican ownership.

Agentes pueden investigar cuentas, deduplicar CRM, redactar borradores, auditar SEO y reutilizar contenido. Humanos aprueban targeting, claims, precios, contratos y comunicaciones sensibles. Métricas: conversión por etapa, ciclo, win rate, CAC, payback, pipeline coverage, expansión, churn y margen; volumen de correos no es éxito.

## Operaciones de personas

People Ops sigue fraccional hasta que contrataciones, legislación o carga de managers justifiquen un owner. Toda entrevista usa scorecard; la IA puede coordinar y resumir notas consentidas, pero no filtra por atributos protegidos ni toma decisiones finales. El acceso se provisiona desde roles y se revoca durante offboarding, con inventario de equipos y transferencia de propiedad.

