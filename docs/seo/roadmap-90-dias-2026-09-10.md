# Roadmap 30/60/90 de PrompStudio

Fecha de planificación: 10 de septiembre de 2026  
Horizonte: 90 días  
Objetivo: recuperar la salud SEO, conectar adquisición con activación e ingresos y crear una base de crecimiento medible sin aumentar el catálogo de páginas de bajo valor.

## Resultado esperado al día 90

PrompStudio debe poder responder, con datos confiables:

1. Qué URLs deben indexarse y por qué.
2. Qué consultas y páginas ganan o pierden tráfico.
3. Cuántos visitantes orgánicos llegan a su primer resultado útil.
4. Cuánto ingreso atribuible genera SEO.
5. Qué experimento debe publicarse, iterarse o rechazarse.

El roadmap no promete recuperar una posición concreta, porque rankings, CTR e indexación dependen también de Google y de la demanda. Sí exige que todos los cambios, exposiciones y resultados sean medibles.

## Capacidad y reglas de ejecución

Equipo supuesto:

- 1 Software Engineer full-time: 30 horas productivas por semana.
- 1 Product/SEO Lead: 12 horas por semana.
- 1 Designer/CRO: 8 horas por semana.
- Apoyo puntual de Data/QA: 6 horas por semana.

Reglas:

- Máximo dos iniciativas activas al mismo tiempo: una técnica y una de producto/contenido.
- Ningún cambio SEO masivo sin inventario de URLs, muestra QA y rollback.
- Ningún experimento se lanza sin hipótesis, métrica primaria, guardrails y tamaño de muestra.
- No se crean páginas programáticas durante los primeros 60 días.
- Search Console se interpreta con retraso; las decisiones semanales usan ventanas comparables y las decisiones de negocio usan cohortes maduras.
- Cada viernes se revisan KPIs, riesgos, capacidad y la decisión de continuar, pausar o reducir alcance.

## KPIs de nivel programa

| KPI | Baseline disponible | Objetivo al día 90 |
|---|---:|---:|
| URLs indexables con canonical, robots y sitemap coherentes | Por medir en día 1–5 | 100% de las URLs SEO prioritarias |
| Eventos críticos con contrato validado | Parcial | 100% de los eventos P0 |
| Tráfico orgánico atribuible hasta activación e ingreso | No confiable actualmente | Disponible por landing, país y dispositivo |
| CTR de MonoNote | 1.52% | Tendencia hacia 3–5%, validada con ventana suficiente |
| First Value Moment | No instrumentado de forma consistente | Definido y medido |
| Tiempo hasta primer valor | No disponible | Baseline estable y mejora frente a la cohorte inicial |
| Alertas con falso positivo | No existe baseline | Menos de 20% después del periodo de calibración |
| Experimentos con decisión estadística documentada | 0 con contrato completo | Al menos 1 decisión válida; no se exige ganador |

First Value Moment propuesto: el usuario obtiene un resultado personalizado y realiza una señal de utilidad —guardar, copiar, descargar, aprobar o añadir a un proyecto— durante la misma sesión o dentro de 24 horas.

Activation Event propuesto: alcanza el First Value Moment y completa una segunda acción de valor en otra sesión dentro de siete días.

---

## Días 1–30 — Estabilizar, medir y recuperar

Meta de fase: eliminar riesgos P0 de ejecución e indexación, establecer una línea base verificable y lanzar una mejora controlada de CTR/CRO.

### Secuencia y límite de trabajo

- Semana 1: R1 y R2.
- Semana 2: terminar R1; iniciar R3 cuando la suite esté verde.
- Semana 3: terminar R2; iniciar R4 cuando el inventario SEO esté aprobado.
- Semana 4: validar R3 y lanzar R4.

