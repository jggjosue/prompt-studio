# Estrategia de CRM para Prompt Studio

**Estado:** propuesta  
**Fecha de evaluación:** 9 de septiembre de 2026  
**Decisor:** Founder/CEO con responsable técnico y futuro owner de Revenue Operations

## Recomendación

| Decisión | Resultado |
| --- | --- |
| CRM actual | No hay un producto CRM dedicado; existe un CRM de facto distribuido |
| CRM recomendado ahora | **HubSpot Customer Platform Starter** |
| Alternativa económica | **Zoho CRM Free/Standard** |
| Alternativa para crecimiento rápido | **HubSpot Professional**, solo cuando la automatización y reporting lo justifiquen |
| Alternativa para automatización e IA | **Attio Pro** |
| Alternativa para integraciones propias | **Attio**, por su modelo flexible, REST API, OAuth y webhooks |
| Tiempo de implementación inicial | 2–4 semanas |
| Owner inicial | Founder o Growth/Customer operator; soporte técnico del Tech Lead |

HubSpot Starter es la elección actual porque Prompt Studio necesita unificar ventas, marketing básico y soporte antes de optimizar un CRM extremadamente flexible. Su CRM gratuito admite hasta dos usuarios y Starter se anuncia desde USD 7 por asiento en oferta o USD 20 por asiento/mes como precio de referencia; hay que confirmar la cotización antes de comprar. HubSpot documenta objetos y webhooks para contactos, empresas, deals, tickets, productos y line items, que encajan con el ciclo completo propuesto.

No se debe trasladar a HubSpot la verdad de autenticación, créditos, permisos, generación o pagos. Clerk, MongoDB y Stripe continúan como sistemas autoritativos; el CRM conserva la vista comercial y de servicio.

## Hechos confirmados

El repositorio contiene una relación de cliente repartida:

| Sistema | Responsabilidad comprobada |
| --- | --- |
| Clerk | Identidad, sesiones y metadata de suscripción |
| MongoDB | Perfiles, actividad, intereses, guardados, compras, proyectos, generaciones, créditos, afiliación y analítica |
| Stripe | Clientes de pago, suscripciones, facturas, compras y reembolsos |
| Resend | Contactos de audiencia y correo transaccional |

Existen sincronizaciones Clerk/MongoDB → Resend, pings de actividad, webhooks firmados de Clerk y Stripe, compras idempotentes y eventos de observabilidad. No se encontró dependencia, variable, webhook o SDK de HubSpot, Attio, Pipedrive, Zoho, Salesforce ni otro CRM dedicado.

Tampoco existe evidencia de entidades autoritativas para `Company`, `Lead`, `Deal`, `Pipeline` o `Ticket`. No hay historial de conversaciones de soporte integrado. Por eso la respuesta correcta no es “Resend es el CRM”: Resend es una pieza de email/contactos dentro de un CRM de facto incompleto.

## Suposiciones que deben validarse

- El equipo actual es pequeño y menos de cinco personas necesitan editar el CRM.
- El movimiento comercial inicial será mixto: autoservicio más venta consultiva para planes o servicios de mayor valor.
- No existen todavía volúmenes elevados de soporte ni requisitos enterprise contratados.
- Resend seguirá enviando correo transaccional; las campañas comerciales podrían migrar o sincronizarse.
- Los costes no incluyen contactos de marketing, créditos de IA, onboarding, impuestos ni add-ons.

Si estas hipótesis son falsas, se debe reevaluar la edición, no cambiar automáticamente de proveedor.

## Comparación

Precios públicos consultados el 9 de septiembre de 2026; importes en USD, normalmente con facturación anual y por asiento. Son referencias, no cotizaciones.

| CRM | Precio público de entrada | Fortalezas para Prompt Studio | Desventajas | Veredicto |
| --- | --- | --- | --- | --- |
| HubSpot | Free: 2 usuarios; Starter: desde $7 promocional/$20 lista por asiento; Professional suite desde $1,300/mes con 6 asientos | Contactos, empresas, deals, tickets, marketing, servicio, reporting, API y webhooks en una plataforma | El salto a Professional es costoso; contactos/créditos y hubs elevan TCO | Mejor equilibrio actual y mejor ruta all-in-one |
| Attio | Free: 3; Plus: $35 anual/$44 mensual por usuario; Pro: $79 anual/$99 mensual | Objetos flexibles, relaciones, enrichment, workflows, agentes IA, REST API, OAuth y webhooks | Menos completo para help desk/marketing; puede requerir herramientas adicionales | Mejor para producto API-first y automatización propia |
| Pipedrive | Lite $14; Growth $39; Premium $59; Ultimate $79 por asiento/mes anual | Pipeline excelente, email, secuencias, forecast, API, webhooks y adopción sencilla | Soporte/CS y marketing profundo requieren add-ons o productos externos | Buena opción si ventas es el único problema |
| Zoho CRM | Free: 3 usuarios; ediciones de pago económicas según región | Gran amplitud, módulos, workflows, API, webhooks y ecosistema de soporte/marketing | Configuración y UX más complejas; riesgo de adoptar demasiado ecosistema | Mejor alternativa de coste y personalización |

Fuentes oficiales: [precios de HubSpot](https://www.hubspot.com/pricing/suite), [webhooks de HubSpot](https://developers.hubspot.com/docs/api-reference/latest/webhooks/guide), [precios de Attio](https://attio.com/pricing), [API de Attio](https://docs.attio.com/rest-api/overview), [precios de Pipedrive](https://www.pipedrive.com/en/pricing), [API de Pipedrive](https://developers.pipedrive.com/docs/api/v1), [precios de Zoho CRM](https://www.zoho.com/crm/zohocrm-pricing.html) y [API V8 de Zoho](https://www.zoho.com/crm/developer/docs/api/v8/).

## Por qué no mantener solo el sistema actual

El modelo propio es valioso como customer data layer, pero construir dentro de Prompt Studio actividades, pipeline, bandeja, permisos comerciales, email sync, tickets, SLA, forecast y reporting distraería del producto principal. Mantenerlo solo sería razonable mientras el founder gestione menos de unas decenas de conversaciones activas y no exista venta consultiva ni soporte con SLA.

## Criterios de salida de HubSpot

Reevaluar, no necesariamente reemplazar, cuando ocurra alguno:

- El coste anual supera el valor de automatización y consolidación medido.
- Objetos o permisos no pueden representar proyectos, suscripciones y organizaciones.
- Límites API impiden sincronización fiable.
- El equipo necesita un workspace altamente personalizado y Attio reduce claramente la complejidad total.
- Se requieren procesos enterprise que obliguen a otra plataforma.

## Documentos

- [Modelo de datos, ciclo del cliente y pipeline](modelo-y-pipeline.md)
- [Integraciones, automatizaciones y agentes](integraciones-y-agentes.md)
- [Etapas, costes, métricas e implementación](escalamiento-e-implementacion.md)
- [Modelo CRM existente](../operaciones/crm.md)

