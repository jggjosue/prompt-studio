# Marketing: diagnóstico del embudo y propuesta de valor

Análisis del 2026-09-08, con 50 usuarios activos y cero ventas. Todo lo que se
afirma aquí está verificado contra el código, no supuesto.

## Resumen

Un problema estructural de precio, un problema de posicionamiento y dos fugas
por verificar. La que se presentó como fuga principal —la página de precios— era
un **error de análisis** y está retirada más abajo con la explicación del fallo.

Estado de cada hallazgo:

| Hallazgo | Estado |
| --- | --- |
| Fuga 1 · página de precios | Retirada: era falsa. La ruta ya redirige con 308 |
| Datos de maqueta en el dashboard | Confirmado y **arreglado** el 2026-09-08 |
| Fuga 2 · descargas gratuitas sin captura | Sin verificar en ejecución |
| Fuga 3 · herramientas gratuitas | Sin verificar en ejecución |
| Escalera de precios $9 → $1 000 | Confirmado en `subscription-plans.ts` |
| Posicionamiento de caja de herramientas | Valoración, no hallazgo técnico |
| **Atribución de afiliado destruida en las redirecciones** | Confirmado con la app en marcha y **arreglado** el 2026-09-08 |
| **`/prices` sin preguntas frecuentes** | Confirmado. Contenido rescatado, pendiente de publicar |
| **La FAQ prometía reembolso a 30 días contra la política publicada** | Confirmado. **Requiere decisión de negocio** |

## Lo que el dato de «cero ventas» no dice

Con 50 usuarios, cero ventas **no demuestra** que el producto no venda. La
probabilidad de observar cero ventas por azar, con una conversión perfectamente
normal, es alta:

| Conversión real | Ventas esperadas | Probabilidad de ver cero |
| --- | ---: | ---: |
| 1 % | 0,5 | 61 % |
| 2 % | 1,0 | 37 % |
| 3 % | 1,5 | 22 % |
| 5 % | 2,5 | 8 % |

En el rango habitual de freemium autoservicio (2-3 %), **entre el 22 % y el 37 %
de las veces se vería cero** aunque todo funcione bien.

**Consecuencia práctica:** no rediseñar el producto por esta señal. La muestra no
aguanta la conclusión. Lo que toca es cerrar las fugas conocidas y conseguir
volumen suficiente para que el dato signifique algo. Con 500 usuarios y cero
ventas la conversación es distinta.

## Fuga 1 · RETIRADA · la página de precios ya está redirigida

**Este apartado afirmaba un problema que no existe. Se conserva corregido para
que nadie repita el error de análisis.**

Lo que se afirmó: que `/pricing` mostraba botones sin destino, un precio anual de
$90 contradictorio con los $54 del código, y que Google la indexaba.

Lo que ocurre en realidad: `src/proxy.ts` redirige `/pricing` a `/prices` con
un **308 permanente**, y `src/middleware.ts` reexporta ese fichero, así que la
redirección está activa. Comprobado con la aplicación en marcha:

```
/pricing  → HTTP 308 → /prices → HTTP 200
```

Consecuencias:

- La página **nunca se renderiza**; nadie llega a esos botones.
- El precio de $90 **nunca se muestra**.
- Un 308 permanente indica a Google que indexe `/prices`, no `/pricing`.
- El precio en vivo es coherente: `prices-client.tsx` define $9 mensual y $54
  anual, igual que `src/lib/subscription-plans.ts`.

### Por qué el análisis falló

Se revisó el fichero `pricing/page.tsx` y se comprobó que le faltaban `href` y
`noindex`. Ambas cosas son ciertas y **ambas son irrelevantes**, porque la ruta
se intercepta antes de renderizar. Se verificó la capa equivocada: el fichero en
lugar de la ruta.

**Regla que se deriva de esto: una afirmación sobre lo que ve un usuario solo
vale si se ha pedido la URL.** Leer la plantilla no basta cuando hay middleware.

### Lo que sí quedaba pendiente, y se arregló

