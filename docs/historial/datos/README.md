# Dataset del historial

Versión legible por máquina de lo que los documentos de `docs/historial/`
cuentan en prosa. Tres ficheros, dos generados y uno curado a mano.

| Fichero | Origen | Se regenera |
|---|---|---|
| `commits.csv` | derivado de `git log --numstat` | sí, con el script |
| `metricas.json` | agregados del mismo recorrido | sí, con el script |
| `trazas.jsonl` | curado a mano a partir de [02-trazas-de-decision.md](../02-trazas-de-decision.md) | **no**: el script no lo toca |

## Regenerar

```bash
node scripts/build-historial-dataset.mjs
```

Borrar `commits.csv` y `metricas.json` y volver a ejecutar debe dar el mismo
resultado byte a byte, salvo el campo `generado` de `metricas.json`. Si no
coincide, el historial cambió (o alguien reescribió commits).

## `commits.csv`

Una fila por commit, 364 filas, en orden cronológico ascendente.

| Columna | Tipo | Notas |
|---|---|---|
| `corto`, `sha` | texto | hash abreviado y completo |
| `fecha` | `YYYY-MM-DD HH:MM` | **hora local del autor**, no UTC |
| `mes` | `YYYY-MM` | para agrupar |
| `hora` | 0-23 | hora local del autor |
| `dia_semana` | 0-6 | 0 = domingo, calculado sobre la hora local del autor |
| `autor`, `correo` | texto | tal como constan en el commit |
| `es_merge` | booleano | más de un padre |
| `es_fallo` | booleano | **heurístico**: el asunto casa `error\|fix\|corrig\|soluciona\|isn't starting` |
| `es_instruccion_natural` | booleano | el asunto contiene `_for element`, marca del IDE asistido |
| `asunto_largo` | entero | longitud en **caracteres** (no bytes) |
| `asunto_truncado` | booleano | `asunto_largo >= 72`, el tope de truncamiento de la herramienta |
| `ficheros` | entero | ficheros tocados según `--numstat` |
| `lineas_add`, `lineas_del` | entero | 0 en binarios (`numstat` los marca con `-`) |
| `asunto` | texto | primera línea del mensaje, entrecomillada si lleva comas |

**Avisos de uso.** `es_fallo` es una heurística sobre texto libre: incluye
`fixes` (que no dice qué se arregló) y excluye fallos cuyo mensaje no usó
ninguna de esas palabras. El registro revisado a mano está en
[07-registro-de-fallos.md](../07-registro-de-fallos.md), y es la fuente buena
para contar incidentes. `lineas_add`/`lineas_del` incluyen JSON de catálogo y
lockfiles, que dominan el volumen: junio son 492 221 líneas añadidas y casi
todas son datos, no código.

## `metricas.json`

```
totales        commits, rango, merges, commits_de_fallo,
               commits_instruccion_natural, asuntos_truncados,
               asuntos_de_15_o_menos, asunto_largo_max/mediana, lineas_add/del
por_mes        { "YYYY-MM": { commits, add, del } }
por_hora       { "00".."23": commits }
por_dia_semana { "0".."6": commits }   // 0 = domingo
por_autor      { autor: { commits, desde, hasta } }
churn_top_50   [ { fichero, commits } ]  // ranking de reescritura
```

## `trazas.jsonl`

Una traza de decisión por línea, 12 líneas. Campos:

| Campo | Contenido |
|---|---|
| `id`, `titulo`, `fase` | identificador estable y fase del proyecto |
| `desde`, `hasta` | periodo que abarca la decisión |
| `problema` | qué había que resolver |
| `conversacion` | `{ registrada, tipo, evidencia[] }` — `registrada: false` significa que no existe registro, no que no hubo conversación |
| `analisis` | `{ documentado, texto, momento }` — `momento` es `en_su_momento` (solo T-03), `a_posteriori` (documentado en la fase 7) o `no_documentado` (6 trazas, recogidas en [preguntas-abiertas.md](../preguntas-abiertas.md)) |
| `decision` | qué se decidió |
| `acciones[]` | `{ commit, fecha, que }`; `commit: null` = pertenece a la fase 7, sin versionar |
| `errores[]` | qué se rompió entre decidir y funcionar |
| `correccion` | qué lo resolvió |
| `resultado` | desenlace, con medida cuando existe |
| `leccion` | la regla que dejó |
| `eslabones_faltantes[]` | qué parte de la secuencia no está documentada |
| `guardarrail_hoy` | qué impide hoy la reincidencia (`"ninguno"` es una respuesta frecuente) |
| `estado` | solo cuando queda algo pendiente (T-04, T-12) |

Consultas de ejemplo:

```bash
# trazas cuyo análisis sigue sin documentar
jq -r 'select(.analisis.momento == "no_documentado") | .id + " " + .titulo' docs/historial/datos/trazas.jsonl

# trazas sin guardarraíl
jq -r 'select(.guardarrail_hoy | test("ninguno")) | .id' docs/historial/datos/trazas.jsonl

# commits de fallo con su volumen
awk -F, '$10=="true"' docs/historial/datos/commits.csv | cut -d, -f1,3,15,16
```

## Qué NO contiene este dataset

Se dice para que nadie lo presuponga:

- **Nada de la fase 7 como commits.** Los 349 ficheros modificados y 431 sin
  seguimiento de septiembre de 2026 no están en `commits.csv` porque no están en
  `git`. `trazas.jsonl` los recoge con `commit: null`.
- **El texto completo de los errores.** Los asuntos están truncados a 72
  caracteres en origen; 116 de los 364 lo están. Es una pérdida irreversible.
- **Diffs.** Solo recuentos. Para el contenido, `git show <sha>`.
- **Datos de clientes ni de negocio.** Ni usuarios, ni ventas, ni tráfico. El
  único dato personal es la dirección de correo del autor de cada commit, que ya
  es pública en el repositorio.
- **Secretos.** No se copia contenido de ficheros. Aun así, el **historial de
  git** sí contiene credenciales antiguas: ver
  [04-inventario-de-fuentes-y-derechos.md](../04-inventario-de-fuentes-y-derechos.md) §4.2.
