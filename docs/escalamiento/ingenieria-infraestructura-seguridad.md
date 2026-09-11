# Ingeniería, infraestructura y seguridad

## Diagnóstico

La aplicación es un monolito modular Next.js con frontend, rutas API y lógica de producto en el mismo repositorio; MongoDB persiste el dominio y varios SaaS cubren identidad, pagos, objetos, correo, analítica e IA. Esta arquitectura es apropiada para la etapa actual. Dividirla en microservicios o adoptar Kubernetes ahora aumentaría coste operativo sin evidencia de necesidad.

Riesgos visibles: superficie amplia (90 páginas, 101 APIs y 41 modelos), solo tres archivos E2E, múltiples proveedores externos, trabajo asíncrono disparado por cron, configuración de dos destinos de hosting y una documentación `blueprint.md` que conserva un nombre y alcance históricos. El build y la suite requieren Node 22; CI ya lo declara.

## Evolución técnica

| Etapa | Git y entrega | Pruebas y QA | Infraestructura | Fiabilidad |
| --- | --- | --- | --- | --- |
| Núcleo/10 | Trunk-based, ramas cortas, PR obligatorio, CODEOWNERS y protección de `main` | Unitarias por dominio, integración API y E2E del flujo principal; preview por PR | Vercel + MongoDB gestionado + R2; separar dev/staging/prod | SLO inicial, alertas accionables, backups y rollback documentado |
| 20 | Owners por squad, ADR para decisiones transversales, releases semanales | Contract tests de proveedores, fixtures, pruebas de migración y carga selectiva | IaC para configuración crítica; colas gestionadas si cron deja de cumplir | On-call primario/secundario, postmortems sin culpa, DR probado |
| 30 | Release train opcional por riesgo; feature flags con expiración | Quality gates por riesgo, DAST en staging y regresión de modelos | Réplicas/índices según métricas; aislamiento de workers; multi-región solo por necesidad | SLO por journey, error budgets y capacity planning |
| 50 | Plataforma de desarrollo y golden paths | Equipos dueños de calidad; performance y resilience testing | Contenedores solo para workers portables; Kubernetes únicamente con carga/aislamiento que lo justifique | Guardia 24/7 si existe compromiso contractual y cobertura regional |

## Flujo de cambio

`issue con resultado → rama corta → PR → CI → preview → revisión humana → flag → despliegue gradual → métricas → promoción o rollback`

- Ningún cambio mezcla migración irreversible y activación inmediata.
- Los flags tienen dueño, fecha de expiración y métrica.
- Dependencias se actualizan en lotes pequeños; vulnerabilidades críticas tienen SLA.
- Se reserva 15–20% de capacidad para deuda solo si se prioriza por impacto, no por estética.
- Rollback debe ser un comando documentado y probado trimestralmente.

## Entornos

| Entorno | Datos | Acceso | Propósito |
| --- | --- | --- | --- |
| Local | Fixtures sintéticos | Desarrollo | Implementación rápida |
| Test CI | Efímeros/sintéticos | Robots CI | Contratos y regresión |
| Preview | Sintéticos o anonimizados | Equipo y reviewers | Revisión por PR |
| Staging | Representativos sin producción cruda | Equipo limitado | Integración, carga y release candidate |
| Producción | Reales | Mínimo privilegio y auditoría | Usuarios y operaciones |

## Observabilidad e incidentes

Definir SLI para disponibilidad, latencia, éxito de generación, éxito de pago y publicación. Empezar con objetivos realistas basados en cuatro semanas de baseline, no con “cinco nueves”. Alertas deben vincular a runbook, dueño y severidad.

Proceso: `detectar → declarar severidad → asignar Incident Commander → mitigar → comunicar → recuperar → revisar → seguir acciones`. MTTA, MTTR, recurrencia y acciones vencidas son mejores señales que contar incidentes sin contexto.

Backups requieren cifrado, retención definida, restauración mensual de muestra y prueba semestral de recuperación completa. RPO y RTO se acuerdan por dominio; pagos e identidad merecen objetivos más estrictos que catálogos regenerables.

## Seguridad progresiva

| Control | 10 | 20 | 30 | 50 |
| --- | --- | --- | --- | --- |
| MFA, SSO y mínimo privilegio | Obligatorio en sistemas críticos | Centralizar altas/bajas | Revisiones trimestrales | SCIM y recertificación por rol |
| Secretos | Gestor del hosting, rotación y escaneo | Identidades de servicio separadas | Rotación automatizada | Just-in-time para producción |
| Autorización | Checks servidor y admin explícito | RBAC de producto | Permisos por organización/proyecto | Policy-as-code donde aporte valor |
| Cifrado | TLS y cifrado gestionado | Inventario de claves | KMS y separación por entorno | Requisitos enterprise/regionales |
| AppSec | Dependencias, secretos, SAST | Threat modeling y pentest anual | Security engineer y DAST | Programa continuo y vendor risk |
| Auditoría | Auth, pagos, admin, IA y exportaciones | Logs inmutables para eventos críticos | Alertas de abuso | Evidencia de compliance automatizada |
| Incidentes | Runbook y contactos | Simulacro semestral | Tabletop trimestral | Cobertura contractual/24x7 si aplica |

Procesos que nunca deben ser totalmente autónomos: cambios de permisos, exposición de datos, aceptación de riesgo, respuesta legal, pago o reembolso material, borrado masivo, migración irreversible y cierre de incidentes críticos.

## Decisiones inmediatas

1. Elegir Vercel o Firebase App Hosting como ruta autoritativa y eliminar ambigüedad operacional.
2. Añadir tests E2E específicos para autenticación, generación, créditos/pago, descarga, idioma, móvil y reintentos.
3. Pasar el procesamiento asíncrono a una cola durable cuando se demuestre que el cron de un minuto pierde SLA, concurrencia o idempotencia.
4. Medir coste real por proveedor y reconciliarlo con créditos cobrados.
5. Crear runbooks para deploy, rollback, caída de proveedor, webhook duplicado y restauración de MongoDB.

