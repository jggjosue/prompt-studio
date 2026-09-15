# Historial del proyecto

Evolución medida sobre el historial de git, no reconstruida de memoria. Todo lo
que sigue es reproducible con `git log`.

## 1. Cifras

- **364 commits**, del 10 de diciembre de 2025 al 18 de julio de 2026.
- **2 autores humanos**: `Josue Glez` (252 commits) y `Joshuesito` (111). Un
  commit inicial de `Firebase Studio`.

Distribución por mes:

| Mes | Commits |
|---|---|
| 2025-12 | 1 |
| 2026-01 | 80 |
| 2026-02 | **170** |
| 2026-03 | 24 |
| 2026-04 | 2 |
| 2026-05 | 21 |
| 2026-06 | 40 |
| 2026-07 | 26 |

El patrón es de ráfagas, no de ritmo sostenido: febrero concentra el 47 % de
todo el trabajo y abril está prácticamente vacío. Es el perfil típico de un
proyecto llevado en paralelo a otra ocupación.

## 2. Fases

### Arranque (dic 2025 – ene 2026)

Inicializado con Firebase Studio; primer prototipo el 14 de enero. Los mensajes
de commit de esta etapa son instrucciones en lenguaje natural —«Cuando se le dé
clic redirecciónalo a la página /login»—, lo que indica desarrollo asistido por
IA desde el primer día. Es coherente con el producto.

### Construcción del catálogo (feb 2026)

El mes de mayor actividad. Se levanta el grueso del catálogo y la estructura de
páginas.

### Monetización (jun – jul 2026)

La secuencia se lee clara en el historial:

| Fecha | Hito |
|---|---|
| 2026-06-24 | Precios del programa de afiliados |
| 2026-06-29 | Programa de afiliados |
| 2026-07-03 | Integración con Stripe |
| 2026-07-10 | AdSense |
| 2026-07-18 | Planes de suscripción y banner de cookies |

Es decir: primero se construyó el catálogo, y solo después se montó cómo cobrar
por él. El banner de cookies llega el mismo día que los planes, lo que sugiere
que el cumplimiento se abordó al activar la monetización y no antes.

## 3. Deuda que dejó ese ritmo

Observable en el estado del repositorio, no una opinión:

- **`typescript.ignoreBuildErrors` y `eslint.ignoreDuringBuilds` activos.** El
  proyecto compila aunque haya errores de tipos. La red existe
  (`npm run typecheck` está en `test:ci`) pero no bloquea el build.
- **Dos ficheros de bloqueo** conviviendo: `package-lock.json` y `yarn.lock`.
- **Copias de trabajo abandonadas.** Había cinco JSON huérfanos en
  `public/webpages/` —uno de 5,7 MB— que ningún código referenciaba. Se
  eliminaron.
- **Secretos en `.env.example`.** El fichero está versionado y llegó a contener
  54 valores idénticos a `.env`, incluida una clave `sk_live_` de Clerk. Se
  limpió en el commit `2bf9a846`, pero **siguen en el historial**: borrar de
  HEAD no borra de los commits antiguos.
- **Ficheros fuente del catálogo bajo `public/`**, y por tanto descargables con
  los prompts de pago dentro. Se movieron a `src/data/`.

Los tres últimos son incidentes de seguridad, no desorden. Los dos primeros son
deuda técnica ordinaria.

## 4. Cómo reproducir estos datos

```bash
git log --oneline | wc -l                                   # total de commits
git log --format="%an" | sort | uniq -c | sort -rn          # autores
git log --format="%ad" --date=format:%Y-%m | sort | uniq -c # ritmo mensual
git log --diff-filter=A --format="%h %ad %s" --date=short   # altas de fichero
```

## 5. Historial ampliado

Este documento da las **cifras** del historial. La reconstrucción de *cómo* se
tomó cada decisión —con la secuencia problema → conversación → análisis →
decisión → acción → error → corrección → resultado— está en
[../historial/](../historial/README.md):

| Documento | Qué añade |
|---|---|
| [01-cronologia-de-creacion.md](../historial/01-cronologia-de-creacion.md) | Las siete fases con hashes, incluida la fase 7 (sept 2026) sin commitear |
| [02-trazas-de-decision.md](../historial/02-trazas-de-decision.md) | Doce decisiones con sus errores intermedios y su desenlace |
| [03-registro-de-cambios-por-area.md](../historial/03-registro-de-cambios-por-area.md) | El mismo historial por área de producto |
| [04-inventario-de-fuentes-y-derechos.md](../historial/04-inventario-de-fuentes-y-derechos.md) | Qué registros existen, en qué volumen, y qué depurar antes de cederlos |
| [05-valor-y-licenciamiento-del-historial.md](../historial/05-valor-y-licenciamiento-del-historial.md) | Qué hace valioso un historial así, y licencia frente a venta |
| [06-metricas-del-repositorio.md](../historial/06-metricas-del-repositorio.md) | Horario de trabajo, churn por fichero, volumen por mes, calidad de los mensajes |
| [07-registro-de-fallos.md](../historial/07-registro-de-fallos.md) | Los 42 fallos conocidos con causa, corrección y guardarraíl |
| [datos/](../historial/datos/README.md) | Dataset regenerable: `commits.csv`, `metricas.json`, `trazas.jsonl` |

## 6. Nota sobre el uso de este documento

Si se presenta ante un tercero: describe una operación de **dos personas** a lo
largo de **siete meses**. Es documentación real y verificable, y ese es su
valor. No sostiene una lectura de organización mayor.
