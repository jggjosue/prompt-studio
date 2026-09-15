# Valor y licenciamiento del historial

> La propuesta de producto y sus controles operativos están desarrollados en
> [Licenciamiento de datos operativos](../data-licensing/README.md). Este
> documento se limita a analizar el historial de este repositorio como activo
> potencial y no implica que el servicio ya esté disponible.

Por qué este conjunto de documentos está escrito como está: qué hace que un
historial de trabajo tenga valor para un tercero, qué no lo tiene, y qué
diferencia hay entre licenciar ese material y venderlo.

---

## 1. Aviso previo sobre las cifras que circulan

Los importes que se publican en este mercado son **cifras difundidas por las
propias compañías** que compran o intermedian datos. No significan que una
empresa concreta vaya a recibir esas cantidades, ni establecen un precio de
referencia aplicable a este proyecto.

El precio, cuando existe, depende de:

- **derechos sobre los datos** — si se puede acreditar quién es el titular y qué
  se puede hacer con ellos;
- **volumen**;
- **años de historial**;
- **exclusividad** — si el mismo material se puede obtener en otra parte;
- **privacidad** — cuánto dato personal contiene y qué hay que hacer antes de
  moverlo;
- **dificultad de obtener datos equivalentes**;
- y, por encima de todo lo anterior, **si los registros muestran procesos y
  decisiones reales**.

Un dato relevante sobre el orden de esa lista: al menos una de estas compañías
—Polyshares— señala explícitamente que **la procedencia y los derechos sobre los
datos se comprueban antes de negociar el precio**. Es decir, la comprobación de
§4 de [04-inventario-de-fuentes-y-derechos.md](04-inventario-de-fuentes-y-derechos.md)
no es un trámite posterior a un acuerdo: es la puerta de entrada.

> **Estado de verificación.** Las afirmaciones atribuidas en este documento a
> Polyshares y a Imladris provienen de lo que esas compañías declaran
> públicamente, tal y como lo recogió el propietario del proyecto. **No se han
> verificado de forma independiente al escribir este documento** (no se
> consultaron sus publicaciones ni fuentes externas). Trátense como referencia
> de contexto, no como dato comprobado.

## 2. Qué tipo de datos parece tener más potencial

Hay un patrón claro en lo que estas empresas buscan, y **no** es simplemente
«tener muchos GB de información».

Lo que tiene valor son las **secuencias**:

```
problema → conversación → análisis → decisión → acción → error → corrección → resultado
```

Por eso 100 000 PDF finales pueden valer menos que varios años de Jira + Slack +
GitHub + documentación + revisiones de código: los primeros son resultados
aislados, los segundos permiten reconstruir **cómo** una persona o un equipo
resolvió un problema. Imladris lo formula de forma parecida: un documento
aislado vale menos que el historial que existe alrededor de él.

Consecuencia directa: el material valioso no es el entregable, es el rastro que
lo rodea —el hilo donde se discutió, el análisis que descartó dos alternativas,
el error que costó dos días, la corrección que funcionó y la medida de que
funcionó.

Eso hace potencialmente interesantes a las empresas de **software, IT/MSP,
soporte técnico, contabilidad, seguros, legal, ventas B2B, ingeniería,
logística, atención al cliente y operaciones financieras**: sectores donde el
trabajo diario deja registro escrito de decisiones tomadas bajo incertidumbre.

## 3. Licenciar no es vender

Los datos no tienen que venderse necesariamente. Se pueden **licenciar**,
conservando la propiedad, con la posibilidad de volver a monetizarlos.
Polyshares, por ejemplo, diferencia explícitamente entre licenciar el activo y
venderlo.

La diferencia práctica:

| | Venta | Licencia |
|---|---|---|
| Propiedad | Se transfiere | Se conserva |
| Monetización posterior | Agotada | Posible con otros licenciatarios |
| Alcance | Suele ser total | Delimitable: por uso, plazo, territorio, exclusividad |
| Revocable | No | Según lo pactado |
| Riesgo si el material contiene un problema (secretos, procedencia dudosa, datos personales) | Se cede el problema junto con el activo, normalmente con garantías a cargo del cedente | El mismo problema, y además persiste la responsabilidad como titular |

Lo último merece subrayarse: **licenciar no elimina la necesidad de limpiar el
material**. Conservar la propiedad significa conservar la responsabilidad.

## 4. Aplicado a este proyecto, sin adornos

Qué tiene este historial, medido y no estimado:

**A favor**

- La conversación y el cambio están **en el mismo objeto** durante las fases 1 a
  3: 66 commits llevan la instrucción en lenguaje natural junto al diff que la
  resolvió. Eso es difícil de reconstruir después y no se obtiene en un
  repositorio con mensajes convencionales.
- **24 commits llevan el error dentro del mensaje**, con la corrección en el
  commit siguiente. La secuencia error → corrección es directa.
