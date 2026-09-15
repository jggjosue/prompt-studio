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

## Riesgo

<!-- Qué se rompe si esto está mal, y cómo se revierte. -->
