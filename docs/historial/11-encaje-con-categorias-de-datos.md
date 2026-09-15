# Encaje con categorías de datos

Seis categorías que un comprador de datos publica como lo que colecciona, y si
este proyecto encaja. Mismo método que
[10-encaje-con-criterios-de-coleccion.md](10-encaje-con-criterios-de-coleccion.md):
medido, con los comandos en §7.

| Categoría | Qué piden | Veredicto |
|---|---|---|
| **Código** | Repos privados con historial completo, post mortems y trayectorias de agentes que nunca salen a la luz | **Sí** — el mejor encaje de todo lo analizado |
| **Operaciones de empresa** | Registros de telemetría y decisiones de flujo de trabajo del sector | **No hoy** — instrumentado pero sin desplegar |
| **Vídeo egocéntrico** | Más de 60 fábricas en India en primera persona | No |
| **Médico** | Historiales clínicos longitudinales | No |
| **Audio** | Grabaciones de estudio para ASR/TTS en lenguas índicas | No |
| **Otra cosa** | «Envíanoslos y te diremos» | **La vía correcta** |

> **Aviso de traducción, otra vez.** La categoría titulada «BACALAO» es «COD»
> —*code*— traducido automáticamente. Igual que «PITÓN» por Python en la otra
> rejilla. Antes de decidir cualquier cosa sobre estos criterios, léelos en el
> idioma original: una traducción que convierte «code» en «bacalao» también
> puede estar deformando los umbrales y las condiciones.

---

## 1. Código — sí, y es el encaje más fuerte que hay

La categoría pide tres cosas. Este proyecto tiene dos completas y una a medias.

### 1.1 Repositorio privado con historial completo — ✅

`https://github.com/jggjosue/prompt-studio` responde **404 a un visitante
anónimo**: es privado. Dentro hay 364 commits, del 10-dic-2025 al 18-jul-2026,
con 809 773 líneas añadidas y 579 920 borradas.

Es exactamente lo que la categoría describe: material que **no está en ningún
repositorio público**, y que por tanto no puede haberse usado ya para entrenar
nada.

### 1.2 Post mortems — ✅ y esto es lo mejor del lote

Aquí el proyecto está por encima de lo que un repositorio normal ofrece:

- **[07-registro-de-fallos.md](07-registro-de-fallos.md)**: 42 fallos con
  síntoma, causa, corrección y guardarraíl, agrupados en seis familias.
- **[base-de-conocimiento.md](../operaciones/base-de-conocimiento.md)**: 16
  incidentes con causa y desenlace, con las reglas generales que dejaron.
- **[02-trazas-de-decision.md](02-trazas-de-decision.md)**: 12 decisiones con la
  secuencia completa, **incluidos los errores intermedios**.
- **24 commits que llevan el texto del error en el mensaje**, con el commit de
  corrección justo detrás.

Un post mortem de verdad no dice qué se arregló, dice qué se creyó, qué falló y
qué se aprendió. Eso está escrito, y está atado a hashes verificables.

### 1.3 Trayectorias de agentes — ⚠️ parcial, y casi todo fuera del repositorio

Es la parte que la categoría subraya y donde hay que ser exacto.

**Lo que sí es una trayectoria, y está dentro del repositorio:**

66 commits en los que **la instrucción en lenguaje natural y el diff son el
mismo objeto**, con el elemento de interfaz señalado:

```
354f2d07  Haz el filtro por imagenes, videos y all (_for element <Primitive.button…
2c0372e9  dividelos cuando se encuentre este simbolo # y un espacio…
6853397c  deben de ser 30 prompts validando el simbolo # o doble ##
```

Esa subsecuencia de tres pasos —mostrar, partir por un delimitador, corregir el
delimitador porque hay dos variantes— es una trayectoria de agente completa:
petición, resultado, corrección de la petición. Y quedó capturada sin
proponérselo. Los 66 son de una sola identidad de autor
([06](06-metricas-del-repositorio.md) §2).

**Lo que también son trayectorias, pero está fuera del repositorio:**