| ID | Acción | Prioridad | Responsable | Dependencias | Horas | Impacto | KPI | Definition of Done |
|---|---|---|---|---|---:|---|---|---|
| R1 | Cerrar la base Node 22 y CI: verificar `.nvmrc`/`.node-version`, `preinstall`, lint, typecheck, unit, integración y E2E críticos | P0 | Software Engineer | Acceso a CI y secretos de prueba | 24 | Evita deploys no verificables y convierte las pruebas en una puerta real | % de checks verdes; duración y flakiness de CI | Un checkout limpio usa Node 22; instalación falla con versión incompatible; PR ejecuta lint, typecheck, tests y E2E P0; existe rollback documentado; tres ejecuciones consecutivas quedan verdes |
| R2 | Construir el inventario técnico de indexación y aprobar reglas por patrón de URL | P0 | SEO Lead + Software Engineer | Acceso a GSC, sitemap y estado HTTP | 34 | Reduce indexación accidental, duplicados y señales contradictorias | URLs válidas en sitemap; canonicals inconsistentes; 4xx/5xx; páginas huérfanas | Existe tabla URL/patrón con `INDEX`, `NOINDEX`, `CANONICAL`, `REDIRECT` o `REMOVE`; incluye rutas críticas (`/prompt/edit`, `/prices`, `/ask`, `/gallery/*`, `/tags/*`, `/category/*`, `/webpages/*`, `/landing-pages/*`); cada decisión tiene evidencia, dueño y rollback; robots, sitemap, headers y canonicals pasan validadores |
| R3 | Instrumentar el embudo orgánico mínimo y el modelo de atribución | P0 | Software Engineer + Data/QA | Taxonomía de eventos aprobada; consentimiento y privacidad | 46 | Conecta SEO con activación e ingresos y evita optimizar métricas de vanidad | Cobertura de eventos; eventos inválidos/duplicados; sesiones con source/medium; ingresos atribuibles | Se capturan `page_view`, `signup_started`, `signup_completed`, `onboarding_started`, `onboarding_completed`, `prompt_generated`, `first_value_reached`, `activation_reached`, `payment_completed`, `subscription_renewed` y `subscription_cancelled`; contratos incluyen anonymous/user/session ID, landing, source, medium, campaign, país, dispositivo, plan y revenue cuando corresponde; identidad anónima se vincula al registrarse; QA confirma deduplicación y exclusión de prompts/credenciales |
| R4 | Optimizar MonoNote como primer experimento SEO→signup | P1 | SEO Lead + Designer/CRO | R2 aprobado; R3 midiendo; baseline congelado | 30 | Ataca la oportunidad conocida de 985 impresiones, posición 8.25 y CTR 1.52% | CTR orgánico; posición; signup rate; rebote de CTA; FVM rate | Search intent y SERP quedan documentados; title, meta, H1, introducción, prueba de valor, CTA e internal links son coherentes; schema solo representa contenido visible y real; variante tiene ID de experimento; QA desktop/mobile y snapshot before/after completos; se monitorea sin declarar ganador antes de madurez |

### Puerta de salida del día 30

Se avanza a crecimiento solo si:

- CI está verde y protege las ramas de despliegue.
- Las URLs prioritarias no tienen conflictos entre status, robots, canonical y sitemap.
- El embudo registra adquisición → signup → primer valor → pago sin datos privados.
- MonoNote tiene baseline, fecha de cambio, variante y guardrails.

Si falla una puerta, se reduce el alcance de la fase siguiente; no se compensa añadiendo más contenido.

---

## Días 31–60 — Mejorar descubrimiento, conversión y activación

Meta de fase: aplicar los aprendizajes de la recuperación a las páginas con demanda real y reducir el tiempo desde la visita orgánica hasta el primer valor.

### Secuencia y límite de trabajo

- Semana 5: G1 y G2.
- Semana 6: continuar G1/G2; no abrir otra iniciativa.
- Semana 7: cerrar G1; iniciar G3.
- Semana 8: cerrar G2/G3 y evaluar señales maduras de R4.

| ID | Acción | Prioridad | Responsable | Dependencias | Horas | Impacto | KPI | Definition of Done |
|---|---|---|---|---|---:|---|---|---|
| G1 | Implementar el motor de enlaces internos y breadcrumbs con límites | P1 | Software Engineer + SEO Lead | R2; taxonomía estable de categoría, tags, tipo, intención y popularidad | 48 | Mejora descubrimiento y reparte relevancia sin enlaces aleatorios | Páginas huérfanas; profundidad de clic; links por página; tráfico a páginas relacionadas | El algoritmo puntúa relación por categoría, topic, tipo, intención, popularidad y similitud semántica; excluye noindex/canonical/redirect; limita resultados por bloque y total por página; genera breadcrumbs y relacionados; tests cubren relevancia, duplicados, loops y límites; muestra editorial aprobada antes del despliegue global |
| G2 | Rediseñar onboarding y navegación alrededor de `Descubrir → personalizar → previsualizar → guardar/publicar` | P1 | Product Lead + Designer/CRO + Software Engineer | R3; FVM aprobado; CTA principal “Crear con IA” | 58 | Reduce fricción y alinea el producto con una experiencia principal | Signup→FVM; median Time to Value; abandono por paso; activación D7 | Menú se agrupa en Explorar, Crear, Herramientas y Mi biblioteca; “Crear con IA” es CTA principal accesible en desktop/mobile; quick start ofrece plantillas y configuración mínima; el dashboard no muestra datos ficticios; progreso y siguiente paso son claros; analytics registra cada paso; accesibilidad y E2E móvil pasan |
| G3 | Priorizar y optimizar el lote de páginas con impresiones >100, posición 1–15 y CTR <3% | P1 | SEO Lead + Designer/CRO | R2, R3 y resultados preliminares de R4 | 32 | Captura clics adicionales desde demanda ya existente antes de crear URLs | CTR y clics incrementales por URL; posición; signup y FVM rate | Se calcula oportunidad con CTR esperado interno; solo se seleccionan 3–5 URLs; cada una tiene intención, title/meta únicos, cambios de contenido, schema e internal links; despliegues son escalonados y fechados; ranking y conversión funcionan como guardrails; ninguna página recibe claims o reseñas no verificables |

