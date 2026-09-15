# Checklist de preparación

## Inventario inicial

- [ ] Se identificaron las fuentes, propietarios y responsables internos.
- [ ] Se midieron periodo, volumen bruto y volumen potencialmente elegible.
- [ ] Se documentaron continuidad, estructura, duplicación y datos faltantes.
- [ ] Se identificaron relaciones autorizadas entre tickets, conversaciones, documentos, CRM, finanzas, código y CI.
- [ ] Las relaciones pueden conservarse sin exponer identidades ni categorías excluidas.
- [ ] La fuente tiene contexto suficiente; no se valora únicamente por el número de archivos o empleados.

## Bloqueantes

- [ ] Existe autoridad documentada para evaluar y licenciar cada fuente.
- [ ] Contratos y políticas permiten el uso propuesto.
- [ ] Secretos y credenciales fueron eliminados y rotados cuando corresponde.
- [ ] No quedan categorías de datos excluidas.
- [ ] La procedencia y licencia de terceros están resueltas.
- [ ] El riesgo de reidentificación fue evaluado sobre la versión final.
- [ ] La muestra humana no contiene PII o información confidencial residual.
- [ ] El propietario aprobó versión, destinatario, finalidad y compensación.
- [ ] Existe acuerdo firmado antes de entregar.

## Entregable técnico

- [ ] Dataset con ID y versión inmutables.
- [ ] Esquema y diccionario de campos.
- [ ] Datasheet con origen, periodo, población y limitaciones.
- [ ] Métricas de cobertura, calidad, duplicación y saneado.
- [ ] Manifiesto y SHA-256 por archivo.
- [ ] Registro de transformaciones y exclusiones.
- [ ] Licencia legible por humanos y restricciones operativas.
- [ ] Procedimiento de incidentes, eliminación y expiración.

## Evidencia comercial

- [ ] Comprador y receptor técnico identificados.
- [ ] Importe, moneda, comisión e impuestos separados.
- [ ] Condición exacta que devenga el pago.
- [ ] Estado del pago y recibo trazables.
- [ ] Renovación, sublicencia y exclusividad visibles.

Si cualquier bloqueante permanece abierto, el estado correcto es `QA bloqueado`; no “listo para licenciar”.
