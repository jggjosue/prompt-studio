# MCP Integrations

Prompt Studio no expone actualmente un servidor MCP ni consume herramientas mediante un cliente MCP propio.

Usar herramientas MCP durante el desarrollo no equivale a integrar MCP en el producto. Por ello esta área queda documentada como no implementada.

## Extensión natural

Un servidor MCP futuro podría exponer herramientas con permisos acotados:

- buscar el catálogo;
- consultar proyectos y Brand Kits;
- crear trabajos de generación;
- leer su progreso;
- ejecutar evaluaciones reproducibles;
- recuperar informes sin incluir prompts privados.

Debería reutilizar las capas de autorización, créditos, rate limiting y observabilidad existentes. Hasta implementar y probar ese servidor, no se recomienda presentar MCP como capacidad demostrada por este repositorio.
