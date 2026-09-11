# Agentes, controles y automatización

## Arquitectura multiagente propuesta

```text
Evento o solicitud
       │
       ▼
Orquestador de trabajos ──► política de permisos y presupuesto
       │
       ├── Producto/Research
       ├── Coding/Review/QA
       ├── DevOps/SRE/Security
       ├── Data/FinOps
       └── Support/Growth/Content
       │
       ▼
Cola durable → artefactos versionados → evaluación → aprobación humana → ejecución
       │
       └── auditoría, coste, duración, entradas permitidas y resultado
```

Los agentes no se envían instrucciones libres entre sí. Intercambian trabajos tipados, IDs de artefactos y resultados validados. Cada acción tiene identidad de servicio, presupuesto, timeout, idempotencia, límites de herramientas y registro. Datos privados se minimizan antes de entrar al contexto.

## Catálogo inicial

| Agente | Objetivo y herramientas | Acceso | Automático | Requiere aprobación | Frecuencia / KPI | Riesgo / supervisor | Coste mensual supuesto |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| Coding | Implementar tickets acotados con repo y tests | Código sin secretos | Rama y pruebas | Merge y migraciones | Por ticket; aceptación, retrabajo | Código inseguro; Tech Lead | $200–$2,000 |
| Review | Detectar defectos en diffs | PR, tests, estándares | Comentarios | Bloquear/aceptar merge | Cada PR; precisión útil | Falsos positivos; Tech Lead | $100–$800 |
| QA | Crear y ejecutar casos | Preview y fixtures | Suites no destructivas | Cambio de baseline | Cada PR/noche; escapes | Pruebas frágiles; QA owner | $150–$1,500 |
| Documentation | Mantener docs desde cambios aprobados | Repo y decisiones | Borradores/enlaces | Políticas y claims | Cada release; frescura | Documentación falsa; área dueña | $50–$500 |
| SRE | Triage de alertas y runbooks | Métricas/logs saneados | Diagnóstico y ticket | Rollback o cambios prod | Continuo; MTTA/precisión | Acción destructiva; on-call | $150–$1,500 |
| Security | Dependencias, SAST y secretos | Código y SBOM | Escaneo y issue | Excepciones y remediación crítica | PR/diario; findings válidos | Fuga de datos; Security/CTO | $100–$1,200 |
| Data/FinOps | Coste, calidad y embudo | Eventos agregados | Informes y alertas | Cambios de precio/presupuesto | Diario/semanal; exactitud | Métrica incorrecta; Product/Finance | $100–$1,000 |
| Research/Product | Sintetizar feedback y opciones | Feedback autorizado | Resumen e hipótesis | Roadmap y contacto | Semanal; decisiones apoyadas | Sesgo; PM | $100–$900 |
| Support | Clasificar y responder casos conocidos | Ticket y KB, mínimo PII | Respuesta de bajo riesgo | Reembolsos, seguridad y conflictos | Continuo; CSAT/escalamiento | Respuesta dañina; Support Lead | $200–$2,500 |
| Growth/SEO | Borradores y auditorías | Catálogo y analítica agregada | Briefs y tests | Publicación y claims | Semanal; conversión/margen | Spam/claims; Growth | $100–$1,500 |
| Sales qualification | Enriquecer y priorizar leads consentidos | CRM limitado | Score y borrador | Envío sensible/oferta | Diario; aceptación/conversión | Privacidad/spam; Sales | $100–$1,000 |
| Finance assistant | Conciliación preliminar y forecast | Datos financieros de solo lectura | Excepciones y borradores | Pagos, impuestos, cierre | Semanal/mensual; exactitud | Fraude/error; Finance | $100–$1,000 |

Los rangos reflejan consumo variable y herramientas, no salarios equivalentes. Deben imponerse topes por agente y coste por resultado aceptado.

## Despliegue por etapa

| Etapa | Agentes activos recomendados | Control |
| --- | --- | --- |
| Ahora | Coding, Review, QA, Docs, Security | Solo repositorio y CI; ningún acceso de escritura a producción |
| 10 | Añadir Support, Data/FinOps, Research | Aprobación humana y presupuesto por workflow |
| 20 | Añadir SRE, Growth/SEO, Sales qualification | Identidades separadas, cola, trazas y evaluación mensual |
| 30 | Añadir Finance; especializar QA y provider evaluation | Comité de riesgos trimestral y red-team de flujos |
| 50 | Variantes por squad y región, no agentes generales ilimitados | Plataforma interna con catálogo, permisos y SLO |

## Matriz humano–agente

| Proceso | Responsable humano | Agente | Automatización | Supervisión | Riesgo |
| --- | --- | --- | --- | --- | --- |
| Priorización de roadmap | Head of Product | Research/Product | Asistido por IA | Cada decisión | Alto |
| Diseño técnico | Tech Lead | Architect/Coding | Asistido por IA | Cada ADR | Alto |
| Implementación acotada | Engineer | Coding | Semiautomatizado | PR obligatorio | Medio |
| Code review | Tech Lead | Review | Semiautomatizado | Revisor humano en riesgo alto | Alto |
| Tests no destructivos | QA/Engineer | QA | Altamente automatizado | Fallos y baselines | Medio |
| Deploy a producción | On-call | DevOps | Autónomo bajo límites | Aprobación en cambios de riesgo | Alto |
| Triage de incidentes | Incident Commander | SRE | Semiautomatizado | Continuo | Crítico |
| Respuesta FAQ | Support | Support | Altamente automatizado | Muestreo y escalamiento | Medio |
| Reembolso | Finance/Support | Support | Asistido por IA | Siempre | Alto |
| Publicación de marketing | Growth | Content/SEO | Semiautomatizado | Siempre | Medio |
| Calificación de leads | Sales | Sales agent | Semiautomatizado | Revisión de criterios | Medio |
| Contratación | Hiring manager | Recruiting | Asistido por IA | Siempre | Alto |
| Pagos y cierre | Finance | Finance assistant | Asistido por IA | Siempre, doble control | Crítico |
| Contratos/compliance | Legal responsable | Legal assistant | Asistido por IA | Siempre | Crítico |
| Accesos y despidos | People/Security | HR/Security | Manual con checklist | Doble aprobación | Crítico |

## Automatizaciones y ahorro orientativo

| Cuándo | Automatización | Ahorro potencial/mes | Condición |
| --- | --- | ---: | --- |
| Ahora | Triage de CI, actualización de docs y dependencias | 20–50 h | Métrica de falsos positivos |
| Ahora | Coste/latencia/error por proveedor | 15–30 h | Eventos financieros reconciliados |
| 10 | Clasificación de soporte y respuestas KB | 30–80 h | Escalamiento y revisión de muestras |
| 10 | QA de regresión del flujo principal | 20–60 h | Fixtures estables y ownership |
| 20 | Onboarding y provisión de accesos | 15–40 h | RBAC y checklist auditable |
| 20 | Lead routing y briefs de cuenta | 20–60 h | Consentimiento y reglas anti-spam |
| 30 | Triage de incidentes y correlación | 20–50 h | Runbooks y observabilidad madura |
| 30 | Facturación y conciliación preliminar | 15–40 h | Aprobación de Finance |
| 50 | Compliance evidence y revisiones de acceso | 20–60 h | Controles probados |

Estas horas son hipótesis. El ahorro real se mide como tiempo evitado menos revisión, corrección y mantenimiento.

