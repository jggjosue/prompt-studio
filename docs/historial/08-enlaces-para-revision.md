# Enlaces para revisión

Qué se puede enseñar hoy mediante un enlace, qué requiere conceder acceso, y qué
simplemente no existe como enlace todavía. Pensado para rellenar un campo del
tipo «*Links — paste repos, datasets, docs, or demos you'd like us to review*»
sin prometer nada que el revisor no vaya a poder abrir.

**Todos los estados de esta página se comprobaron el 9 de septiembre de 2026**
con `curl` contra la URL pública. Vuelve a comprobarlos antes de enviar nada:
el estado cambia con cada despliegue.

---

## 1. Bloque listo para pegar

Copia esto tal cual. No incluye ningún enlace que no responda hoy.

```text
DEMO EN PRODUCCIÓN (público, sin registro)
Sitio                 https://www.prompstudio.com
Catálogo por modelo   https://www.prompstudio.com/prompts
Prompts de imagen     https://www.prompstudio.com/image-prompts
Prompts de vídeo      https://www.prompstudio.com/video-prompts
Precios               https://www.prompstudio.com/prices
Páginas de aterrizaje https://www.prompstudio.com/landing-pages
Programa de afiliados https://www.prompstudio.com/affiliate-program
Sitemap / robots      https://www.prompstudio.com/sitemap.xml
                      https://www.prompstudio.com/robots.txt

REPOSITORIO (privado — acceso bajo petición)
https://github.com/jggjosue/prompt-studio

Nota: lo que está desplegado es la versión de julio de 2026. El trabajo
posterior (internacionalización, 35 modelos de datos, 42 tests unitarios,
13 validadores de SEO y ~25.700 palabras de documentación operativa) está en
el árbol de trabajo y no está publicado todavía. Puedo dar acceso al
repositorio o exportar la documentación y el dataset del historial en un
paquete aparte, según preferencia.
```

Si el formulario permite una sola URL, la buena es
**https://www.prompstudio.com** — es lo único que se abre sin fricción.

## 2. Estado real de cada enlace

### Demo en producción

| URL | Estado | Qué muestra |
|---|---|---|
| `https://www.prompstudio.com` | **200** | Portada |
| `…/prompts` | **200** | Catálogo de prompts por modelo de IA |
| `…/image-prompts` | **200** | 115 prompts de imagen, paginados |
| `…/video-prompts` | **200** | 42 prompts de vídeo |
| `…/prices` | **200** | Planes y precios |
| `…/landing-pages` | **200** | Catálogo de páginas de aterrizaje |
| `…/affiliate-program` | **200** | Programa de afiliados |
| `…/sitemap.xml`, `…/robots.txt` | **200** | Útiles si el revisor mira SEO técnico |

### Rutas que **no** responden y por qué

| URL | Estado | Motivo |
|---|---|---|
| `…/component-kits` | 404 | Fase 7, sin desplegar |
| `…/discover` | 404 | ídem |
| `…/prompt-optimizer` | 404 | ídem |
| `…/smart-search` | 404 | ídem |
| `…/code-auditor` | 404 | ídem |
| `…/community` | 404 | ídem |
| `…/gallery` | 404 | Solo existe el detalle `/gallery/{id}`, no el índice |

**Consecuencia que hay que decir en voz alta**: el árbol de trabajo tiene 84
páginas y 93 rutas de API; el sitio desplegado enseña una fracción. Un revisor
que abra los enlaces verá el producto de julio y sacará conclusiones sobre ese
producto. Si el objetivo es que valore el trabajo de septiembre, los enlaces
solos no sirven — hay que desplegar o dar acceso.

### Repositorio

| Recurso | Estado | Nota |
|---|---|---|
| `https://github.com/jggjosue/prompt-studio` | **404 para un visitante anónimo** | Es privado. El enlace se puede pegar, pero no se abre sin invitación |

