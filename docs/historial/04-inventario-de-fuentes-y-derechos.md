# Inventario de fuentes, lagunas y derechos

Qué registros existen sobre cómo se hizo este proyecto, en qué volumen, qué
falta, y qué habría que comprobar o depurar antes de que salgan del proyecto.

---

## 1. Fuentes existentes

| Fuente | Volumen medido | Cubre | Calidad como traza |
|---|---|---|---|
| Historial de git | 364 commits · 809 773 líneas añadidas / 579 920 borradas · `.git` de 1,9 GB | dic 2025 → jul 2026 | Media-alta en fases 1-3, baja en 4-6 |
| Mensajes de commit como instrucción en lenguaje natural | 66 commits con el sufijo `(_for element …)`, 156 mensajes de más de 60 caracteres | ene → mar 2026 | **Alta**: la petición y el diff van juntos |
| Mensajes de commit con el error dentro | 24 (26 con los dos de «no arranca») | ene → may 2026 | Alta para la secuencia error → corrección |
| Documentación operativa | 20 documentos, 3 473 líneas, ~25 700 palabras | sept 2026 | Alta en contenido, sin trazabilidad de escritura |
| Base de conocimiento | 1 019 palabras, 16 incidentes con causa y desenlace | sept 2026 | **Alta**: es el análisis que falta en los commits |
| Tests | 46 ficheros, 2 311 líneas | sept 2026 | Alta: cada test de protección codifica un fallo real |
| Scripts de build y auditoría | 75 ficheros `.mjs`, 14 414 líneas | may → sept 2026 | Media: dicen qué se comprueba, no por qué |
| Código de aplicación | 345 ficheros `.ts`/`.tsx`, 84 páginas, 93 rutas de API, 35 modelos | todo el periodo | Es el resultado, no la traza |
| Catálogo de datos | 15 JSON en `src/data` (4,2 MB) + 301 directorios en `public/webpages` (115 MB) | feb → jun 2026 | Producto, no historial |
| `MIGRATION_SUMMARY.md` | 1 documento | feb 2026 | **La traza más completa del proyecto**, y la única escrita en su momento |

## 2. Lo que hace fuerte a este historial

Tres cosas, y conviene ser preciso sobre cuáles son:

1. **La conversación y el cambio están en el mismo objeto.** En las fases 1 a 3,
   el mensaje del commit *es* la instrucción en lenguaje natural que produjo el
   diff. No es un registro reconstruido: petición y resultado quedaron unidos
   por la herramienta. Eso es difícil de obtener a posteriori en cualquier
   proyecto.
2. **Los errores están dentro del historial, no fuera.** 24 commits llevan el
   texto del fallo como mensaje, con el commit de corrección justo detrás. La
   secuencia error → intento → corrección es reconstruible sin adivinar.
3. **La documentación de septiembre está derivada del código, no de la
   memoria.** Cada procedimiento apunta al fichero que lo implementa, lo que
   permite verificarla y detectar cuándo caduca. Y contiene el eslabón que a los
   commits les falta: el análisis.

## 3. Lagunas, en orden de gravedad

### 3.1 Seis días de trabajo sin versionar (grave)

La fase 7 —del 4 al 9 de septiembre de 2026, la que produjo la documentación,
los tests, los guardarraíles y la internacionalización— **no está commiteada**:
349 ficheros modificados sobre HEAD (+25 564 / −42 714 líneas) y 431 sin
seguimiento.

Consecuencias concretas: no hay diffs intermedios, no hay orden verificable
dentro de cada día, no hay mensaje que explique cada cambio, y la única
referencia temporal son marcas de tiempo del sistema de ficheros, que se pierden
al copiar la carpeta.

**Acción**: commitear por bloques temáticos con mensajes que digan qué y por
qué. Es la intervención de mayor rendimiento inmediato del proyecto.

### 3.2 El eslabón «análisis» sigue sin documentar en 6 de 12 trazas (grave)

De las doce decisiones reconstruidas en
[02-trazas-de-decision.md](02-trazas-de-decision.md), **solo una (T-03)
documentó en su momento** qué se consideró y qué se descartó. Cinco más se
reconstruyeron a posteriori al escribir la documentación de septiembre. Las
**seis restantes siguen sin análisis** y ya no se pueden derivar del
repositorio: T-01, T-02, T-04, T-08, T-09 y T-10. Están recogidas como
[preguntas-abiertas.md](preguntas-abiertas.md).

Ejemplo del coste: el commit `e4a99785` sustituye el proveedor de identidad
(Kinde → Clerk) y añade internacionalización, y su mensaje es «web pages 5».
Cuatro meses después no hay forma de saber por qué se cambió de proveedor.

**Acción**: dos o tres líneas de «por qué» en el commit de cada decisión que sea
costosa de revertir. No hace falta un ADR formal; hace falta que exista.

### 3.3 Ochenta commits sin información (media)

80 de los 364 mensajes tienen 15 caracteres o menos: `add`, `addd`, `update`,
`adds`, `fixes`, `prices`, `ads`, `botones`. Su diff es recuperable, su
intención no.

### 3.4 No hay registro de discusión ni de tickets (media)

