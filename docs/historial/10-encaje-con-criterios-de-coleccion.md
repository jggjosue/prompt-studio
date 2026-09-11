# Encaje con criterios de colección

Tres criterios que un comprador de historiales de código publica como sus
prioridades, y si este proyecto los cumple. Medido, no estimado: los comandos
están en §5.

| Criterio | Etiqueta del comprador | Veredicto |
|---|---|---|
| Sistemas de dominio complejo | «máxima prioridad · alta demanda» | **Parcial** — solo por la parte financiera |
| Repositorios multilingües y políglotas | «fuerte demanda» | **No** |
| Proyectos de más de 5 años | «colección activa» | **No**, por amplio margen |

> **Otra rejilla, otro resultado.** Este mismo comprador —u otro— publica en
> otra página seis **categorías de datos** en las que el proyecto sí encaja:
> ver [11-encaje-con-categorias-de-datos.md](11-encaje-con-categorias-de-datos.md).
> Los criterios de esta página miden antigüedad, escala y heterogeneidad
> técnica; los de la otra, si el historial muestra procesos reales.

> **Aviso de lectura.** El material del comprador que se analiza aquí venía
> traducido automáticamente al español, con las etiquetas de lenguaje
> distorsionadas: «PITÓN» es Python, «IR» es Go, «MECANOGRAFIADO» es TypeScript
> y «ÓXIDO» es Rust. Conviene leer el original antes de decidir, porque una
> traducción así puede alterar también los umbrales.

---

## 1. Sistemas de dominio complejo — parcial

**Lo que piden**: sistemas en producción que gestionan transacciones
financieras, datos clínicos, rutas logísticas o planificación de recursos
empresariales, valorados porque contienen «casos límite y lógica de decisión que
el código más simple jamás mostraría». Etiquetas: finanzas, salud, logística,
ERP.

### Lo que sí hay: lógica de decisión financiera real y documentada

No es una pasarela de pago con un botón. Hay contabilidad propia con casos
límite resueltos y escritos. **Pero hay que separar lo desplegado de lo escrito**
—una distinción que esta sección omitía en su primera versión y que un comprador
comprobaría en un minuto—:

**Desplegado hoy (en HEAD, y por tanto en producción):** la máquina de estados
de comisiones de afiliados. `AffiliateSale` lleva `commissionRate`,
`commissionCents`, `status: 'pending' | 'paid' | 'pending_settlement'`,
`payoutStatus: 'available' | 'paid_out' | 'on_hold'` y `source:
'checkout' | 'invoice'`, con la comisión fijada en `AFFILIATE_COMMISSION_PERCENT
= 20` (`src/lib/affiliate.ts`), el webhook de Stripe y el registro de clics. Son
siete modelos de afiliados en producción.

**Escrito pero sin desplegar (solo en el árbol de trabajo):** el libro mayor de
créditos. `AICreditLedger.operation` es un enum
`['reserve', 'capture', 'refund']` atado al `jobId` —se reserva crédito al
encolar el trabajo de IA, se captura al completarlo y se devuelve si falla: el
patrón de reserva-captura, no un contador que se decrementa—, junto con
`CreditPurchase`, `ComponentPurchase`, `MarketplaceListing`, `MarketplaceSale` y
`ProductReview`. **HEAD tiene 13 modelos; el árbol de trabajo, 35.** Y 31 rutas
de API frente a 93.
- **Comisión de afiliados con regla de no recálculo retroactivo.** 20 %
  (`AFFILIATE_COMMISSION_PERCENT`), y las comisiones **ya devengadas no se
  recalculan** si el porcentaje cambia. Esa es exactamente la clase de decisión
  que un sistema simple no tiene.
- **Retención por ventana de reembolso.** Las ventas quedan en
  `payoutStatus: on_hold` mientras corre la ventana, con una comprobación
  semanal de las que ya pueden pagarse.