> ### ⚠️ No concedas acceso al repositorio antes de rotar las credenciales
>
> El historial de git **contiene secretos de producción**: un `KINDE_CLIENT_ID`
> en el mensaje del commit `4a2f3055` y, antes de `2bf9a846`, un `.env.example`
> con 54 valores reales incluida una clave `sk_live_` de Clerk. Se limpiaron de
> HEAD, **no del historial**.
>
> Dar acceso de lectura al repositorio equivale a entregar esas credenciales.
> Rotar primero (`npm run verify:rotation` dice cuáles siguen en uso), conceder
> después. Detalle en
> [04-inventario-de-fuentes-y-derechos.md](04-inventario-de-fuentes-y-derechos.md) §4.2
> y en [T-04](02-trazas-de-decision.md#t-04--secretos-en-envexample).

### Documentación y dataset

Hoy **no tienen enlace**: son ficheros locales, y muchos ni están commiteados.
Lo que existe, con su ruta en el repositorio:

| Material | Ruta | Volumen |
|---|---|---|
| Historial de creación y cambios | [`docs/historial/`](README.md) | 9 documentos |
| Dataset del historial | [`docs/historial/datos/`](datos/README.md) | `commits.csv` (364 filas), `metricas.json`, `trazas.jsonl` (12 trazas) |
| Documentación operativa | [`docs/operaciones/`](../operaciones/README.md) | 9 documentos: SOPs, CRM, base de conocimiento |
| Producto y datos | [`docs/prd.md`](../prd.md), [`docs/dm.md`](../dm.md) | PRD y modelo de datos |
| Base de conocimiento | [`docs/operaciones/base-de-conocimiento.md`](../operaciones/base-de-conocimiento.md) | 16 incidentes con causa y desenlace |
| Registro de fallos | [`07-registro-de-fallos.md`](07-registro-de-fallos.md) | 42 fallos con guardarraíl |

## 3. Cómo convertir esto en enlaces de verdad

Tres opciones, de menos a más esfuerzo. La primera es la que desbloquea todo lo
demás.

1. **Commitear la fase 7 y desplegar.** Es lo que hace que los enlaces cuenten
   la verdad: 431 ficheros sin seguimiento y 349 modificados no existen para
   nadie más que para tu portátil. Coste: horas. Efecto: el demo pasa de 6
   secciones a 84 páginas, y el repositorio pasa a mostrar el trabajo real.
2. **Publicar un dossier de solo lectura** con el historial, las métricas y el
   registro de fallos. Da una URL que se puede pegar sin conceder acceso al
   código ni exponer el historial de git —y por tanto sin depender de la
   rotación de credenciales—. Es la vía rápida si hay prisa por enviar algo.
3. **Conceder acceso de lectura al repositorio.** La opción más completa y la
   única con un requisito previo bloqueante: **rotar los secretos**.

## 4. Qué no enviar

- **El repositorio completo antes de rotar.** Ya dicho, y es el único punto de
  esta página que no admite matices.
- **Volcados de base de datos.** Hay perfiles de usuario, actividad,
  consentimientos de cookies, cuentas de pago de afiliados y compras (35
  modelos). El historial de desarrollo y los datos de clientes son dos activos
  con dos regímenes distintos; mezclarlos hace que el más restrictivo contamine
  al otro.
- **`.env`, `.env.local` ni capturas donde se lean claves.**
- **Los 115 MB de `public/webpages`** hasta saber qué son y de dónde salieron
  ([preguntas-abiertas.md](preguntas-abiertas.md) §11 y §17).

## 5. Cómo volver a comprobar los enlaces

```bash
for p in / /prompts /image-prompts /video-prompts /prices /landing-pages \
         /affiliate-program /sitemap.xml /robots.txt; do
  printf "%-22s %s\n" "$p" \
    "$(curl -s -o /dev/null -w '%{http_code}' -m 12 "https://www.prompstudio.com$p")"
done

# ¿el repositorio es visible sin sesión?
curl -s -o /dev/null -w 'repo -> %{http_code}\n' https://github.com/jggjosue/prompt-studio
```
