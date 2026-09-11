# Pipeline técnico

## Arquitectura propuesta

```text
Conectores de solo lectura
        ↓
Zona aislada de ingestión
        ↓
Inventario y clasificación
        ↓
Detección de secretos, PII y derechos
        ↓
Transformación y anonimización
        ↓
Evaluación automática + muestreo humano
        ↓
Dataset versionado y manifiesto
        ↓
Aprobación del propietario
        ↓
Entrega cifrada y auditada
```

## 1. Ingestión

Los conectores deben usar permisos de solo lectura, selección explícita de espacios y ventanas temporales, paginación con checkpoints e idempotencia. La fuente original no se modifica. Cada registro recibe procedencia, fecha y huella.

## 2. Clasificación

Se detectan tipo de documento, idioma, participantes, sensibilidad, propietario aparente, licencias adjuntas y relación entre ticket, conversación, código y resultado. La clasificación automática nunca concede derechos: solo crea señales para revisión.

## 3. Saneado

El pipeline combina reglas deterministas, detectores especializados y revisión humana. Debe cubrir secretos, identificadores directos, cuasi-identificadores, rutas internas, dominios privados, nombres de clientes y contenido contractual restringido.

La transformación conserva referencias internas mediante identificadores consistentes cuando sea necesario estudiar secuencias. Los valores originales y sustitutos viven en dominios separados; el mapa de reidentificación no acompaña al dataset.

## 4. Control de calidad

Métricas mínimas:

- cobertura y duplicación;
- porcentaje excluido y motivo;
- precisión y recall estimados de detectores sobre muestra etiquetada;
- tasa de secretos y PII residuales;
- consistencia de relaciones entre registros;
- distribución por fuente, fecha e idioma;
- utilidad de la tarea objetivo;
- revisión de licencias y procedencia.

Un hallazgo crítico bloquea la entrega. La reparación produce una nueva versión; nunca modifica silenciosamente la aprobada.

## 5. Entrega

El paquete contiene datos mínimos, diccionario, esquema, datasheet, licencia, restricciones, métricas, manifiesto de archivos y hashes. La entrega usa cifrado, destinatario identificado, expiración y registro de descarga.

## Reutilización de Prompt Studio

Se pueden reutilizar contratos de salida, evaluaciones reproducibles, procedencia de activos, observabilidad sanitizada, aprobaciones, regresión y exportación de informes. Todavía faltan conectores empresariales de ingestión, motor de anonimización, gestión contractual y entrega de datasets.