0 referencias a incidencias o pull requests en todo el historial; 5 merges, y
todos de sincronización de rama. No hay Jira, ni Slack, ni revisiones de código,
ni hilos de decisión. En un proyecto de dos personas es esperable, pero hay que
decirlo: **el mensaje de commit es aquí el único registro de conversación**, y
solo lo es de verdad durante las fases 1 a 3.

### 3.5 Resultados casi nunca declarados (media)

El historial dice qué se cambió y qué se rompió. Casi nunca dice si el cambio
consiguió lo que buscaba. Las excepciones son valiosas y están todas en la
documentación de septiembre: «de 121 rutas dinámicas a 60, con 202 páginas
prerenderizadas», «115 imágenes + 42 vídeos sin pérdida», «se reportaron 170
componentes donde hay 450».

## 4. Titularidad, procedencia y derechos

Antes de que este historial —o el repositorio— salga del proyecto, hay cuatro
comprobaciones que no son opcionales. Se listan como comprobaciones, no como
opiniones jurídicas: esto no sustituye asesoramiento legal.

### 4.1 Autoría y titularidad

Cuatro identidades de autor en el historial: `Josue Glez` (252 commits),
`Joshuesito` (113), `VS Code` (4) y `Firebase Studio` (1). Las dos primeras
corresponden a la misma operación con dos direcciones de correo distintas; las
dos últimas son herramientas, no personas.

No consta en el repositorio ningún acuerdo de cesión, contrato de trabajo ni
licencia que documente **quién** es el titular de los derechos sobre el código y
sobre el catálogo. Si el titular es una entidad (la documentación operativa
menciona Magzin LLC), conviene que eso esté escrito en algún sitio verificable
antes de negociar cualquier cesión o licencia.

### 4.2 Secretos en el historial (bloqueante)

El historial **contiene credenciales de producción**:

- `4a2f3055` (2026-01-15): un `KINDE_CLIENT_ID` dentro del **mensaje** del
  commit.
- Commits anteriores a `2bf9a846` (2026-07-03): `.env.example` con 54 valores
  idénticos a `.env`, incluida una clave `sk_live_` de Clerk.

Se limpió HEAD; **el historial no**. Ceder el repositorio completo cede también
esos valores. Dos acciones, en este orden: (1) rotar las credenciales
—`npm run verify:rotation` dice cuáles siguen en uso—; (2) solo entonces
plantearse compartir el historial, y decidir si se comparte reescrito o
completo.

### 4.3 Procedencia del contenido del catálogo

El catálogo son prompts, imágenes de muestra, vídeos y 301 páginas web de
ejemplo. Hay ya un script de auditoría de procedencia
(`npm run catalog:provenance`), lo que indica que el problema está identificado.

Antes de cualquier cesión hay que poder responder, por fichero: de dónde salió,
con qué licencia, y si esa licencia permite lo que se pretende hacer. El
contenido generado por IA añade una pregunta más: con qué modelo y bajo qué
condiciones de uso del proveedor.

### 4.4 Datos personales

En el historial de git, prácticamente nada: 1 mensaje de commit con una
dirección de correo. En la **base de datos** de producción, en cambio, hay
perfiles de usuario, actividad, consentimientos de cookies, cuentas de pago de
afiliados y compras (35 modelos, entre ellos `UserProfile`, `UserActivity`,
`CookieConsent`, `AffiliatePayoutAccount`, `MarketplaceSale`).

Distinción que conviene mantener limpia: **el historial de desarrollo y los
datos de clientes son dos activos distintos, con dos regímenes distintos.** El
primero puede compartirse tras rotar secretos; el segundo no se comparte sin
base legal, y en la práctica eso significa anonimización o agregación previas.

## 5. Qué habría que hacer antes de mover este historial fuera del proyecto

En orden:

1. **Rotar** las credenciales que estuvieron en el historial (§4.2). Bloqueante.
2. **Commitear la fase 7** por bloques con mensajes explicativos (§3.1).
3. **Documentar la titularidad** de código y catálogo (§4.1).
4. **Cerrar la auditoría de procedencia** del catálogo (§4.3).
5. **Separar** explícitamente historial de desarrollo de datos de clientes
   (§4.4).
6. **Decidir el alcance**: ¿el repositorio completo, solo `docs/`, solo el
   historial de git, un extracto de trazas? Cada opción tiene un perfil de
   riesgo distinto y no hay que decidirlo en la conversación, hay que decidirlo
   antes.

## 6. Cómo reproducir estas cifras

```bash
git log --oneline | wc -l                                     # commits
git log --shortstat --pretty=format: | awk '{i+=$4; d+=$6} END {print i, d}'
git log --pretty=%s | grep -c '_for element'                  # instrucciones NL
git log --pretty=%s | awk 'length($0)<=15' | wc -l            # mensajes vacíos
git log --pretty=%s | grep -Ei 'error|fix|corrig|soluciona' | wc -l
git log --merges --oneline | wc -l                            # merges
git log --pretty=%B | grep -cE '#[0-9]+'                      # refs a tickets
du -sh .git                                                   # peso del historial
cat $(find docs -name '*.md') | wc -lw                         # volumen de docs
cat tests/unit/*.ts tests/data/*.mjs tests/e2e/*.ts | wc -l    # volumen de tests
git status --porcelain | awk '{print $1}' | sort | uniq -c     # árbol de trabajo
```