2 transcripciones de sesión en formato JSONL, **9,5 MB**, en
`~/.claude/projects/-Users-josuegonzalez-Projects-Web3D-prompt-studio/`. Una de
ellas es la sesión en la que se escribió esta documentación. Son literalmente
«trayectorias de agentes que nunca salen a la luz en un repositorio público»,
porque no están en el repositorio en absoluto.

**Y una advertencia, para no ofrecer lo que no hay:** las ramas
`agents/arbitrary-leech` y `agents/proper-boar` **no contienen trabajo de
agente**. Medido: 0 commits que `develop` no tenga, y 71 commits por detrás. Son
copias abandonadas del 19 de mayo. Ofrecerlas como material de agente sería un
error que el comprador detectaría en un comando.

### 1.4 Lo que hay que resolver antes de ofrecer nada de esto

Dos requisitos, uno bloqueante:

1. **Rotar los secretos del historial.** Ceder el repositorio con su historial
   completo —que es precisamente lo que esta categoría pide— entrega también el
   `sk_live_` de Clerk y los demás valores que siguen en commits antiguos
   ([T-04](02-trazas-de-decision.md#t-04--secretos-en-envexample)). No hay
   forma de ofrecer «historial completo» y a la vez retener esos commits.
2. **Commitear la fase 7.** Hoy 431 ficheros sin seguimiento y 349 modificados
   —incluida toda la documentación que hace valiosa esta categoría— no existen
   para nadie más. Un comprador que clone el repositorio recibe la versión de
   julio, sin los post mortems.

### 1.5 Cómo formularlo

> Private repository, 364 commits over 220 days, never public. Includes 12
> written decision traces with their intermediate failures, a 42-entry failure
> registry with root cause and guardrail, and 66 commits where the natural
> language instruction and the resulting diff are the same object — AI-assisted
> development captured in-place rather than reconstructed. Agent session
> transcripts (JSONL) exist outside the repository and can be provided
> separately.

## 2. Operaciones de empresa — no hoy, y el motivo es concreto

La categoría pide **registros de telemetría y decisiones de flujo de trabajo**
del sector de la aplicación.

### Lo que está diseñado y escrito

Un modelo de telemetría serio, `ObservabilityEvent`, con ocho categorías
—`browser_error`, `server_error`, `web_vital`, `resource_timing`, `stripe`,
`ai_generation`, `slow_query`, `commerce`— y campos que permiten análisis real:
`route`, `sessionId`, `userId`, `productId`, `durationMs`, `costUsd`,
`fingerprint`. Referenciado en 11 ficheros, enganchado al procesamiento de
trabajos de IA, a los webhooks de Stripe y a la recarga de créditos. Documentado
en [`observability.md`](../observability.md).

### Por qué no cuenta todavía

Tres razones, en orden de gravedad:

1. **No está desplegado.** `ObservabilityEvent`, `instrumentation.ts` y
   `api/observability/events` **no están en HEAD**, y la ruta responde **404 en
   producción**. Lo que corre hoy es la analítica de Firebase, mucho más pobre.
   No hay ningún registro acumulándose.
2. **Cuando corra, caduca a los 90 días.** El esquema lleva
   `expires: 60 * 60 * 24 * 90` en `createdAt`: MongoDB borra cada evento a los
   tres meses. No habrá serie histórica larga a menos que se cambie esa
   decisión o se archive aparte.
3. **Por diseño no guarda el contenido.** «No se guardan prompts, código,
   claves, cuerpos de Stripe ni URLs completas.» Es una decisión de privacidad
   correcta, pero significa que la telemetría registra *qué pasó*, no *qué se
   decidió*, que es la mitad que esta categoría valora.

Y un cuarto punto, de encaje más que de estado: el «sector» aquí es el propio
—catálogo de prompts y generación con IA—, no una vertical empresarial de
finanzas, industria o logística.

### Lo que sí se podría ofrecer en su lugar

Los **procedimientos** de flujo de trabajo, que sí existen y están escritos: los
nueve documentos de [`docs/operaciones/`](../operaciones/README.md) —generación
con IA, comercial, catálogo, despliegue y QA, CRM—. Son decisiones de flujo de
trabajo documentadas, aunque no sean registros de telemetría.

## 3. Vídeo egocéntrico, Médico y Audio — no, sin matices

| Categoría | Estado |
|---|---|
| Vídeo egocéntrico (fábricas en India, primera persona) | **Cero.** Los `.mp4` del repositorio son 13 vídeos de muestra del catálogo, generados o de archivo, no capturas en primera persona |
| Médico (historiales clínicos longitudinales) | **Cero.** Ningún dato clínico, en ninguna forma |
| Audio (grabaciones de estudio, ASR/TTS en lenguas índicas) | **Cero.** No hay corpus de audio; los `.srt` son subtítulos de los vídeos de muestra |

No hay nada que matizar y no conviene intentarlo.

## 4. «Otra cosa» — esta es la vía

La sexta casilla —«¿No estás seguro de que tus datos se ajusten a alguna de
estas categorías? Envíanoslos y te diremos»— es la correcta para este proyecto,
por dos motivos: encaja de lleno en **Código**, y lo que tiene de valioso
—documentación derivada, post mortems, trazas— no cabe entero en ninguna
etiqueta.

Lo que tiene sentido enviar, en este orden:

1. **[docs/historial/](README.md)** — los 11 documentos y el dataset. Es lo que
   demuestra el método sin exponer el código.
2. **[07-registro-de-fallos.md](07-registro-de-fallos.md)** y la
   **[base de conocimiento](../operaciones/base-de-conocimiento.md)** — 58
   incidentes entre los dos, con causa y desenlace.
3. **[datos/](datos/README.md)** — `commits.csv`, `metricas.json` y
   `trazas.jsonl`, ya en formato ingerible.
4. **El repositorio**, solo después de rotar (§1.4).
5. **Las transcripciones de sesión**, como material aparte y sabiendo qué
   contienen: hay que leerlas antes de enviarlas, porque una sesión de agente
   puede haber visto ficheros con secretos.

## 5. Conclusión

Frente a las tres tarjetas del documento 10 —donde el resultado fue una parcial
y dos noes—, aquí el resultado es **un sí claro en la categoría principal**. La
diferencia no está en el proyecto, está en el criterio: las tarjetas anteriores
medían antigüedad, escala y heterogeneidad técnica, cosas que este proyecto no
tiene; esta categoría mide **si el historial muestra procesos y decisiones
reales**, que es justo lo que se ha estado documentando.

Las dos acciones que convierten el «sí» en algo entregable son las mismas de
siempre, y ya están en la lista: **rotar los secretos** y **commitear la fase
7**.

Una recomendación añadida, específica de esta rejilla: **conserva las
transcripciones de sesión de agente de aquí en adelante**. Hoy hay 9,5 MB de dos
sesiones, y es la clase de material que la categoría señala explícitamente como
difícil de conseguir. No se puede reconstruir después.

## 6. Qué no enviar

Lo mismo que en [08](08-enlaces-para-revision.md) §4, más una precisión nueva:

- **El repositorio con historial completo antes de rotar.** En esta categoría el
  riesgo es mayor, porque lo que se pide *es* el historial completo.
- **Transcripciones de sesión sin leerlas.** Pueden contener rutas, variables de
  entorno o contenido de ficheros que la sesión abrió.
- **Volcados de la base de datos.** Hay perfiles, consentimientos y cuentas de
  pago de afiliados.

## 7. Cómo reproducir estas comprobaciones

```bash
# ¿el repositorio es privado?
curl -s -o /dev/null -w '%{http_code}\n' https://github.com/jggjosue/prompt-studio

# trayectorias dentro del repositorio
git log --pretty='%h|%s' | grep -c '_for element'

# trayectorias fuera del repositorio
d="$HOME/.claude/projects/-Users-josuegonzalez-Projects-Web3D-prompt-studio"
ls -1 "$d"/*.jsonl | wc -l && du -sh "$d"

# ¿las ramas agents/* tienen trabajo propio?
git rev-list --count develop..agents/proper-boar   # 0 = no aportan nada
git rev-list --count agents/proper-boar..develop   # 71 = van por detrás

# ¿la telemetría está desplegada?
git cat-file -e HEAD:src/models/ObservabilityEvent.ts && echo "en HEAD" || echo "NO en HEAD"
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://www.prompstudio.com/api/observability/events
grep -n 'expires' src/models/ObservabilityEvent.ts   # TTL de 90 días
```
