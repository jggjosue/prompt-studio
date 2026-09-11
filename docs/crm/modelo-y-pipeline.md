# Modelo de datos, ciclo del cliente y pipeline

## Límites de sistemas

| Dominio | Sistema autoritativo | Copia en CRM |
| --- | --- | --- |
| Identidad y acceso | Clerk | ID externo, email, nombre y estado resumido |
| Producto, proyectos y uso | MongoDB | Métricas agregadas y últimos hitos; nunca prompts privados |
| Pagos, facturas y reembolsos | Stripe | IDs, plan, MRR, estado y fechas; sin datos de tarjeta |
| Comunicación comercial y soporte | HubSpot | Timeline, consentimientos comerciales, actividades y tickets |
| Correo transaccional | Resend | Eventos de entrega relevantes, no el cuerpo completo |

La clave de integración será `clerk_user_id` para personas autenticadas, `stripe_customer_id` para facturación y `organization_external_id` para empresas. El CRM genera su propio ID, pero no reemplaza esas claves.

## Ciclo de relación

`Lead → Contacto → Oportunidad → Cliente → Onboarding → Cliente activo → Soporte → Renovación → Expansión → Perdido`

- **Lead:** persona o empresa con señal y base legal de contacto.
- **Contacto:** identidad deduplicada con canal y consentimiento conocidos.
- **Oportunidad:** necesidad comercial, valor y siguiente acción verificables.
- **Cliente:** pago o contrato confirmado por Stripe/sistema financiero.
- **Onboarding:** activación hacia primer proyecto útil y publicado.
- **Activo:** uso/valor reciente y cuenta sin bloqueo comercial.
- **Soporte:** incidencias ligadas al contacto, cuenta, producto y severidad.
- **Renovación:** evento futuro con owner y riesgo.
- **Expansión:** mayor plan, créditos, equipo o servicio complementario.
- **Perdido:** razón estructurada, posibilidad de reactivación y retención legal.

## Pipeline adaptado

| Etapa | Entrada obligatoria | Acción y salida | Probabilidad inicial orientativa |
| --- | --- | --- | ---: |
| Nuevo inbound/product-qualified lead | Fuente, consentimiento, señal de producto | Deduplicar y completar mínimo | 5% |
| Calificado | ICP, necesidad y posible valor | Asignar owner y siguiente paso | 15% |
| Discovery agendada | Fecha y participantes | Confirmar problema, proceso y autoridad | 25% |
| Discovery completada | Notas estructuradas y caso de uso | Demo o cierre como no fit | 35% |
| Demo/validación | Caso y criterio de éxito | Validar flujo con datos permitidos | 50% |
| Propuesta enviada | Producto, importe, plazo y expiración | Seguimiento con fecha | 65% |
| Seguridad/legal/procurement | Stakeholders y bloqueos | Resolver requisitos y aprobar excepciones | 75% |
| Compromiso verbal | Fecha objetivo y decisor | Contrato/checkout | 90% |
| Ganado | Pago o acuerdo firmado | Crear onboarding y handoff | 100% |
| Perdido | Motivo, competidor y fecha posible | Cerrar; nurture solo con permiso | 0% |

Las probabilidades se sustituyen por tasas históricas después de 30–50 oportunidades cerradas. Un deal sin siguiente acción y fecha se considera estancado.

## Pipeline de onboarding y éxito

`Pago confirmado → Kickoff pendiente → Brief completo → Primera generación → Resultado aprobado → Primera publicación → Activo → Riesgo → Renovado/Expandido/Cancelado`

El milestone de éxito recomendado es **primer activo aprobado y publicado**, no inicio de sesión. MongoDB emite el progreso agregado al CRM; el CRM no consulta contenido privado del proyecto.

## Pipeline de soporte

`Nuevo → Clasificado → Esperando soporte → Esperando ingeniería/proveedor → Esperando cliente → Resuelto → Cerrado`

Severidades:

- **P1:** seguridad, pagos generalizados o indisponibilidad crítica.
- **P2:** función principal bloqueada sin alternativa.
- **P3:** degradación con alternativa.
- **P4:** consulta, solicitud o mejora.

## Campos mínimos

### Lead/contacto

`email`, nombre, cargo, idioma, zona horaria, país, fuente original, campaña, fecha de consentimiento, base legal/canal permitido, `clerk_user_id`, etapa lifecycle, owner, ICP score, último/ próximo contacto, intereses, fecha de creación y motivo de descalificación.

No copiar fecha de nacimiento, prompts, secretos, credenciales, contenido generado privado ni metadata innecesaria.

### Empresa

Nombre, dominio, sector, tamaño aproximado, país, segmento, caso de uso, herramientas declaradas, volumen de equipo previsto, owner, estado de seguridad/legal, plan, ARR/MRR agregado, salud y renovación.

### Deal

Nombre, empresa/contactos, pipeline/etapa, caso de uso, producto, seats/créditos, importe, moneda, periodicidad, probabilidad, fuente, competidor, decisor, champion, siguiente acción/fecha, cierre previsto, requisitos de seguridad, razón de pérdida y `stripe_customer_id`/quote ID cuando existan.

### Cliente y suscripción

`clerk_user_id`, organización, plan, estado, MRR/ARR, inicio, periodo actual, renovación, cancelación, motivo, método de adquisición, primera activación, última actividad agregada, health score y CSM. Stripe continúa siendo la verdad financiera.

### Ticket

Asunto, canal, contacto/empresa, producto, categoría, severidad, estado, owner, proveedor afectado, generación/job ID no sensible, SLA objetivo, primera respuesta, resolución, causa, workaround, CSAT y enlace al incidente si aplica.

### Interacción

Tipo, fecha, participantes, dirección, resultado, resumen aprobado, siguiente acción y fuente. Grabaciones/transcripciones requieren consentimiento y retención específica.

### Producto contratado

SKU interno, nombre, tipo, plan, límites, precio contratado, moneda, fecha efectiva, descuento/aprobador, renovación y sistema autoritativo. No duplicar cálculos financieros que Stripe ya mantiene.

## Calidad y gobierno

- Email normalizado y dominio para deduplicación; merge siempre reversible/auditable.
- Campos obligatorios cambian por etapa, no todos desde el primer formulario.
- Diccionario de datos con owner, tipo, fuente, propósito, retención y sensibilidad.
- Sincronización idempotente, `updated_at` y fuente ganadora por campo.
- Borrado/acceso debe propagarse entre CRM, Clerk, MongoDB, Stripe y Resend según obligación aplicable.
- Auditoría mensual de duplicados, campos vacíos, deals estancados y contactos sin base de comunicación.