- **Caso límite reconocido y no resuelto**, lo que también es información:
  marcar una compra como reembolsada **no revoca los enlaces de descarga ya
  emitidos**. Está escrito en el SOP con su consecuencia práctica —si el
  reembolso responde a un abuso, hay que actuar aparte— en lugar de fingir que
  el flujo es limpio.
- **Nueve modelos financieros** entre los dos estados: `AICreditAccount`,
  `AICreditLedger`, `CreditPurchase`, `ComponentPurchase`, `AffiliateSale`,
  `AffiliatePayoutAccount`, `MarketplaceListing`, `MarketplaceSale`,
  `ProductReview`; y el flujo completo de cobro, entrega, reembolso y
  liquidación en [`sop-comercial.md`](../operaciones/sop-comercial.md), con
  tests (`affiliate-claims`, `credit-topup`, `generation-pricing`).

### Lo que no hay

- **Nada clínico, logístico ni de ERP.** Tres de las cuatro etiquetas de la
  tarjeta quedan vacías.
- **Escala de dominio.** Es la contabilidad de un catálogo de contenido con
  créditos y afiliados, no un sistema financiero con obligaciones regulatorias,
  conciliación contra terceros o auditoría externa.

### Cómo presentarlo si se presenta

Como **finanzas ligeras con lógica de decisión documentada**: devengo de
comisiones con no recálculo retroactivo, retención por ventana de reembolso y un
caso límite conocido sin resolver —todo eso **en producción**—, más un libro
mayor de créditos con reserva-captura **escrito y sin desplegar**. Es honesto y
es demostrable en cinco minutos. Lo que no aguanta es la etiqueta «sistema de
dominio complejo» a secas, ni presentar como productivo lo que solo está en el
árbol de trabajo.

## 2. Repositorios multilingües y políglotas — no

**Lo que piden**: tres lenguajes o más como capas reales — capa de datos en
Python, API en Go, frontend en TypeScript, esquemas SQL, automatización en
shell— porque «la información de entrenamiento multilingüe es extremadamente
difícil de sintetizar».

**Lo que hay** (ficheros versionados presentes en el árbol):

| Lenguaje | Ficheros | Líneas | Papel real |
|---|---|---|---|
| TypeScript (`.ts` + `.tsx`) | 343 | **58 589** | Todo: frontend, API, modelos, lógica |
| Node (`.mjs`) | 52 | 11 475 | Scripts de build, auditoría y validación |
| JavaScript (`.js`) | 168 | 9 832 | **160 están dentro de `public/webpages`**: activos de páginas generadas, no una capa del sistema |
| Python | 9 | 921 | Scripts sueltos de un solo uso: `rewrite_facet.py`, `translate-web-pages-to-english.py`, `test_imagen*.py` |
| Shell | 2 | 140 | Utilidades menores |
| **SQL** | **0** | **0** | La persistencia es MongoDB: no hay esquemas SQL ni migraciones |
| **Go / Rust / Java** | **0** | **0** | — |

Es un **monolito de TypeScript** con utilidades en Node y unas 900 líneas de
Python desechable. De los cinco lenguajes que la tarjeta enumera, hay uno.

**Y no se debe forzar.** Añadir una API en Go o una capa en Python para dar el
perfil produciría código sin historia detrás: exactamente lo contrario de lo que
el comprador dice valorar. Este criterio está estructuralmente fuera de alcance,
y no es un defecto del proyecto.

## 3. Proyectos de más de 5 años — no

**Lo que piden**: historiales largos con hilos extensos de revisión de PR,
muchos colaboradores y evolución arquitectónica documentada. «Un código fuente
con más de 5 años de historial genera mucha más información útil por línea».

| Lo que piden | Lo que hay | Cumple |
|---|---|---|
| Más de 5 años | **220 días** (10-dic-2025 → 18-jul-2026), 8 meses distintos | No |
| Muchos colaboradores | 3 correos: 2 son la misma persona en dos entornos, 1 es una herramienta | No |
| Hilos extensos de revisión de PR | **0** referencias a PR o incidencias en 364 commits; los 5 merges son de sincronización con `origin/main` | No |
| Evolución arquitectónica documentada | **Sí**: 12 trazas de decisión, 42 fallos con causa y corrección, dos sustituciones de stack trazadas (Kinde→Clerk, Firestore→MongoDB) | **Sí** |

