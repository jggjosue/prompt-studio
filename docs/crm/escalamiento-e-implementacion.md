# Escalamiento, métricas e implementación del CRM

## Evolución por tamaño

Solo necesitan asiento de edición quienes venden, atienden, administran o analizan relaciones. Engineering y producto pueden usar dashboards o asientos de solo lectura cuando el plan lo permita.

| Empresa | Usuarios CRM | Áreas y roles | Pipelines/automatización | Agentes | Coste HubSpot estimado |
| --- | ---: | --- | --- | --- | ---: |
| Hasta 10 | 3–5 | Founder admin; Growth/Sales; Support/CS; Ops | Ventas, onboarding y soporte básicos; 10 automatizaciones | Qualification, Data, Support, Reporting | Starter: $60–$100/mes a tarifa lista; $720–$1,200/año |
| 20 | 6–9 | Añadir AE, PM view, Support y RevOps owner | SLA, renovación, expansión, scoring y forecast | Añadir SDR, Follow-up, CS y Meeting | Starter $120–$180/mes; evaluar Pro por capacidad, no tamaño |
| 30 | 10–14 | Sales, Marketing, CS, Support, Ops; permisos por equipo | Enterprise, partners y customer health | Añadir Marketing/Sales Intelligence | Professional desde $1,300/mes, más asientos/contactos; ≥$15,600/año |
| 50 | 16–24 | Equipos regionales/funcionales y auditoría | Múltiples pipelines, territorios, compliance y attribution | Catálogo gobernado por función | Professional ≥$1,750–$2,200/mes estimado; Enterprise solo con requisitos concretos |

Los importes usan precios públicos actuales de Customer Platform y asientos adicionales como aproximación. Marketing contacts, créditos, onboarding, impuestos e integraciones pueden elevarlos. Pedir cotización total a 12 y 36 meses antes de subir de edición.

## Roles y permisos

- **Super Admin:** máximo dos personas; configuración e integraciones.
- **RevOps:** propiedades, workflows, calidad y reporting; sin secretos técnicos.
- **Sales:** sus contactos/deals; descuentos y exportaciones limitados.
- **Marketing:** segmentos consentidos y campañas; sin datos financieros sensibles.
- **CS/Support:** clientes y tickets; sin editar importes contractuales.
- **Leadership:** dashboards y forecast; exportación controlada.
- **Agentes:** identidades separadas, scopes específicos y sin interfaz humana compartida.

Revisión trimestral de accesos y revocación el mismo día del offboarding.

## KPIs autoritativos

| Área | KPI | Definición inicial |
| --- | --- | --- |
| Adquisición | Leads y MQL/PQL | Personas únicas consentidas; calificación con motivo |
| Ventas | Conversión y win rate | Ganados / oportunidades elegibles por cohorte |
| Ventas | Pipeline y forecast | Valor ponderado, separado de contrato firmado |
| Ventas | Sales cycle | Mediana desde calificación hasta ganado/perdido |
| Ingresos | MRR/ARR | Desde Stripe/finanzas, no suma manual del CRM |
| Economía | CAC y payback | Coste atribuible / clientes; margen incluido en payback |
| Cliente | Retención, churn y NRR | Logos e ingresos, siempre por cohorte/segmento |
| Expansión | Expansion revenue | Upgrade/créditos adicionales menos contracción |
| Productividad | Revenue por vendedor | Ingreso reconocido o ARR nuevo, definido explícitamente |

LTV no debe presentarse como fiable hasta disponer de cohortes suficientes. Forecast del CRM se reconcilia mensualmente con Stripe.

## Dashboards

| Audiencia | Contenido |
| --- | --- |
| CEO | MRR/ARR, pipeline ponderado, forecast, win rate, churn/NRR, CAC payback y concentración |
| Sales | Deals por etapa/owner, aging, próxima acción, ciclo, conversión y razones de pérdida |
| Marketing | Fuente, lead→PQL→deal, CAC, consentimiento, campaña y pipeline influenciado |
| Customer Success | Onboarding, first value, health, adopción agregada, renovación, riesgo y expansión |
| Support | Volumen, severidad, first response, resolución, SLA, reapertura, CSAT y causa |
| Operations | Calidad/sync, duplicados, fallos de webhook, licencias, coste y auditoría de acceso |

## Plan de implementación

| Periodo | Qué y por qué | Cómo / responsable | Tiempo y coste | Automatización/agentes | KPI de aceptación |
| --- | --- | --- | --- | --- | --- |
| Semana 1 | Nombrar owner, aprobar HubSpot, diccionario y límites | Workshop Founder, Ops y Tech Lead; sandbox; DPA/seguridad | 12–20 h; $0–$300 | Ningún envío automático | 100% campos con owner/fuente |
| Semanas 2–4 | Importar muestra, configurar pipelines, permisos y sync mínimo | Adaptador servidor, claves externas e idempotencia | 40–100 h; $2k–$12k interno/externo | Upsert, compra, lifecycle y Data Agent en shadow | ≥99% sync; <2% duplicados |
| Meses 2–3 | Onboarding, tickets, dashboards y diez automatizaciones | Growth/Customer owner + Tech Lead | 40–80 h; licencia + $1k–$8k | Qualification, Support y Reporting con aprobación | Adopción >80%; datos completos >90% |
| Meses 3–6 | Scoring histórico, renovación, expansión y playbooks | RevOps/PM; revisar privacidad | 20–50 h/mes | Follow-up, CS, meeting summary | Menor aging; mayor activación/retención |
| Meses 6–12 | Evaluar edición y warehouse; optimizar TCO | Leadership + Finance/Security | Según escala | Agents con evaluaciones y presupuestos | ROI positivo, incidentes 0, forecast calibrado |

## Gate antes de Professional

Subir solamente si al menos dos capacidades Professional —custom reporting, automatización avanzada, permisos, service workflows o forecast— ahorran o generan más que su coste durante dos trimestres. El número de empleados por sí solo no es razón suficiente.

## Resumen operativo

**CRM actual:** CRM de facto fragmentado; ningún CRM dedicado identificado.  
**CRM recomendado:** HubSpot Customer Platform Starter.  
**Para qué:** pipeline comercial, timeline, onboarding, soporte, renovaciones, expansión y reporting; no autenticación ni ledger financiero.  
**Coste inicial:** aproximadamente $60–$100/mes para 3–5 editores usando tarifa Starter de lista; confirmar cotización.  
**Implementación:** 2–4 semanas para el mínimo viable; 2–3 meses para operación disciplinada.  
**Integraciones:** Clerk, MongoDB, Stripe, Resend, analytics y capa segura de webhooks/cola.  
**Primeros agentes:** CRM Data, Lead Qualification, Support y Reporting en modo supervisado.  
**Primeras automatizaciones:** las diez priorizadas en [Integraciones, automatizaciones y agentes](integraciones-y-agentes.md).