El dashboard mostraba cifras de maqueta: «850 créditos», «Plan: Pro» y
porcentajes inventados. Un usuario convencido de tener 850 créditos no tiene
ningún motivo para recargar, así que la cifra falsa anulaba la venta de créditos
por completo. Además el botón «Buy more credits» apuntaba a `/pricing` —es
decir, a la página de **suscripciones**— cuando promete créditos.

Corregido el 2026-09-08: el saldo y el plan se leen de `getCreditBalance()` y
`getServerSubscriptionStatus()`, y el botón lleva a `/dashboard/credits`.
Protegido con `tests/unit/dashboard-real-data.test.ts`.

Siguen siendo de maqueta dos tarjetas más del dashboard —un contador de 125 y
«+57 Images Generated», con sus porcentajes— pendientes de decidir qué métrica
real debe ocupar su lugar.

La página muerta se eliminó el 2026-09-08: construía dos páginas estáticas de
176 kB que nadie podía ver y anunciaba un plan «Pro $29» inexistente, que es
precisamente lo que hizo fallar este análisis. Su FAQ se rescató antes de
borrarla.

## Fugas 2 y 3 · sin verificar en ejecución

> **Advertencia de método.** Los dos apartados siguientes se comprobaron leyendo
> ficheros, exactamente igual que la Fuga 1 retirada. **No se han probado con la
> aplicación en marcha.** Antes de actuar sobre ellos hay que pedir la URL y
> observar el comportamiento real; puede haber middleware, guardas o
> redirecciones que cambien la conclusión.

## Fuga 2 · Los productos gratuitos no capturan nada

En `src/app/api/landing-pages/[pageId]/download/route.ts`, `isFree` es la
**primera** condición de la autorización de descarga. Un producto marcado como
gratuito se descarga sin cuenta, sin correo y sin registro.

Hay **24 productos gratuitos** sobre 245 páginas (el 10 %). Son 24 imanes
funcionando a pleno rendimiento que no dejan un solo contacto: el coste de
atraer a esa persona ya está pagado y se va anónima.

**Arreglo:** muro de correo antes de la descarga gratuita. No cuenta completa,
solo correo. Resend ya está integrado y existe el modelo `NewUser`. Medio día.

## Fuga 3 · Cuatro herramientas gratuitas desaprovechadas

Existen y funcionan: `/code-auditor`, `/smart-search`, `/prompt-optimizer` y
`/ask`. Son el tipo de activo que genera enlaces y tráfico orgánico, y ninguna
está construida como tal: sin captura de correo, sin resultado compartible y sin
llamada a la acción hacia el catálogo.

Para un producto de $9, una herramienta gratuita útil es el canal de adquisición
más barato que existe.

## Fuga confirmada · las redirecciones destruían la atribución de afiliado

**Arreglado el 2026-09-08.** Es el hallazgo con impacto directo en ingresos de
todo este análisis, y apareció por casualidad al revisar la Fuga 1.

El referido de afiliado viaja en la query como `?ref=`, y
`src/lib/affiliate-client.ts` lo lee de `window.location.search` usando
`localStorage` solo como respaldo. En una **primera visita no hay nada
guardado**, así que la query es la única fuente.

Cinco redirecciones del middleware construían el destino con
`new URL('/destino', req.url)`, que **descarta la query string**. Cualquier
enlace de afiliado a una URL heredada perdía la comisión de forma silenciosa e
irrecuperable:

| URL compartida por el afiliado | Antes llegaba a | Comisión |
| --- | --- | --- |
| `/pricing?ref=abc` | `/prices` | Perdida |
| `/gallery/algo?ref=abc` | `/image-prompts` | Perdida |
| `/gallery-videos/algo?ref=abc` | `/video-prompts` | Perdida |
| `/webpages/instagram-clone?ref=abc` | `/landing-pages` | Perdida |
| Redirecciones heredadas de landings | destino nuevo | Perdida |

Afectaba justo a las URLs que alguien compartiría: las antiguas, las que
circulan en publicaciones y mensajes viejos.

**Arreglo:** un helper `permanentRedirect()` en `src/proxy.ts` que copia la query
de la petición original, aplicado a las siete redirecciones permanentes.
Verificado con la aplicación en marcha:

