# FAQ rescatada de la página `/pricing` eliminada

`src/app/[locale]/pricing/page.tsx` se eliminó el 2026-09-08: era inalcanzable
—el middleware redirige `/pricing` a `/prices` con un 308— y construía dos
páginas estáticas de 176 kB que nadie podía ver.

Contenía nueve preguntas frecuentes que **no existen en `/prices`**, la página
que sí se sirve. Se conservan aquí porque son contenido comercial útil en el
punto donde se decide pagar, pero **no se migraron automáticamente**: tres de las
nueve afirman cosas falsas o que contradicen la política publicada, y decidir qué
se promete a un cliente no es una decisión técnica.

## Listas para publicar

Verificadas contra el código.

| Pregunta | Respuesta | Verificación |
| --- | --- | --- |
| ¿Puedo cancelar cuando quiera? | Sí, desde el panel; la suscripción sigue activa hasta el final del ciclo facturado. | Existe `/api/subscription/portal`, el portal de Stripe permite cancelar |
| ¿Los créditos pasan al mes siguiente? | Los del plan no se acumulan; los créditos comprados aparte no caducan. | Correcto: nada en el código caduca créditos, y las recargas se suman al saldo |
| ¿Qué pasa si agoto mis créditos? | Puedes comprar una recarga o subir de plan. | Correcto desde que existe `/dashboard/credits` |
| ¿Puedo cambiar de plan? | Sí, el prorrateo se aplica en el siguiente ciclo. | El portal de Stripe prorratea por defecto |
| ¿Hay cargos ocultos? | No. El precio mostrado es el que se cobra; pueden aplicarse impuestos según el país. | Coherente con el checkout |

## Corregir antes de publicar

### El descuento anual está mal calculado

El texto original decía «los planes anuales te dan 2 meses gratis».

| Concepto | Valor |
| --- | ---: |
| Mensual × 12 | $108 |
| Anual | $54 |
| Ahorro real | **50 %, seis meses gratis** |

La oferta real es tres veces mejor de lo que anuncia el texto. Conviene
corregirlo al alza: se está infravalorando el propio descuento.

### El correo de soporte apunta a un dominio que no es el del sitio

El texto daba `user@example.com`. El dominio configurado en
`src/lib/site-url.ts` es **`prompstudio.com`** —sin la «t» tras «promp»—, así que
ese buzón probablemente no existe. Hay que confirmar cuál es la dirección real
antes de publicarla en una página de precios.

### Los métodos de pago mencionan PayPal sin confirmar

El texto afirmaba aceptar «Visa, MasterCard, American Express y PayPal». El
cobro va por Stripe, pero **no se puede verificar desde el código** si PayPal
está habilitado en la cuenta de Stripe. Confírmalo en el panel de Stripe antes de
prometerlo, o limita la frase a tarjetas.

## No publicar sin resolver una contradicción

### La FAQ prometía 30 días de devolución y la política dice lo contrario

El texto original decía:

> «Ofrecemos una garantía de devolución de 30 días para todas las suscripciones
> nuevas.»

La página `/refunds` se titula **«Política de No Reembolsos»**.

Son afirmaciones incompatibles. Publicar la garantía en la página de precios
mientras la política legal dice lo opuesto es un riesgo real: en la mayoría de
jurisdicciones prevalece la promesa comercial más favorable al consumidor que se
mostró en el momento de la compra, así que la garantía sería exigible pese a la
política.

Hay que decidir una de las dos:

1. **Honrar los 30 días**: actualizar `/refunds` y publicar la garantía. Es un
   argumento de venta fuerte para un producto sin reseñas todavía.
2. **Mantener el no reembolso**: no publicar la FAQ y revisar que ningún otro
   texto la prometa.

Mientras no se decida, esta pregunta queda fuera de `/prices`.

## Contexto de por qué falta la FAQ

`/prices` no tiene ninguna sección de preguntas frecuentes: cero coincidencias
de «faq», «refund» o «cancel» en `prices-client.tsx`. Una FAQ que responda
cancelación, prorrateo y caducidad de créditos reduce fricción justo donde se
decide pagar, así que merece la pena publicar al menos las cinco verificadas.
