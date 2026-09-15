## Qué cambia

<!-- Qué hace este PR y por qué. Si arregla un fallo, describe el síntoma. -->

## Cómo comprobarlo

<!-- Pasos concretos, o el comando que falla antes y pasa después. -->

## Comprobaciones

- [ ] `npm run validate` sale en 0
- [ ] Si añade o cambia rutas de API: la matriz está regenerada
      (`node scripts/mjs/build-route-access-matrix.mjs`) y `route-access-matrix.test.ts` pasa
- [ ] Si añade variables de entorno: están en `.env.example` con marcador de posición
- [ ] Si cambia comportamiento: hay una prueba que fallaba antes
- [ ] Ningún secreto real en el diff

## Documentation Reach (informativo)

- [ ] Si cambia código bajo `src/`, revisé los documentos enlazados en
      `docs/SWIMM.md` o expliqué por qué no requieren actualización.
- [ ] Si el cambio afecta un flujo crítico, actualicé el playbook correspondiente
      en `docs/playbooks/` o expliqué por qué no aplica.
- [ ] Revisé el reporte **Documentation Reach (informational)** del workflow.

> La comprobación no bloquea PRs durante la línea base. La meta posterior es
> **Tier B (≥40%)** medido por Swimm.

## Riesgo

<!-- Qué se rompe si esto está mal, y cómo se revierte. -->