```
/pricing?ref=afiliado123        → /prices?ref=afiliado123
/gallery/algo-viejo?ref=abc     → /image-prompts?ref=abc
/webpages/instagram-clone?ref=x → /landing-pages?ref=x
```

Protegido con `tests/unit/redirect-query-preservation.test.ts`.

**Implicación de marketing:** cualquier campaña de afiliados anterior a esta
fecha tiene comisiones sin atribuir. Si algún afiliado se quejó de que sus
enlaces no convertían, esta era la causa y conviene decírselo.

## Fuga confirmada · la página de precios no tiene preguntas frecuentes

`prices-client.tsx` no contiene ninguna sección de preguntas frecuentes: cero
coincidencias de «faq», «refund» o «cancel». Una FAQ que resuelva cancelación,
prorrateo y caducidad de créditos reduce fricción exactamente donde se decide
pagar.

Existían nueve preguntas en la página `/pricing` eliminada. Se rescataron en
`docs/faq-precios-rescatada.md`, clasificadas en tres grupos: cinco listas para
publicar, tres a corregir y una que exige una decisión.

### Contradicción que hay que resolver antes de publicar

La FAQ prometía «garantía de devolución de 30 días». La página `/refunds` se
titula **«Política de No Reembolsos»**.

En la mayoría de jurisdicciones prevalece la promesa comercial más favorable al
consumidor que se mostró en el momento de la compra, así que la garantía sería
exigible pese a la política. Hay que elegir: honrar los 30 días y actualizar
`/refunds`, o no publicar la promesa y revisar que ningún otro texto la haga.

Para un producto sin reseñas todavía, una garantía de devolución es uno de los
argumentos de venta más eficaces que existen. Merece la pena considerar honrarla
en lugar de retirarla.

### Dos cifras que estaban mal en esa FAQ

- **El descuento anual se anunciaba como «2 meses gratis».** Es $108 mensual
  frente a $54 anual: **50 %, seis meses gratis**. La oferta real es tres veces
  mejor de lo que se comunicaba.
- **El correo de soporte apuntaba a `promptstudio.com`**, y el dominio del sitio
  es `prompstudio.com` —sin la «t»—, así que ese buzón probablemente no existe.

## El problema estructural: la escalera de precios

La escalera real, según `src/lib/subscription-plans.ts`, es:

| Plan | Mensual | Anual |
| --- | ---: | ---: |
| Free | $0 | $0 |
| Premium | $9 | $54 |
| Startup | $1 000 | $10 000 |

El tramo de $1 000 **no tiene asientos de equipo ni claves de API** —ninguna
referencia a organizaciones en el código—, así que hoy no es vendible a una
empresa. En la práctica hay **un solo producto, a $9**.

Eso determina toda la estrategia de captación:

| A $9/mes | Valor |
| --- | ---: |
| Ingreso por cliente al año | $54 a $108 |
| Coste de adquisición tolerable | $15 a $25 |
| Coste real del clic en este nicho | $2 a $6 |
| Conversión necesaria para que cierre | 15 % a 25 % |

Ninguna landing convierte al 20 % desde tráfico pagado. **Con $9 no se puede
comprar tráfico.** Quedan dos caminos:

**Camino A — orgánico.** Aceptar que $9 es un negocio de volumen y llevar todo
el esfuerzo a SEO y herramientas gratuitas. Lento (6-12 meses) y barato. El
catálogo de 1 122 piezas y las 815 páginas ya generadas juegan a favor.

**Camino B — tramo intermedio.** Crear el plan de $29-39 que la propia página ya
anuncia y que no existe. Con unos $400 al año por cliente, la adquisición pagada
empieza a cerrar.

**Recomendación: B primero, luego A.** El tramo intermedio ya está prometido en
la página —solo hay que hacerlo real— y sin él nunca habrá margen para pagar por
crecer.

## Posicionamiento

El producto vende hoy prompts, componentes, plantillas de landing, generación de
imagen, vídeo y web, laboratorio de prompts, campañas y publicación. **Eso no es
un producto, es una caja de herramientas**, y una caja de herramientas no se
compra por impulso porque el visitante no identifica qué problema suyo resuelve.

