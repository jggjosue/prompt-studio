# Puerta de decisión para Vercel Pro

**Estado al 2026-09-25:** `BLOQUEADO — NO ACTUALIZAR EL PLAN`  
**Tarea:** [#703](https://github.com/jggjosue/prompt-studio/issues/703)

Este documento evita que una actualización de plan oculte desperdicio de
almacenamiento. Una persona con acceso de `Owner` o `Billing` debe completar la
evidencia de esta página antes de comprar Vercel Pro.

## Evidencia disponible y límite

La captura histórica anterior a la optimización, registrada en #691, mostró:

| Métrica | Uso histórico | Cuota Hobby | ¿Es línea base optimizada? |
|---|---:|---:|---|
| Functions Storage | 28.13 GB | 10 GB | No |
| Deployment Storage | 27.24 GB | 10 GB | No |

Esos valores sirven para comparar el resultado, pero **no cumplen** la línea
base solicitada en #703. El auditor del repositorio
(`npm run audit:vercel-storage`) mide artefactos locales; no representa el
consumo facturable de la cuenta.

La verificación del 2026-09-25 encontró estas barreras:

- la sesión conectada sólo puede ver el equipo `Mazgin` en Hobby;
- el equipo que publica Prompt Studio no está disponible para esa sesión;
- por ello no fue posible leer su Usage ni configurar Spend Management;
- #696, que retira media descargable grande del despliegue, continúa abierta.

No se copiaron métricas de `Mazgin`: atribuirlas a Prompt Studio produciría una
línea base falsa.

## Captura obligatoria de la línea base

Después de cerrar #696, esperar un periodo representativo de **30 días** sin el
desperdicio anterior. Una persona con acceso al equipo correcto debe exportar
el mismo intervalo desde Vercel Usage y adjuntar el CSV o captura a #703. No se
versionan identificadores personales, tokens ni datos de clientes.

Registrar en el issue, para el intervalo `AAAA-MM-DD` a `AAAA-MM-DD`:

| Campo | Valor requerido |
|---|---|
| Team y proyecto de Prompt Studio | Identificadores confirmados, sin secretos |
| Functions Storage | GB facturados del periodo |
| Deployment Storage | GB facturados del periodo |
| Active CPU y Provisioned Memory | Unidades y costo |
| Fast Data Transfer | GB y costo |
| Edge Requests y Function Invocations | Unidades y costo |
| Image Optimization | Transformaciones/cache reads y costo |
| Build execution | Minutos y costo |
| Otros conceptos facturados | Unidades y costo por concepto |
| Consumo medido total | USD antes de créditos e impuestos |

Comando de apoyo, después de seleccionar el scope autorizado:

```bash
vercel usage --scope <team-slug> --from <inicio> --to <fin>
```

La evidencia se acepta sólo si cubre al menos 28 días, comienza después de la
última optimización de #696 y coincide con los totales visibles en Usage.

## Estimación reproducible

Según la documentación oficial vigente al 2026-09-25, Vercel Pro cobra una
cuota de plataforma de **USD 20 al mes**, que incluye un deploying seat y
**USD 20 de crédito mensual de uso**. Seats adicionales, add-ons, impuestos y
consumo que supere el crédito se suman por separado.

Con `U` igual al consumo medido mensual elegible, `S` al costo de seats
adicionales y `A` al costo de add-ons, la estimación antes de impuestos es:

```text
estimado mensual = 20 + S + A + max(0, U - 20)
```

Por tanto, con un solo deploying seat, sin add-ons y `U <= 20`, el piso es
**USD 20/mes antes de impuestos**. El costo real de Prompt Studio queda
deliberadamente sin calcular hasta obtener `U` del equipo correcto; sustituirlo
por el exceso histórico de GB o por métricas de otro equipo no sería válido.

Fuentes: [Pro plan](https://vercel.com/docs/plans/pro-plan),
[pricing](https://vercel.com/pricing) y
[Spend Management](https://vercel.com/docs/spend-management).

## Controles antes de habilitar pago por uso

Spend Management sólo está disponible en Pro. Inmediatamente después de que un
Owner o Billing ejecute la actualización, y **antes de autorizar tráfico de
producción adicional**, debe:

1. reemplazar el presupuesto on-demand predeterminado de USD 200 por un límite
   aprobado;
2. mantener notificaciones en 50 %, 75 % y 100 %;
3. añadir correo de Billing y teléfono para la alerta de 100 %;
4. activar **Pause all production deployments at 100%** como límite duro;
5. provocar una notificación de prueba o conservar captura de la configuración;
6. adjuntar la evidencia a #703.

El importe del presupuesto por sí solo **no detiene el consumo**: la acción de
pausa debe estar activada. Además, la pausa no limita seats ni add-ons, que se
presupuestan por separado. Como valor inicial, aprobar el mayor de estos dos
valores que soporte la operación: USD 25 de sobreconsumo o 150 % del
sobreconsumo mensual medido, redondeado hacia arriba a USD 5. Si ese techo no
es operativo, documentar y aprobar la excepción en #703.

## Decisión de actualización

La actualización puede aprobarse únicamente cuando estén marcadas todas:

- [ ] #696 cerrada y desplegada.
- [ ] Línea base optimizada de 28–30 días adjunta y comparada con #691.
- [ ] Estimación sustituye `U`, `S` y `A` con importes reales.
- [ ] Owner/Billing identificado y autorización comercial registrada.
- [ ] Presupuesto, alertas y pausa dura preparados para configurarse.
- [ ] Ventana de cambio y responsable de verificación acordados.

Vercel documenta [Hobby](https://vercel.com/docs/plans/hobby) para uso personal
y no comercial; por eso el destino
operativo de Prompt Studio comercial debe ser Pro. Aun así, esa necesidad no
autoriza una compra sin evidencia, controles y aprobación financiera. Si una
sola casilla queda abierta, la decisión sigue siendo **NO-GO**.