Cumple el cuarto punto y falla los tres primeros. Y el que falla de forma más
relevante no es la antigüedad —que solo pasa el tiempo— sino la **revisión de
código**: el activo que esta tarjeta busca son los hilos de discusión alrededor
del cambio, y en este repositorio nunca existieron. Es la laguna 3.4 de
[04-inventario-de-fuentes-y-derechos.md](04-inventario-de-fuentes-y-derechos.md).

## 4. Conclusión y qué hacer

**No presentar el proyecto contra estas tres tarjetas.** En dos de ellas la
respuesta se comprueba en un minuto con `git log` y `git ls-files`, y en la
tercera queda a medias. Presentarse a un criterio que no se cumple pone en duda
también lo que sí se cumple.

Lo que este proyecto tiene encaja con el criterio **general** que las propias
compañías declaran —«si los registros muestran procesos y decisiones reales»,
[05](05-valor-y-licenciamiento-del-historial.md) §1— y no con estas tres
colecciones concretas, que son criterios de **antigüedad, escala y
heterogeneidad técnica**:

- 24 commits que llevan el error dentro del mensaje, con la corrección detrás.
- 42 fallos con causa, corrección y guardarraíl
  ([07](07-registro-de-fallos.md)).
- 66 commits donde la instrucción en lenguaje natural y el diff son el mismo
  objeto.
- Una cadena de generación sintética con cinco familias de proveedores e
  inyección de fallo probada ([09](09-capacidades.md) §2.2).

**La única vía de mejora real está en la tarjeta 1**, porque es la única que
depende de trabajo y no de tiempo transcurrido:

1. Documentar los casos límite del libro mayor y de las comisiones que hoy no
   están escritos: qué pasa con un reembolso **después** de haber pagado la
   comisión; cómo se reconcilia un trabajo de IA que falló y ya se había
   capturado; qué ocurre si el porcentaje cambia con ventas en `on_hold`.
2. Cerrar el caso límite conocido: los enlaces de descarga que sobreviven al
   reembolso.
3. Escribir la decisión, no solo el arreglo. Cada uno de esos casos es una traza
   con el mismo formato que las doce de [02](02-trazas-de-decision.md).

Eso convierte «finanzas ligeras» en lógica de dominio demostrable. Las tarjetas
2 y 3 no se pueden alcanzar honestamente, y conviene decidirlo así de una vez en
lugar de intentarlo.

## 5. Cómo reproducir estas mediciones

```bash
# lenguajes: ficheros y lineas de los que existen en el arbol
for ext in ts tsx mjs js py sh sql go rs java; do
  tot=0; n=0
  while IFS= read -r f; do [ -f "$f" ] && { tot=$((tot+$(wc -l < "$f"))); n=$((n+1)); }; done \
    < <(git ls-files "*.$ext")
  [ "$n" -gt 0 ] && printf "%-5s %4d ficheros %8d lineas\n" "$ext" "$n" "$tot"
done

# donde vive realmente el JavaScript
git ls-files '*.js' | awk -F/ '{print $1"/"$2}' | sort | uniq -c | sort -rn | head

# duracion, identidades y revision de codigo
git log --reverse --pretty=%ad --date=short | head -1
git log -1 --pretty=%ad --date=short
git log --pretty=%ae | sort | uniq -c | sort -rn
git log --merges --oneline | wc -l
git log --pretty=%B | grep -cE '#[0-9]+'

# logica de dominio financiero
grep -n "enum" src/models/AICreditLedger.ts
grep -in 'comisi\|reembols' docs/operaciones/sop-comercial.md
ls src/models | grep -iE 'credit|sale|purchase|payout|marketplace'
```