Lo difícil de copiar no son los prompts —son mercancía, hay gratis en todas
partes— sino **el circuito completo brief → generación → landing publicada**, con
versionado de prompts, experimentos entre proveedores y contabilidad de
créditos. Un banco de plantillas no tiene eso.

### Propuesta de valor

> **De brief a campaña publicada en una tarde.**
>
> Escribes qué vendes. Prompt Studio genera las imágenes, los vídeos y la
> landing, con tu marca aplicada, y la publica en tu dominio. Sin diseñador, sin
> maquetador y sin esperar tres semanas.

Subtítulo que sostiene la promesa con lo que ya existe:

> 1 122 piezas listas —450 componentes, 275 prompts de imagen, 200 landings y
> 197 de vídeo— más generación con IA y publicación en un clic.

El cambio de fondo: se deja de vender **acceso a un catálogo** —que se compara
por precio y pierde contra lo gratuito— y se empieza a vender **un resultado con
plazo**, que se compara contra lo que cuesta un freelance.

### A quién

No al curioso de prompts. A la **agencia pequeña o al marketero en solitario**
que tiene que sacar campañas y le sobra trabajo. Ese perfil paga $39 al mes sin
discutir, porque le ahorra una tarde por campaña.

## Plan, en orden

| # | Acción | Esfuerzo | Motivo |
| --- | --- | --- | --- |
| — | ~~Arreglar `/pricing`~~ | hecho | Innecesario: ya redirigía. Página eliminada el 2026-09-08 |
| — | ~~Unificar el precio anual~~ | hecho | Innecesario: no había contradicción en vivo |
| — | ~~Saldo y plan reales en el dashboard~~ | hecho | Mostraba «850 créditos» de maqueta |
| — | ~~Preservar la query en las redirecciones~~ | hecho | Recupera la atribución de afiliado |
| 1 | Decidir la política de reembolso | decisión | La FAQ prometía 30 días contra la política publicada |
| 2 | Publicar las 5 preguntas verificadas en `/prices` | ½ día | Reduce fricción donde se decide pagar; hay `accordion.tsx` |
| 3 | Corregir el descuento anual a «6 meses gratis» | 15 min | Se anuncia una oferta tres veces peor que la real |
| 4 | Verificar las fugas 2 y 3 con la app en marcha | 1 h | Se comprobaron leyendo ficheros, no pidiendo URLs |
| 5 | Muro de correo en descargas gratuitas | ½ día | 24 imanes que quizá no capturan nada · **verificar primero** |
| 6 | Crear el tramo de $39 | 1-2 días | Es lo que hace posible pagar por crecer |
| 7 | `hreflang` entre `es` y `en` | 2 h | Duplica el mercado direccionable; ambas versiones ya existen |
| 8 | Correo posterior a descarga y a compra | 1 día | Sin esto nadie vuelve ni deja reseña |
| 9 | Las 4 herramientas gratuitas como imanes reales | 2-3 días | El canal más barato a este precio |
| 10 | `aggregateRating` en JSON-LD | 1 día | Estrellas en Google, ya con reseñas reales que lo llenen |
| 11 | Reclutar afiliados | continuo | El programa está construido y vacío |

Los cuatro tachados ya están aplicados y verificados. De los pendientes, el 1 es
una decisión de negocio que bloquea al 2, y el 3 son quince minutos que mejoran
la oferta que ya estás comunicando.

**Antes de reclutar afiliados (paso 11) conviene avisar** a quien ya participara:
sus enlaces a URLs heredadas perdían la comisión hasta el 2026-09-08.

## Lo que este análisis no cubre

Está hecho desde dentro del embudo: precios, permisos, capturas y plantillas.
**No incluye analítica de tráfico**: de dónde vienen los 50 usuarios, qué páginas
ven y en qué punto abandonan. Ese dato cambiaría las prioridades.

- Si llegan de redes sociales buscando prompts gratuitos, el problema es de
  audiencia y ningún arreglo de precio lo resuelve.
- Si llegan de búsquedas de intención comercial, las fugas de arriba son
  exactamente lo que está costando el dinero.

Las colecciones `ObservabilityEvent`, `UserActivity` y `UserInterest` ya recogen
ese comportamiento. Analizarlas convierte este diagnóstico estructural en un
diagnóstico medido.
