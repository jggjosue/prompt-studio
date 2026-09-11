# Historial de creación y de cambios — Prompt Studio

Este conjunto de documentos reconstruye **cómo se hizo este proyecto**, no solo
qué quedó hecho. Está escrito para que un tercero pueda seguir la secuencia
completa de cada cambio importante:

```
problema → conversación → análisis → decisión → acción → error → corrección → resultado
```

Esa forma no es un capricho de estilo. Un documento final aislado —un PDF, un
README, un esquema de base de datos— dice *qué* existe. La secuencia de arriba
dice *por qué* existe y *qué se descartó en el camino*, y es lo que permite
reconstruir el razonamiento de una persona o de un equipo. Es también el
criterio con el que hoy se valora el historial operativo de una empresa
(ver [05-valor-y-licenciamiento-del-historial.md](05-valor-y-licenciamiento-del-historial.md)).

## Índice

| Documento | Qué contiene |
|---|---|
| [01-cronologia-de-creacion.md](01-cronologia-de-creacion.md) | Las siete fases del proyecto, con fechas, hashes y cifras verificables |
| [02-trazas-de-decision.md](02-trazas-de-decision.md) | Doce decisiones técnicas reconstruidas con la secuencia completa, incluidos los errores intermedios |
| [03-registro-de-cambios-por-area.md](03-registro-de-cambios-por-area.md) | Qué cambió en cada área del producto y cuándo, con evidencia en el repositorio |
| [04-inventario-de-fuentes-y-derechos.md](04-inventario-de-fuentes-y-derechos.md) | Qué registros existen, en qué volumen, quién los posee y qué habría que depurar antes de cederlos |
| [05-valor-y-licenciamiento-del-historial.md](05-valor-y-licenciamiento-del-historial.md) | Qué hace valioso a un historial como este, qué no, y por qué licenciar no es lo mismo que vender |
| [06-metricas-del-repositorio.md](06-metricas-del-repositorio.md) | El historial medido: horario, churn, volumen por mes, calidad de los mensajes |
| [07-registro-de-fallos.md](07-registro-de-fallos.md) | Los 42 fallos conocidos con causa, corrección y guardarraíl, agrupados por familia |
| [preguntas-abiertas.md](preguntas-abiertas.md) | Las 19 preguntas que solo el propietario puede responder — el eslabón «análisis» |
| [08-enlaces-para-revision.md](08-enlaces-para-revision.md) | Qué se puede enseñar hoy con un enlace, qué requiere dar acceso, y qué no se debe enviar |
| [09-capacidades.md](09-capacidades.md) | Qué capacidades se pueden afirmar con evidencia del repositorio, y cuáles no |
| [10-encaje-con-criterios-de-coleccion.md](10-encaje-con-criterios-de-coleccion.md) | Si el proyecto cumple los criterios que publican los compradores de historiales: qué sí, qué no y qué es alcanzable |
| [11-encaje-con-categorias-de-datos.md](11-encaje-con-categorias-de-datos.md) | Encaje con las categorías de datos de un comprador: código y trayectorias de agente sí, telemetría no todavía |
| [datos/](datos/README.md) | El mismo historial en CSV y JSONL, regenerable con un script |
| [../auditoria/2026-09-10-auditoria-post-cambios.md](../auditoria/2026-09-10-auditoria-post-cambios.md) | Auditoría BEFORE/AFTER de los cambios, con roadmap de 90 días |

Documentos previos que estos complementan, no reemplazan:
[../operaciones/historial-proyecto.md](../operaciones/historial-proyecto.md)
(las cifras del historial de git),
[../operaciones/base-de-conocimiento.md](../operaciones/base-de-conocimiento.md)
(los problemas ya resueltos y su causa),
[../prd.md](../prd.md) (qué es el producto),
[../dm.md](../dm.md) (el modelo de datos).

## Método

Tres reglas, aplicadas sin excepción:

1. **Todo dato es reproducible.** Cada cifra viene de `git log`, de `git status`,
   de contar ficheros o de leer el código. Al final de cada documento están los
   comandos exactos.
2. **Lo que no se pudo verificar se marca.** Se distingue entre lo que consta en
   el repositorio, lo que se infiere de él, y lo que es afirmación de un tercero
   sin comprobar.
3. **Los datos derivables se generan, no se transcriben.** `node scripts/build-historial-dataset.mjs`
   reconstruye `datos/commits.csv` y `datos/metricas.json` desde `git`. Si una
   cifra de estos documentos y el dataset discrepan, manda el dataset.
4. **Los fallos se cuentan.** Un historial en el que todo salió bien a la
   primera es un historial reescrito, y se nota. Los errores intermedios están
   en el repositorio de todas formas: 24 de los 364 commits los mencionan en el
   propio mensaje.

## Alcance temporal

- **Historial versionado**: 10 de diciembre de 2025 → 18 de julio de 2026, 364
  commits.
- **Fase no versionada**: del 4 al 9 de septiembre de 2026 hay una reescritura
  amplia **sin commitear** (349 ficheros modificados sobre HEAD, 431 sin
  seguimiento). Está documentada aquí porque es donde nació la mayor parte de la
  documentación operativa, los tests y los guardarraíles de seguridad. Su
  ausencia del historial de git es en sí misma un dato relevante
  (ver [04](04-inventario-de-fuentes-y-derechos.md), sección de lagunas).

## Nota sobre titularidad y datos personales

Este historial describe trabajo propio sobre un repositorio propio. Antes de
usarlo fuera del proyecto hay dos cosas que **no** son opcionales:

- El historial de git **contiene secretos de producción** en commits antiguos.
  Se limpiaron de HEAD (`2bf9a846`), no del historial. Cualquier cesión del
  repositorio completo los cede también.
- El catálogo incluye contenido y referencias de terceros cuya procedencia hay
  que poder acreditar. La comprobación de procedencia y derechos es previa a
  cualquier conversación de precio, no posterior.

El detalle está en [04-inventario-de-fuentes-y-derechos.md](04-inventario-de-fuentes-y-derechos.md).
