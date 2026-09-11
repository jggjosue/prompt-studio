# Perfil de empresa y fuentes de datos

## Quién puede participar

La propuesta está dirigida a empresas de cualquier sector que hayan acumulado información operativa durante varios años en las herramientas con las que trabajan. No existe un número mínimo de empleados: la evaluación se basa en las características del conjunto de datos, no en el tamaño de la organización.

Tener datos suficientes para una evaluación no implica que sean aptos para licenciarse. Antes de preparar cualquier copia deben confirmarse la titularidad, los permisos contractuales, la privacidad y las exclusiones descritas en [Gobernanza y consentimiento](gobernanza.md).

## Fuentes habituales

| Área | Ejemplos de sistemas | Contexto que puede aportar |
| --- | --- | --- |
| Comunicación | Slack, Microsoft Teams | Conversaciones, coordinación, decisiones y seguimiento |
| Gestión de trabajo | Jira, Linear | Solicitudes, incidencias, responsables, estados y resolución |
| Conocimiento | Notion, Confluence | Especificaciones, procedimientos, decisiones y documentación |
| Relación con clientes | CRM | Ciclo comercial, interacciones y resultados autorizados |
| Finanzas y operaciones | Sistema financiero o ERP | Procesos, estados y eventos operativos permitidos |
| Desarrollo de software | GitHub, GitLab, Bitbucket u otro servidor de código | Cambios, revisiones, incidencias y evolución técnica |
| Integración continua | GitHub Actions, GitLab CI, Jenkins u otro sistema CI | Ejecuciones, fallos, correcciones y resultados de validación |

La presencia de una herramienta en esta lista no autoriza automáticamente su contenido. Cada fuente debe revisarse de forma independiente y puede requerir exclusiones por usuario, canal, proyecto, periodo o categoría de datos.

## Qué determina el valor potencial

La evaluación debe considerar al menos:

1. **Volumen útil:** cantidad de registros relevantes después de eliminar duplicados, ruido y contenido no autorizado.
2. **Antigüedad:** periodo cubierto y capacidad para observar cambios a lo largo del tiempo.
3. **Continuidad:** ausencia de vacíos que impidan reconstruir un proceso o resultado.
4. **Interconexión:** posibilidad de relacionar, con identificadores autorizados, una solicitud con su discusión, decisión, ejecución y resultado.
5. **Calidad:** estructura, legibilidad, consistencia y contexto suficiente para interpretar los registros.
6. **Procedencia:** origen, responsables, permisos y transformaciones demostrables.
7. **Singularidad:** dificultad de obtener legalmente un conjunto equivalente en otra fuente.
8. **Riesgo residual:** presencia de datos personales, secretos, propiedad intelectual de terceros o posibilidad de reidentificación.

Un documento aislado suele aportar menos contexto que un historial conectado. Por ejemplo:

`ticket → conversación → decisión → cambio de código → ejecución de CI → resultado`

Esta relación solo debe conservarse mediante identificadores seudónimos y controles que no permitan reconstruir identidades o contenido excluido.

## Evaluación inicial

El inventario previo debe registrar por fuente:

| Campo | Descripción |
| --- | --- |
| Sistema | Herramienta y organización propietaria |
| Periodo | Primera y última fecha disponibles |
| Volumen bruto | Registros y tamaño antes del filtrado |
| Volumen elegible | Registros estimados después de exclusiones |
| Relaciones | Sistemas con los que puede vincularse legítimamente |
| Responsable | Persona que conoce la fuente y puede validar su uso |
| Derechos | Base contractual y restricciones conocidas |
| Sensibilidad | Categorías personales, confidenciales o reguladas |
| Calidad | Cobertura, duplicación, estructura y datos faltantes |
| Estado | Pendiente, elegible, bloqueada o descartada |

## Resultado de la evaluación

La evaluación inicial no asigna automáticamente un precio ni garantiza una licencia. Su resultado debe ser uno de estos:

- **Elegible para análisis:** puede prepararse una muestra aislada bajo controles.
- **Requiere remediación:** necesita permisos, clasificación, saneado o mejoras de calidad.
- **Bloqueada:** existe una restricción que impide continuar por el momento.
- **Descartada:** el riesgo, la falta de derechos o la baja utilidad no justifican procesarla.

