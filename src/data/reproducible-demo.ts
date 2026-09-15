export const REPRODUCIBLE_DEMO_VERSION='1.0.0';
export const reproducibleDataset=[
  {key:'structured-product',input:'Devuelve JSON con title, audience y threeBenefits para una botella reutilizable.',expected:'JSON válido, tres beneficios y ninguna afirmación ambiental no demostrada.'},
  {key:'concise-headline',input:'Escribe un titular de máximo 60 caracteres para una cafetería de barrio.',expected:'Texto breve, claro y en español.'},
  {key:'support-answer',input:'Explica cómo cancelar una suscripción sin inventar políticas.',expected:'Indicar que se consulte la política vigente si faltan datos.'},
  {key:'accessible-cta',input:'Crea texto para un botón que descarga un informe PDF.',expected:'Acción específica y comprensible fuera de contexto.'},
]as const;
export const reproducibleRuns=[
  ['structured-product','openai','gpt-demo-2026-01',91,94,.018,820,'completed'],['structured-product','google','gemini-demo-2026-01',88,91,.012,690,'completed'],['structured-product','anthropic','claude-demo-2026-01',93,95,.021,910,'completed'],
  ['concise-headline','openai','gpt-demo-2026-01',94,92,.006,410,'completed'],['concise-headline','google','gemini-demo-2026-01',92,90,.004,360,'completed'],['concise-headline','anthropic','claude-demo-2026-01',90,94,.007,470,'completed'],
  ['support-answer','openai','gpt-demo-2026-01',89,93,.014,740,'completed'],['support-answer','google','gemini-demo-2026-01',86,88,.009,610,'completed'],['support-answer','anthropic','claude-demo-2026-01',95,96,.017,830,'completed'],
  ['accessible-cta','openai','gpt-demo-2026-01',96,95,.004,330,'completed'],['accessible-cta','google','gemini-demo-2026-01',94,92,.003,290,'completed'],['accessible-cta','anthropic','claude-demo-2026-01',94,96,.005,380,'completed'],
]as const;
export const reproducibleRunDate='2026-08-15T18:00:00.000Z';
