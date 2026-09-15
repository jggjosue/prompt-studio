# Preguntas abiertas

Diecinueve preguntas que **solo tú puedes responder**. Son, sobre todo, el
eslabón «análisis» que sigue sin documentar en **6 de las 12 trazas** de
decisión —T-01, T-02, T-04, T-08, T-09 y T-10—: qué se consideró y qué se
descartó. Todo lo demás de `docs/historial/` se pudo derivar del repositorio;
esto no.

## Cómo usar este documento

- Responde **en el propio fichero**, debajo de cada pregunta. Dos o tres líneas
  bastan. No hace falta redactar: hace falta que exista.
- Si no te acuerdas, escribe «no recuerdo». Es una respuesta válida y honesta, y
  evita que alguien —tú incluido— invente una razón dentro de seis meses.
- Cada pregunta indica **a qué traza alimenta** y **qué documento hay que
  actualizar** con la respuesta.
- El valor está en el «por qué» y en las **alternativas descartadas**, no en el
  «qué». El qué ya está en el diff.

---

## A. Decisiones de plataforma

### 1. ¿Por qué Kinde en enero, y qué se evaluó frente a él?
> Alimenta [T-01](02-trazas-de-decision.md#t-01--autenticación-kinde--clerk) · actualiza doc 02 y 03

**Respuesta:**

### 2. ¿Qué falló o faltó en Kinde para cambiar a Clerk cuatro meses después?
> T-01 · La decisión más costosa de revertir del proyecto y hoy no hay ni una línea que la explique (`e4a99785` se llama «web pages 5»).

**Respuesta:**

### 3. ¿Por qué Clerk y next-intl entraron en el mismo commit? ¿Fue una tarea o dos que coincidieron?
> T-01 · Cambia la lectura del riesgo asumido ese día.

**Respuesta:**

### 4. ¿Qué te obligó a pasar de Firestore a MongoDB? ¿Fue el modelo de afiliados, el coste, las reglas de seguridad, o algo más?
> [T-02](02-trazas-de-decision.md#t-02--datos-firestore--mongodb) · Hoy está **inferido** por la coincidencia de fechas con los precios de afiliados.

**Respuesta:**

### 5. ¿Por qué Firebase sigue en `package.json` si solo lo usan 5 ficheros? ¿Es intencional (analítica) o es residuo?
> T-02 · Determina si es deuda que hay que cerrar o una decisión que hay que documentar.

**Respuesta:**

### 6. ¿Genkit está en uso real hoy, o quedó del andamiaje inicial de Firebase Studio?
> Doc 03 §7 · Está desde el commit inicial y hay 5 flujos en `src/ai/flows/`; no sé si alguno está en producción.

**Respuesta:**

## B. Producto y negocio

### 7. ¿Qué te hizo cambiar el eje del producto el 4 de marzo, de «galería de imágenes y vídeos» a «catálogo de prompts por modelo»?
> Doc 01, fase 3 · Es el mayor giro de producto del proyecto y ocurre en un solo día.

**Respuesta:**

### 8. ¿Cómo se fijaron los precios, y qué se descartó? Hay cinco iteraciones entre el 24 de junio y el 6 de julio.
> [T-10](02-trazas-de-decision.md#t-10--orden-de-construcción-del-negocio) · Sin esto, las cinco iteraciones parecen indecisión; con esto, son aprendizaje.

**Respuesta:**

### 9. ¿Por qué afiliados antes que suscripciones? ¿Fue estrategia o fue lo que se pudo montar primero?
> T-10

**Respuesta:**

### 10. ¿AdSense antes del banner de cookies fue un descuido o una decisión asumida?
> T-10 · Hay ocho días entre una cosa y otra. Conviene que la respuesta esté escrita **por ti**.

**Respuesta:**

### 11. ¿Los 301 directorios de `public/webpages` (115 MB) son producto vendible, material de marketing, o resto de una prueba?
> Docs 03 y 04 · De la respuesta depende si hay que protegerlos como producto de pago o si se pueden borrar.

**Respuesta:**

## C. Ritmo y organización

### 12. ¿Abril está vacío (2 commits) por una pausa deliberada, por trabajo fuera del repositorio, o por otra cosa?
> Doc 01, fase 3-4 · Un hueco de un mes en un historial siempre lo pregunta quien lo lee.

**Respuesta:**

### 13. Las dos identidades de autor (`federico01xdz@` hasta marzo, `jggjosue@` desde enero) ¿son la misma persona en dos entornos, o hubo una segunda persona?
> [06](06-metricas-del-repositorio.md) §2 · Los 66 commits con instrucción en lenguaje natural son todos de la primera. Mi lectura es que son dos **modos de trabajo**, no dos personas — pero es una inferencia, y afecta a cómo se describe el equipo.

**Respuesta:**

### 14. ¿El trabajo entre las 22:00 y las 02:00 (49 % de los commits) es la franja disponible o es preferencia?
> 06 §1 · Afecta a qué se puede planificar de forma realista, no solo a la descripción.

**Respuesta:**

### 15. ¿Hubo trabajo en este proyecto que **no** dejó rastro en el repositorio? Diseño, decisiones de negocio, conversaciones con clientes, pruebas de mercado.
> Doc 04 §3 · Si existió, es el hueco más grande del historial y ni lo sé ni puedo deducirlo.

**Respuesta:**

## D. Titularidad, derechos y datos

### 16. ¿Quién es el titular de los derechos del código y del catálogo? ¿Está escrito en algún sitio (contrato, estatutos, acuerdo de cesión)?
> [04](04-inventario-de-fuentes-y-derechos.md) §4.1 · La documentación operativa menciona Magzin LLC, pero en el repositorio no hay nada que lo acredite.

**Respuesta:**

### 17. ¿De dónde salió el contenido del catálogo? ¿Generado por IA, propio, de terceros con licencia, o mezcla? ¿Con qué modelos, si fue IA?
> 04 §4.3 · Es la comprobación que, según las propias compañías del sector, va **antes** de cualquier conversación de precio.

**Respuesta:**

### 18. ¿Se han rotado ya las credenciales que estuvieron en el historial (la `sk_live_` de Clerk y las demás)? ¿Cuáles sí y cuáles no?
> [T-04](02-trazas-de-decision.md#t-04--secretos-en-envexample) · **Bloqueante.** Mientras la respuesta no sea «todas», el repositorio no se puede compartir con nadie.

**Respuesta:**

### 19. Si algún día licencias este material, ¿qué **no** estarías dispuesto a ceder en ningún caso?
> [05](05-valor-y-licenciamiento-del-historial.md) §6 · Es más fácil de responder ahora, en frío, que en una negociación.

**Respuesta:**

---

## Qué gana cada documento cuando esto se responda

| Respuestas | Efecto |
|---|---|
| 1-6 | Las trazas T-01 y T-02 pasan de «análisis inferido» a documentado. Son las dos decisiones más costosas de revertir del proyecto. |
| 7-11 | El documento 03 gana el «por qué» de las áreas de producto y comercio, hoy solo cronológicas. |
| 12-15 | El documento 06 deja de inferir sobre el modo de trabajo y lo afirma con fundamento. |
| 16-19 | El documento 04 §4 pasa de lista de comprobaciones pendientes a estado real, y el 05 §6 se puede ejecutar. |

Cuando respondas, dímelo y actualizo los documentos con las respuestas
integradas, marcando qué dejó de ser inferencia.