- Una **base de conocimiento con 16 incidentes reales** con causa y desenlace, y
  con las reglas generales que dejaron: «un cambio no está verificado hasta que
  `next build` pasa», «los tests que enumeran lo que hay que proteger caducan;
  los que recorren el directorio real, no».
- Documentación **derivada del código, no de la memoria**, y por tanto
  verificable y con caducidad detectable.
- Doce trazas de decisión reconstruidas con su secuencia completa, incluidos los
  errores intermedios ([02](02-trazas-de-decision.md)).

**En contra**

- **Escala real: dos personas, siete meses.** Es documentación auténtica y
  verificable, y ese es su valor; no sostiene una lectura de organización mayor.
  Cualquier presentación que lo insinúe se cae con un `git shortlog`.
- El eslabón **análisis** solo se documentó en su momento en 1 de las 12 trazas,
  y **sigue sin documentar en 6**. Es precisamente el que demuestra cómo se
  razona.
- **80 commits** con mensajes de 15 caracteres o menos: diff recuperable,
  intención no.
- **Cero** registro de discusión: no hay tickets, ni revisiones de código, ni
  hilos. Los 5 merges del historial son de sincronización.
- La fase más densa en documentación (sept 2026) está **sin commitear**, así que
  su propio rastro es el más débil del proyecto.
- **Secretos vivos en el historial.** Bloqueante, no cosmético.
- **Procedencia del catálogo sin cerrar**, con auditoría ya escrita pero no
  concluida.

Lectura honesta: el material de más valor de este proyecto no es el catálogo
—que es producto— ni el código —que es resultado—, sino los 24 commits de error
con su corrección, la base de conocimiento y las trazas de decisión. Son pocos
kilobytes frente a 115 MB de `webpages`, y valen más.

> **Relacionado.** [../mejoras-recomendadas.md](../mejoras-recomendadas.md) §7
> («La oportunidad: licenciar el catálogo») trata la otra mitad del asunto: el
> **catálogo** como activo licenciable. Este documento trata el **historial**.
> Son dos activos distintos y conviene no mezclarlos en la misma conversación.

## 5. Qué hacer para que el historial futuro valga más

Cinco cambios de hábito, ordenados por relación entre coste y efecto. Ninguno
requiere herramientas nuevas.

1. **Commitear la fase 7 por bloques temáticos.** Convierte seis días de trabajo
   opaco en historial trazable. Coste: unas horas.
2. **Dos líneas de «por qué» en cada decisión costosa de revertir.** Qué se
   consideró, qué se descartó, con qué criterio. Es el eslabón que falta en 11
   de 12 trazas y el más caro de reconstruir después.
3. **Declarar el resultado.** Cuando un cambio busca un número —páginas
   prerenderizadas, tamaño de bundle, tiempo de build—, anotar el antes y el
   después en el commit. Las mejores frases de esta documentación son las que
   traen medida: «de 121 rutas dinámicas a 60».
4. **Un commit, un tema.** `e4a99785` cambió el proveedor de identidad y añadió
   internacionalización bajo el mensaje «web pages 5». Separarlos habría
   costado un minuto y habría dejado dos decisiones legibles.
5. **Seguir alimentando la base de conocimiento en el momento del incidente**,
   no al documentar meses después. Es el documento con mejor relación entre
   tamaño y valor de todo el repositorio.

Y una recomendación de gestión, no de escritura: **mantener separados** el
historial de desarrollo y los datos de clientes. Son dos activos con dos
regímenes distintos, y mezclarlos hace que el más restrictivo contamine al otro.

## 6. Antes de cualquier conversación con un tercero

La secuencia, en este orden y sin saltarse pasos:

1. **Rotar** las credenciales que estuvieron en el historial. Bloqueante.
2. **Acreditar la titularidad** del código y del catálogo por escrito.
3. **Cerrar la auditoría de procedencia** del catálogo
   (`npm run catalog:provenance`).
4. **Decidir el alcance de la cesión**: repositorio completo, solo `docs/`, solo
   el historial de git, o un extracto de trazas. Decidido antes, no durante.
5. **Decidir licencia o venta**, sabiendo que la licencia conserva la propiedad
   y también la responsabilidad.
6. **Presentar la escala real.** Dos personas, siete meses, 364 commits. Es
   comprobable en treinta segundos y es lo primero que comprobará cualquiera.

El detalle de los cuatro primeros puntos está en
[04-inventario-de-fuentes-y-derechos.md](04-inventario-de-fuentes-y-derechos.md).

---

**Este documento no es asesoramiento legal ni financiero.** Recoge criterios de
valoración que las propias compañías del sector declaran públicamente —sin
verificación independiente, ver §1— y los aplica al material que existe en este
repositorio. Cualquier cesión, licencia o venta requiere revisión jurídica
propia.