### Puerta de salida del día 60

- La navegación principal y el quick start funcionan en móvil y escritorio.
- Existe una cohorte suficiente para calcular signup→FVM y Time to Value.
- El motor de enlaces no enlaza páginas no indexables ni supera los límites definidos.
- Cada optimización SEO tiene una fecha, baseline, resultado y decisión provisional.

---

## Días 61–90 — Operar con experimentos y preparar escala segura

Meta de fase: convertir la recuperación en un sistema repetible, con alertas de negocio, decisiones estadísticas y una pequeña prueba de arquitectura escalable.

### Secuencia y límite de trabajo

- Semana 9: S1 y S2.
- Semana 10: continuar S1/S2.
- Semana 11: cerrar S1; iniciar S3 solo si hay capacidad.
- Semanas 12–13: validar, documentar decisiones y preparar el siguiente ciclo.

| ID | Acción | Prioridad | Responsable | Dependencias | Horas | Impacto | KPI | Definition of Done |
|---|---|---|---|---|---:|---|---|---|
| S1 | Construir el SEO Business Dashboard y alertas calibradas | P1 | Data/QA + Software Engineer + SEO Lead | R3; al menos 28 días de datos comparables | 54 | Permite detectar pérdidas y medir impacto empresarial sin depender de reportes manuales | Frescura; completitud; tiempo de detección; falsos positivos | Vistas CEO, SEO, Product y Growth muestran solo métricas accionables; GSC se une a sesiones, signup, FVM, activación y revenue por landing/día/dimensión permitida; alertas cubren caídas de clicks/CTR/ranking/indexación/404/signup/revenue con severidad, responsable y runbook; backtest y dos semanas de calibración dejan menos de 20% de alertas no accionables |
| S2 | Endurecer el framework de experimentación existente | P1 | Software Engineer + Product Lead + Data/QA | R3; volumen y métricas confiables | 52 | Evita decisiones por ruido y permite aprender con trazabilidad | % de exposiciones válidas; sample ratio mismatch; experimentos con decisión válida | Registro incluye problema, hipótesis, baseline, cambio, primaria, guardrails, MDE, alpha, power, muestra, duración y resultado; asignación usa hash estable, capas mutuamente excluyentes e identidad anónima; `assignment` y `experiment_exposed` están separados; exposición ocurre solo al ver la variante; dashboard presenta CI y madurez; reglas `SHIP`, `ITERATE`, `REJECT` están codificadas; A/A test no detecta falso ganador ni SRM |
| S3 | Pilotar proyectos con contexto persistente y Brand Kit en un flujo, no como plataforma completa | P2 | Software Engineer + Product Lead | G2 estable; modelo de permisos y privacidad; capacidad restante | 40 | Mejora retención y prepara campañas coordinadas sin abrir otro generador | Proyectos con brief/brand kit; reutilización de contexto; FVM y retorno D7 | Un usuario crea proyecto, guarda brief y Brand Kit, aplica contexto a un generador existente y conserva activo + procedencia; permisos y eliminación se prueban; prompts privados no entran en logs; existe migración/rollback; no se implementan colaboración avanzada, marketplace ni publicación multi-destino en este piloto |

Si S1 o S2 se retrasa, S3 se mueve íntegro al siguiente trimestre. No se divide en una entrega incompleta.

### Puerta de salida del día 90

