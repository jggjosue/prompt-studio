# Integraciones, automatizaciones y agentes

## Arquitectura

```text
Web/App ──eventos permitidos──► capa de integración ──► HubSpot
  │                                   │                   │
  ├── Clerk (identidad)               ├── cola/reintentos  ├── Marketing/Ventas
  ├── MongoDB (producto)              ├── idempotencia     ├── Customer Success
  ├── Stripe (finanzas)               ├── mapeo/consent.   └── Tickets/Reporting
  └── Resend (transaccional)          └── auditoría                │
                                                                  ▼
                                                         Analytics + agentes IA
```

Implementar adaptador servidor `src/lib/crm`, no llamadas desde el navegador. Webhooks entrantes validan firma, conservan un ID de evento, responden rápido y procesan mediante cola/reintentos. Un dead-letter log evita perder cambios. Secretos viven en el gestor del entorno.

## Primeras diez automatizaciones

| # | Disparador → acción | Nivel | Aprobación/KPI |
| ---: | --- | --- | --- |
| 1 | Registro Clerk → upsert de contacto | Automático | Consentimiento y duplicados |
| 2 | Compra Stripe confirmada → lifecycle cliente + producto | Automático | Reconciliación 100% |
| 3 | Reembolso/cancelación → estado y tarea de revisión | Automático | No enviar retención inapropiada |
| 4 | Proyecto con brief completo → actualizar activación | Automático | Cobertura de eventos |
| 5 | Primer resultado publicado → marcar first value | Automático | Tiempo al primer valor |
| 6 | Lead con señal alta → score, owner y tarea | Semiautomatizado | Aceptación de leads |
| 7 | Deal sin actividad → alerta y borrador de seguimiento | IA con aprobación | Respuesta/no spam |
| 8 | Nuevo ticket → categoría, severidad y artículo sugerido | Semiautomatizado | Precisión y escalaciones |
| 9 | Riesgo de renovación → alerta, diagnóstico y playbook | IA con aprobación | Retención/expansión |
| 10 | Resumen semanal → pipeline, forecast, soporte y calidad | Automático | Exactitud reconciliada |

## Agentes IA

| Agente | Consulta / modifica | Automático | Aprobación humana | Supervisor | Riesgo | Ahorro supuesto mensual |
| --- | --- | --- | --- | --- | --- | ---: |
| Lead Qualification | Fuente, empresa, uso, engagement / score y motivo | Priorizar y pedir campos faltantes | Descalificar cuentas estratégicas | Growth/Sales | Sesgo y mala calidad | 15–40 h |
| SDR | Leads aprobados, timeline / tareas y borradores | Research y personalización | Primer envío y secuencias sensibles | Sales | Spam/privacidad | 20–60 h |
| Follow-up | Deals, última actividad / próxima tarea | Alertas y borradores | Envío, descuento o deadline | AE/Founder | Tono y presión indebida | 10–30 h |
| CRM Data | Campos, duplicados, sync / correcciones seguras | Normalizar y señalar conflictos | Merge/borrado masivo | RevOps | Pérdida o unión errónea | 20–50 h |
| Customer Success | Uso agregado, plan, tickets / salud y tareas | Detectar riesgo y sugerir playbook | Contacto y oferta | CSM | Inferencias falsas | 15–40 h |
| Support | Ticket, KB, estado permitido / categoría y borrador | FAQ de alta confianza | Pagos, privacidad, seguridad, P1/P2 | Support Lead | Respuesta dañina | 30–100 h |
| Marketing | Segmentos consentidos / campaña borrador | Hipótesis y variantes | Audiencia, claim y publicación | Growth | Spam/claims | 15–50 h |
| Email | Contexto mínimo / borrador, no consentimiento | Clasificar intención | Envío salvo plantilla transaccional | Owner del proceso | Fuga de datos | 10–30 h |
| Meeting Summary | Reunión consentida / nota y acciones | Resumir y proponer tareas | Guardar compromisos/quotes | Participante owner | Grabación y errores | 10–25 h |
| Sales Intelligence | Deals, actividad, producto / insights | Detectar patrones | Forecast final | Sales Lead | Correlación falsa | 10–30 h |
| Reporting | Datos agregados / snapshots | Dashboards y anomalías | Cierre financiero y board report | Ops/Finance | Métrica incoherente | 15–35 h |

Los ahorros son hipótesis brutas; se resta tiempo de revisión, corrección y mantenimiento. Ningún agente se contabiliza como empleado.

## Permisos

- Cada agente tiene identidad propia, scopes mínimos, límite de coste y acciones permitidas.
- Lectura de prompts privados, documentos de clientes, tarjetas, credenciales y campos legales queda prohibida.
- Envíos masivos, descuentos, propuestas, cambios de etapa crítica, merges, borrados y exportaciones requieren aprobación.
- Toda modificación registra agente, regla/modelo, versión, campos previos/nuevos, correlación y aprobador.
- Evaluar mensualmente precisión, tasa de aceptación, quejas, incidentes, coste y horas netas ahorradas.

## Fuente ganadora por evento

| Evento | Dirección |
| --- | --- |
| Alta/cambio de email verificado | Clerk → CRM |
| Activación y uso agregado | MongoDB → CRM |
| Compra, factura, reembolso, suscripción | Stripe → CRM |
| Cambio de deal, tarea o ticket | CRM → analytics; a producto solo si es necesario |
| Preferencia de marketing | CRM ↔ Resend con timestamp y registro de origen |

No crear sincronización bidireccional general. Cada campo tiene una autoridad para evitar bucles y sobrescrituras.

