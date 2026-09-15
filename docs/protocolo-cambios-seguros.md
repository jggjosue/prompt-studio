# Protocolo para cambios seguros

Este protocolo es obligatorio para cualquier tarea que modifique código de PrompStudio.

## 1. Informe previo a la implementación

Antes de editar archivos, registrar:

1. **Mejora solicitada:** objetivo, alcance y criterio de éxito.
2. **Arquitectura actual:** componentes, rutas, servicios, modelos y flujo de datos involucrados.
3. **Archivos afectados:** archivos que probablemente se modificarán y motivo.
4. **Comportamiento actual:** qué ocurre hoy y cómo se puede reproducir.
5. **Riesgos:** compatibilidad, datos, seguridad, privacidad, SEO, rendimiento y experiencia de usuario.
6. **Solución mínima:** cambio más pequeño que resuelve el problema sin reescribir módulos no relacionados.
7. **Plan de pruebas:** pruebas unitarias, integración, E2E y validación manual proporcionales al riesgo.
8. **Rollback:** archivos, configuración, migraciones y datos que deben restaurarse si la mejora falla.

No se inicia la implementación si falta una decisión que cambie materialmente el alcance, implique una migración irreversible o requiera autoridad adicional.

## 2. Implementación

Durante el cambio:

- Preservar funcionalidades existentes y compatibilidad salvo que el requisito indique explícitamente lo contrario.
- No reescribir módulos que no sean necesarios para cumplir el objetivo.
- Mantener los cambios pequeños, revisables y reversibles.
- Preservar cambios existentes del usuario y evitar modificar archivos ajenos al alcance.
- Añadir o actualizar pruebas que fallen antes del arreglo y pasen después cuando sea posible.
- Mantener datos privados, prompts, credenciales y PII fuera de logs, fixtures y resultados de pruebas.
- Añadir observabilidad estructurada cuando el cambio afecte operaciones críticas.
- Actualizar documentación cuando cambien contratos, configuración o procedimientos.

## 3. Verificación obligatoria

Ejecutar, en este orden y usando la versión de Node definida por el proyecto:

1. Pruebas específicas del módulo afectado.
2. Lint.
3. Type checking.
4. Suite de pruebas aplicable.
5. E2E de los recorridos afectados cuando corresponda.
6. Build de producción cuando el riesgo o el alcance lo justifiquen.
7. Revisión de errores, warnings, logs y cambios no deseados.

Si una comprobación no puede ejecutarse, el trabajo no se reporta simplemente como validado: se documentan el comando, el motivo, el riesgo y la verificación pendiente.

## 4. Informe final obligatorio

Cada implementación debe terminar con:

### Cambios realizados

- Resultado conseguido.
- Archivos modificados y propósito de cada uno.
- Cambios de contratos, datos, configuración o interfaz.

### Tests

- Comandos ejecutados.
- Resultado de cada comprobación.
- Pruebas no ejecutadas y motivo.

### Riesgos restantes

- Riesgos conocidos que permanecen.
- Métricas o alertas que deben vigilarse después del despliegue.

### Verificación manual

- Precondiciones.
- Recorrido exacto.
- Resultado esperado.
- Casos desktop/mobile, autenticado/anónimo o éxito/error cuando correspondan.

### Rollback

- Cómo desactivar la mejora de forma inmediata.
- Cómo revertir código y configuración.
- Cómo revertir o compensar migraciones de datos.
- Cómo comprobar que la reversión fue correcta.

## 5. Plantilla de ejecución

```md
# Cambio: <nombre>

## Antes de implementar

- Objetivo:
- Criterio de éxito:
- Arquitectura actual:
- Archivos afectados:
- Comportamiento actual:
- Riesgos:
- Solución mínima:
- Tests previstos:
- Rollback previsto:

## Después de implementar

- Cambios realizados:
- Archivos modificados:
- Tests ejecutados y resultados:
- Riesgos restantes:
- Verificación manual:
- Rollback definitivo:
```

## 6. Condiciones de cierre

Un cambio solo está terminado cuando:

- Cumple el criterio de éxito acordado.
- Las comprobaciones aplicables pasan.
- Los fallos o limitaciones restantes están explícitamente documentados.
- Existe una ruta de rollback segura.
- El informe final enumera todos los archivos modificados por la tarea.