- Existe una vista ejecutiva que conecta impresiones con ingreso sin mezclar definiciones.
- Alertas críticas tienen responsable y runbook, y el agente SEO solo recomienda: nunca modifica el sitio.
- Al menos un experimento alcanzó madurez o se documentó correctamente como inconcluso; no se fuerza una decisión.
- Se completa un informe before/after con mejoras, deterioros, resultados neutros, reversiones y siguientes pruebas.

---

## Responsabilidad operativa

| Rol | Decide | Ejecuta | Aprueba |
|---|---|---|---|
| Product/SEO Lead | Prioridad, intención, hipótesis y decisión de experimento | Briefs, inventario y revisión semanal | Cambios de indexación y contenido |
| Software Engineer | Diseño técnico mínimo y rollback | Código, migraciones, CI, tracking y APIs | Preparación técnica del deploy |
| Designer/CRO | Jerarquía, copy de interfaz y variantes | Prototipos y QA visual | Experiencia desktop/mobile |
| Data/QA | Contratos, calidad, muestra y significancia | Validación, dashboard, tests y backtests | Integridad de métricas y madurez |

Una persona puede cubrir más de un rol, pero cada acción conserva un único responsable final.

## Cadencia semanal

| Momento | Duración | Resultado obligatorio |
|---|---:|---|
| Lunes: planificación | 30 min | Dos iniciativas activas, dueño y riesgo principal |
| Miércoles: revisión técnica/datos | 30 min | Evidencia de QA, bloqueos y cambio de alcance si procede |
| Viernes: revisión de resultados | 45 min | KPI vs baseline, decisión y registro de cambios |
| Fin de fase | 90 min | Puerta de salida, deuda aceptada y capacidad de la fase siguiente |

## Definition of Done común

Además de la Definition of Done específica, toda entrega debe cumplir:

- Alcance y comportamiento actual documentados antes del cambio.
- Tests proporcionales al riesgo y suite CI verde.
- QA en desktop y mobile cuando exista interfaz pública.
- Eventos y propiedades validados sin PII, prompts privados ni credenciales.
- Métrica primaria, guardrails y ventana de lectura registrados.
- Observabilidad estructurada con correlación, proveedor, operación, duración y código de error cuando aplique.
- Rollback probado o descrito con pasos exactos.
- Archivos modificados y decisión de producto registrados.

## Riesgos y respuestas

| Riesgo | Señal | Respuesta |
|---|---|---|
| Datos históricos insuficientes | Cohortes pequeñas o tracking incompleto | Reportar intervalo e inconcluso; ampliar duración, nunca inventar certeza |
| Cambios SEO simultáneos | No se puede atribuir una variación | Escalonar páginas y registrar fecha/variante |
| Indexación masiva de thin content | Crece el sitemap sin utilidad demostrada | Mantener noindex y exigir quality score + revisión humana |
| Dashboard inconsistente | Totales no concilian entre fuentes | Contratos, timezone único, deduplicación y pruebas de reconciliación |
| Exceso de alcance | Más de dos iniciativas activas | Pausar la de menor prioridad; S3 es la primera candidata a moverse |
| Caída de conversión por cambio SEO | CTR sube pero signup/FVM baja | Usar conversión como guardrail y revertir la variante |
| Claims o reseñas no verificables | Contenido sin fuente o compra real | Retirar; schema solo refleja evidencia visible y verificable |

## Fuera de alcance durante estos 90 días

- Marketplace abierto a terceros.
- Publicación multi-destino completa, dominios propios y sincronización con GitHub/Vercel.
- Generación masiva de cientos o miles de páginas programáticas.
- Agente SEO con permisos de escritura.
- Refactor total simultáneo de los tres generadores.
- Entrenamiento de un recomendador propio.
- Colaboración empresarial avanzada.

Estas iniciativas se reevalúan al día 90 con evidencia de activación, retención, margen y capacidad. El siguiente trimestre debería elegir una sola apuesta grande: proyectos/Brand Kit completos, laboratorio A/B de prompts o publicación directa.

## Informe final obligatorio

El día 90 debe publicarse un informe que compare la línea base con el periodo posterior y separe:

- Mejoró: cambio con evidencia y confianza suficiente.
- Empeoró: cambio, impacto y decisión de revertir o corregir.
- Sin cambio: resultado neutral o muestra insuficiente.
- Escalar: prácticas que funcionaron y pueden ampliarse.
- Probar después: hipótesis priorizadas, no una lista abierta de ideas.

El siguiente roadmap de 90 días se construirá solo con resultados observados y capacidad real demostrada.
