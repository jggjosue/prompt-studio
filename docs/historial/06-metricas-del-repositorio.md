# Métricas del repositorio

El mismo historial medido en lugar de narrado. Todas las cifras salen de `git`
sobre los 364 commits versionados (10-dic-2025 → 18-jul-2026); los comandos
están al final. Se incluye solo lo que dice algo que el relato no dice.

---

## 1. Cuándo se trabajó

Distribución por hora del día (hora local del autor, 364 commits):

| Hora | Commits | | Hora | Commits |
|---|---|---|---|---|
| 00 | **46** | | 12 | 1 |
| 01 | **38** | | 13 | 6 |
| 02 | 13 | | 14 | 4 |
| 03 | 5 | | 15 | 0 |
| 04 | 18 | | 16 | 7 |
| 05 | 20 | | 17 | 10 |
| 06 | 16 | | 18 | 17 |
| 07 | 18 | | 19 | 15 |
| 08 | 11 | | 20 | 17 |
| 09 | 0 | | 21 | 16 |
| 10 | 1 | | 22 | **45** |
| 11 | 3 | | 23 | **37** |

- **Bloque 22:00 – 02:00: 179 commits, el 49 % del total.**
- **Bloque 09:00 – 17:00 (jornada laboral): 32 commits, el 8,8 %.** Las 09:00 y
  las 15:00 no tienen ni uno.

Por día de la semana:

| Día | Commits |
|---|---|
| Viernes | 85 |
| Sábado | 71 |
| Jueves | 56 |
| Miércoles | 51 |
| Lunes | 48 |
| Martes | 37 |
| Domingo | 16 |

Viernes y sábado suman 156 commits, el 43 %.

**Qué prueba esto.** La afirmación «proyecto llevado en paralelo a otra
ocupación», que en [01](01-cronologia-de-creacion.md) es una inferencia, aquí es
un dato: la mitad del proyecto se escribió entre las diez de la noche y las dos
de la madrugada, y menos del 9 % en horario de oficina. También acota el ritmo
real disponible, que es un dato honesto si el historial se presenta alguna vez
ante un tercero.

## 2. Las dos identidades son dos formas de trabajar, no dos personas en paralelo

| Mes | Josue Glez | Joshuesito |
|---|---|---|
| 2026-01 | 79 | 1 |
| 2026-02 | 150 | 20 |
| 2026-03 | 23 | 1 |
| 2026-04 | — | 2 |
| 2026-05 | — | 21 |
| 2026-06 | — | 40 |
| 2026-07 | — | 26 |

- `Josue Glez` (`federico01xdz@`): 14-ene → **20-mar-2026**. 252 commits.
- `Joshuesito` (`jggjosue@`): 21-ene → 18-jul-2026. 113 commits.

Y el dato que lo cierra: **los 66 commits con instrucción en lenguaje natural
(`_for element …`) son los 66 de `Josue Glez`**. Ninguno de `Joshuesito`.

Es decir, las dos identidades no son dos colaboradores repartiéndose trabajo:
son **dos modos de producción**. Hasta marzo, desarrollo dentro del IDE asistido
por IA, donde la instrucción queda como mensaje de commit. Desde abril,
desarrollo manual con mensajes escritos a mano —y por eso mucho más pobres
(§5)—. El solape entre el 21 de enero y el 20 de marzo es de los dos modos
conviviendo, no de dos personas.

Consecuencia para quien lea el historial: la riqueza de la traza **cae
exactamente donde cambia el modo de trabajo**, no donde cambia la dificultad del
proyecto.

## 3. Qué se reescribió más

Los 20 ficheros con más commits encima:

| Commits | Fichero |
|---|---|
| 56 | `src/app/video-prompts/video-prompts-client.tsx` |
| 52 | `src/app/image-prompts/image-prompts-client.tsx` |
| 51 | `src/components/content-grid.tsx` |
| 49 | `src/components/image-examples.tsx` |
| 45 | `src/components/video-examples.tsx` |
| 42 | `src/app/gallery/[id]/gallery-detail-client.tsx` |
| 37 | `src/components/layout/header-client.tsx` |
| 34 | `src/app/layout.tsx` |
| 30 | `src/lib/placeholder-images.json` |
| 26 | `src/app/page.tsx` |
| 25 | `package.json` |
| 22 | `src/app/video-tags/video-tags-client.tsx` |
| 21 | `messages/es.json` |
| 20 | `src/components/web-page-card.tsx` |
| 19 | `src/lib/placeholder-videos.json` |
| 19 | `messages/en.json` |
| 18 | `src/app/image-tags/image-tags-client.tsx` |
| 18 | `src/app/gallery-videos/[id]/gallery-video-detail-client.tsx` |
| 17 | `src/app/prompts/[modelId]/model-detail-client.tsx` |
| 16 | `yarn.lock` |

**Dos lecturas que confirman trazas por otra vía:**

- Los **cinco primeros** son exactamente los ficheros que
  [`MIGRATION_SUMMARY.md`](../MIGRATION_SUMMARY.md) enumera como afectados por
  la separación de imágenes y vídeos (traza
  [T-03](02-trazas-de-decision.md#t-03--separación-de-vídeos-e-imágenes)). El
  churn mide el coste que el documento describe: 253 commits repartidos entre
  esos cinco ficheros.
- `content-grid.tsx`, `image-examples.tsx` y `video-examples.tsx` acumulan 145
  commits entre los tres para **renderizar rejillas de contenido**. Es el
  síntoma de la falta de una abstracción única de rejilla, y explica por qué la
  misma corrección hubo que aplicarla tres veces (ver
  [07-registro-de-fallos.md](07-registro-de-fallos.md), incidentes F-11 a F-13).

## 4. Volumen por mes

| Mes | Líneas añadidas | Líneas borradas | Ficheros nuevos |
|---|---|---|---|
| 2025-12 | 18 483 | 0 | 1 |
| 2026-01 | 9 366 | 1 667 | 15 |
| 2026-02 | 73 895 | 59 800 | 18 |
| 2026-03 | 5 641 | 4 452 | 7 |
| 2026-04 | 3 078 | 1 859 | 1 |
| 2026-05 | 146 202 | 91 852 | 16 |
| 2026-06 | **492 221** | 141 496 | 17 |
| 2026-07 | 60 887 | **278 794** | 11 |
| **Total** | **809 773** | **579 920** | **86** |

Tres cosas que este cuadro dice y el recuento de commits oculta:

1. **Febrero es el mes de más commits (170) pero no de más volumen.** Añade 18
   ficheros nuevos en 170 commits: es un mes de *retoque* sobre estructura ya
   creada, no de construcción. El relato de «mes de mayor actividad» es correcto
   en frecuencia y engañoso en volumen.
2. **Junio mueve 492 221 líneas añadidas**, casi diez veces más que enero, con
   40 commits. Son cargas masivas de catálogo (`webpages`, `web-pages.json`), no
   código.
3. **Julio borra más de lo que añade** (278 794 vs 60 887), y es el único mes
   así. Coincide con `[minify-public]` y con la limpieza de `.env.example`: el
   mes en que se empezó a cobrar es también el único mes en que el proyecto
   adelgazó.

Los ocho commits más grandes, para que se vea que el volumen es de datos y no de
lógica:

| Líneas movidas | Commit | Fecha | Mensaje |
|---|---|---|---|
| 262 291 | `5ff2cde4` | 2026-07-03 | `[minify-public]` |
| 110 073 | `7c0c2361` | 2026-06-12 | `Modo azul` |
| 108 186 | `9b4ddb3f` | 2026-06-28 | `new file` |
| 93 909 | `c1606709` | 2026-05-18 | `add prices` |
| 88 593 | `404e364b` | 2026-06-30 | `add cambios de precios y SEO` |
| 83 470 | `0d99fc66` | 2026-06-28 | `add changes` |
| 57 231 | `ce1011da` | 2026-06-28 | `add file 4` |
| 51 673 | `ad7d7f98` | 2026-06-12 | `se quita la carpeta` |

Ninguno de los ocho tiene un mensaje que permita saber qué hizo. El más grande
del proyecto —un cuarto de millón de líneas— se llama `[minify-public]`.

## 5. La calidad del mensaje de commit, medida

Longitud del asunto sobre los 364 commits:

| Métrica | Caracteres |
|---|---|
| Mínimo | 3 |
| Mediana | 52 |
| Percentil 90 | 72 |
| Asuntos de exactamente 72 | **116** |
| **Máximo** | **72** |

El máximo es 72 y hay 156 mensajes por encima de 60 caracteres. Eso **no**
significa que se escribieran mensajes largos: **116 de los 364 asuntos miden
exactamente 72 caracteres**, el tope al que la herramienta truncaba la
instrucción en lenguaje natural. Comprobable en cualquiera de ellos:

```
Try fixing this error: `Runtime TypeError: {imported module [project]/sr
{"message":"Error seeding database.","error":"7 PERMISSION_DENIED: Missi
```

**Consecuencia importante y hasta ahora no anotada**: de los 24 commits que
llevan un error dentro, se conserva **el tipo de error, no su texto completo**.
El `TypeError` se sabe; el módulo que lo causó, no —hay que deducirlo del diff.
Es una pérdida irreversible que afecta directamente al valor del historial como
registro de incidentes.

En el otro extremo, 80 commits tienen 15 caracteres o menos (`add`, `addd`,
`update`, `fixes`, `ads`). Ahí no hay truncamiento: no se escribió nada.

## 6. Lo que el historial no contiene

| Métrica | Valor | Lectura |
|---|---|---|
| Merges | 5 | Todos de sincronización con `origin/main`; ninguno de integración de rama de trabajo |
| Referencias a incidencias o PR | 0 | No hubo tickets ni revisión de código |
| Commits con cambios reales | 358 de 364 | 6 son merges o vacíos |
| Ramas activas hoy | `develop`, `main`, más 2 de agente | El trabajo real fue directo sobre la rama principal |

## 7. Qué haría distinto con estos números delante

1. **Aceptar el horario y planificar contra él.** Con el 49 % del trabajo entre
   las 22:00 y las 02:00, las tareas que exigen verificación cuidadosa
   —despliegues, rotación de credenciales, migraciones— son las peores
   candidatas para esa franja. Los dos incidentes de «la aplicación no arranca»
   y las cuatro correcciones consecutivas del 20-21 de febrero caen justo ahí.
2. **Una abstracción de rejilla.** 145 commits en tres componentes que hacen lo
   mismo es el gasto más medible del proyecto.
3. **No confiar en el mensaje de commit como registro de incidentes.** Está
   truncado a 72 caracteres por diseño de la herramienta. Si el error importa,
   va en la base de conocimiento, no en el asunto del commit.
4. **Etiquetar los commits de datos.** Un prefijo `data:` habría separado los
   492 221 líneas de catálogo de junio del código real, y hoy se podría medir el
   proyecto sin que los JSON lo distorsionen.

---

## Cómo reproducir

```bash
# ficheros más reescritos
git log --pretty=format: --name-only | grep -v '^$' | sort | uniq -c | sort -rn | head -20

# hora del día y día de la semana
git log --pretty='%ad' --date=format:'%H' | sort | uniq -c
git log --pretty='%ad' --date=format:'%a' | sort | uniq -c | sort -rn

# autor por mes
git log --pretty='%ad|%an' --date=format:'%Y-%m' | sort | uniq -c

# instrucciones en lenguaje natural, por autor
git log --pretty='%an|%s' | grep '_for element' | cut -d'|' -f1 | sort | uniq -c

# volumen por mes
git log --shortstat --pretty=format:'@%ad' --date=format:'%Y-%m' \
  | awk '/^@/{m=substr($0,2)} /insertion|deletion/{for(i=1;i<=NF;i++){if($i~/insertion/)ins[m]+=$(i-1); if($i~/deletion/)del[m]+=$(i-1)}} END{for(k in ins) print k, ins[k], del[k]}' | sort

# ficheros nuevos por mes
git log --diff-filter=A --pretty=format:'%ad' --date=format:'%Y-%m' | sort | uniq -c

# longitud de los mensajes
git log --pretty=%s | awk '{print length($0)}' | sort -n \
  | awk '{a[NR]=$1} END {print "min",a[1],"p50",a[int(NR/2)],"p90",a[int(NR*0.9)],"max",a[NR]}'
```
