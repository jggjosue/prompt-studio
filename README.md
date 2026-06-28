# Visionary Vault - Kinde Starter Kit for Next.js App Router

This is a [Next.js](https://nextjs.org/) project created in Firebase Studio, pre-configured to use Kinde for authentication with full App Router support.

## Dependencies

- **Node.js**: Version 18 or higher is required.
- **Kinde Account**: You'll need a free Kinde account to get your credentials. You can get one [here](https://kinde.com/start).

## Getting Started

Follow these steps to get your development environment running.

### 1. Set up your Kinde application

Before running the app, make sure you have set up a back-end web application in your Kinde dashboard. This will provide you with the necessary client ID and secret.

Within your Kinde back-end web application, update the following settings:

- **Allowed callback URLs**: Add `http://localhost:3000/api/auth/kinde_callback`
- **Allowed logout redirect URLs**: Add `http://localhost:3000`

**Note:** When you deploy your application, you will need to update these URLs with your production domain.

### 2. Set up your local environment

First, if you're working with a forked repository, clone it to your local machine.

```bash
# Replace <your_github_username> with your actual GitHub username
git clone https://github.com/<your_github_username>/kinde-nextjs-app-router-starter-kit.git
cd kinde-nextjs-app-router-starter-kit
```

### 3. Install dependencies

Run the following command in the root of your project to install the necessary dependencies:

```bash
npm install
```

### 4. Update Environment Variables

Create a `.env.local` file in the root of your project and copy the environment variables below into it. Replace the placeholder values with the actual credentials from your Kinde application.

```
KINDE_CLIENT_ID=e2d1ff2d40c54b10b2ab450a8f38240d
KINDE_CLIENT_SECRET=iFxOnyvKA84Z9MeJyvKp0uE1N22BErauQkF3HPqHAd5dWkn1ggnu
KINDE_ISSUER_URL=https://promptstudio.kinde.com
KINDE_SITE_URL=https://www.prompstudio.com/
KINDE_POST_LOGOUT_REDIRECT_URL=https://www.prompstudio.com/
KINDE_POST_LOGIN_REDIRECT_URL=https://www.prompstudio.com//dashboard
```

### 5. Run the Development Server

Once the dependencies are installed and your environment variables are set, you can run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see your application.

## Learn More

To learn more about the technologies used in this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [React Documentation](https://react.dev/) - learn about React.
- [Genkit Documentation](https://firebase.google.com/docs/genkit) - learn about Genkit for AI development.
- [ShadCN UI Documentation](https://ui.shadcn.com/) - learn about the UI components used.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS for styling.
- [Kinde Documentation](https://kinde.com/docs) - learn about Kinde authentication.

## Deployment
node update-ids-random.js
node update-video-ids-random.js

## Sitemap

- **Sitemap File Path**: `src/app/sitemap.ts`
- **Sitemap Public URL Path**: `/sitemap.xml` (e.g. `https://www.prompstudio.com/sitemap.xml`)
- **Sitemap Local URL Path**: `http://localhost:3004/sitemap.xml` (or whatever port next dev is running on)

The sitemap is dynamically generated in `src/app/sitemap.ts` and served at `/sitemap.xml` under your Next.js application. The production base URL defaults to `https://www.prompstudio.com` unless `NEXT_PUBLIC_SITE_URL` is set.

Current sitemap coverage: 405 URLs.

### Static pages

- `/`
- `/prompts`
- `/image-prompts`
- `/video-prompts`
- `/landing-pages`
- `/image-tags`
- `/video-tags`
- `/web-tags`
- `/prices`
- `/affiliate-program`
- `/prompt/edit`

### Category pages

- `/category/image-prompts`
- `/category/video-prompts`
- `/category/landing-pages`

### Landing pages

- `/landing-pages/3d-coworking-lobby`
- `/landing-pages/apple-iphone-video-scrub-hero`
- `/landing-pages/partner`
- `/landing-pages/affiliate-ecosystem`
- `/landing-pages/affiliate-marketer-hero`

### Direct Webpages (3D WebGL Templates)

These pages are located in the static `public/webpages/` directory and dynamically included in the sitemap index.

- `/webpages/3d-architecture-portfolio-pro/`
- `/webpages/3d-architecture-portfolio-walkthrough/`
- `/webpages/3d-architecture-walkthrough/`
- `/webpages/3d-art-museum-guided-curation/`
- `/webpages/3d-artist-pipeline-breakdown/`
- `/webpages/3d-charity-gala/`
- `/webpages/3d-cinematic-scene-short-film-timeline/`
- `/webpages/3d-cinematic-typography-music/`
- `/webpages/3d-cinematic-typography-video/`
- `/webpages/3d-classroom-simulations/`
- `/webpages/3d-classroom-synchronized-video-lessons/`
- `/webpages/3d-coach-session-room/`
- `/webpages/3d-compliance-audit-center/`
- `/webpages/3d-conference-main-stage/`
- `/webpages/3d-conference-room-stream/`
- `/webpages/3d-conference-room-streaming/`
- `/webpages/3d-consultant-boardroom-cases/`
- `/webpages/3d-corporate-campus-light-tour/`
- `/webpages/3d-corporate-campus-tour/`
- `/webpages/3d-corporate-library-training/`
- `/webpages/3d-corporate-library-training-pro/`
- `/webpages/3d-corporate-lobby-welcome-agenda/`
- `/webpages/3d-corporate-performance-dashboard/`
- `/webpages/3d-corporate-timeline-dioramas/`

### Landing Page Clones (Hosted in Cloudflare R2)

These clones and templates are hosted on Cloudflare R2 and dynamically resolved via the `/webpages/{slug}/` path, with automatic inclusion in the generated sitemap index.

- `/webpages/disney-plus-clone/`
- `/webpages/docusign-clone/`
- `/webpages/doordash-clone/`
- `/webpages/dropbox-clone/`
- `/webpages/anthropic-clone/`
- `/webpages/apple-clone/`
- `/webpages/apple-music-clone-minimalista/`
- `/webpages/apple-tv-plus-clone/`
- `/webpages/adobe-clone/`
- `/webpages/booking-clone/`
- `/webpages/box-clone/`
- `/webpages/amazon-clone/`
- `/webpages/asana-clone/`
- `/webpages/calendly-clone/`
- `/webpages/cloudflare-clone/`
- `/webpages/coda-clone/`
- `/webpages/databricks-clone/`
- `/webpages/datadog-clone/`
- `/webpages/deezer-clone-neon-futurista/`
- `/webpages/coursera-clone/`
- `/webpages/estudio-tropic/`
- `/webpages/eventloop-tickets-eventos/`
- `/webpages/evernote-clone/`
- `/webpages/expedia-clone/`
- `/webpages/framer-clone/`
- `/webpages/gitlab-clone/`
- `/webpages/google-workspace-clone/`
- `/webpages/grammarly-clone/`
- `/webpages/grubhub-clone/`
- `/webpages/hubspot-clone/`
- `/webpages/hulu-clone/`
- `/webpages/ikea-clone/`
- `/webpages/hbo-max-clone/`
- `/webpages/headspace-clone/`
- `/webpages/paramount-clone/`
- `/webpages/openai-clone/`
- `/webpages/paypal-clone/`
- `/webpages/peacock-clone/`
- `/webpages/peloton-clone/`
- `/webpages/pinterest-clone/`
- `/webpages/lyft-clone/`
- `/webpages/mastercard-clone/`
- `/webpages/masterclass-clone/`
- `/webpages/medium-clone/`
- `/webpages/mindfulkids-family/`
- `/webpages/miro-clone/`
- `/webpages/nike-clone/`
- `/webpages/meta-clone/`
- `/webpages/mongodb-clone/`
- `/webpages/instagram-clone/`
- `/webpages/intercom-clone/`
- `/webpages/jira-clone/`
- `/webpages/lego-clone/`
- `/webpages/loom-clone/`
- `/webpages/magzin-job-light/`
- `/webpages/magzin-job-dark/`
- `/webpages/airtable-clone/`
- `/webpages/assistly-freelance-va/`
- `/webpages/atelier-journal-luxury/`
- `/webpages/atlas-bank-corporate-blue/`
- `/webpages/breathspace-breathing/`
- `/webpages/broadsheet-tech-editorial/`
- `/webpages/canvas-studio-earthy-brutalist/`
- `/webpages/chronicle-history-journal/`
- `/webpages/cipher-cyberpunk-neon/`
- `/webpages/codenova-midnight-hacker/`
- `/webpages/codewave-freelance-developer/`
- `/webpages/coinbase-clone/`
- `/webpages/column-studio-photography/`
- `/webpages/coreclub-boutique-fitness/`
- `/webpages/corporateedge-business-events/`
- `/webpages/cosplayhub-community/`
- `/webpages/crunchyroll-clone/`
- `/webpages/devops-freelance-engineer/`
- `/webpages/discord-clone/`
- `/webpages/edit-bureau-creative/`
- `/webpages/expotrade-industry-expo/`
- `/webpages/figma-clone/`
- `/webpages/finfreelance-accountant/`
- `/webpages/fittrack-workout-app/`
- `/webpages/fiverr-clone/`
- `/webpages/flexflow-yoga-studio/`
- `/webpages/forma-brutalist-editorial/`
- `/webpages/galanight-charity-gala/`
- `/webpages/github-clone/`
- `/webpages/hackbay-hackathon/`
- `/webpages/halftone-design-zine/`
- `/webpages/infrawatch-observability/`
- `/webpages/inkwell-freelance-writer/`
- `/webpages/ironpulse-strength-gym/`
- `/webpages/kubefleet-kubernetes/`
- `/webpages/launchdev-sunrise-bootcamp/`
- `/webpages/logic-press-editorial-minimal/`
- `/webpages/loopline-devtool/`
- `/webpages/lumen-art-gallery/`
- `/webpages/magzin-job-brutalist-sunshine/`
- `/webpages/magzin-job-cyberpunk-neon/`
- `/webpages/magzin-job-editorial-minimal/`
- `/webpages/magzin-job-glassmorphism-ocean/`
- `/webpages/magzin-job-html-css/`
- `/webpages/magzin-job-soft-pastel-friendly/`
- `/webpages/mailchimp-clone/`
- `/webpages/mangashelf-digital-library/`
- `/webpages/marketfreelance-hub/`
- `/webpages/meridian-press-literary/`
- `/webpages/monday-clone/`
- `/webpages/monograph-architecture-journal/`
- `/webpages/motionlab-freelance-video/`
- `/webpages/northwind-sunset-glassmorphism/`
- `/webpages/paper-signal-newsletter/`
- `/webpages/pipelineforge-cicd/`
- `/webpages/pixelcraft-freelance-designer/`
- `/webpages/pixelforge-cyber-y2k/`
- `/webpages/bareform-builder/`
- `/webpages/artisanbox-handmade-market/`
- `/webpages/cryptopulse-trading/`
- `/webpages/echocast-podcast-music/`
- `/webpages/greenbasket-grocery/`
- `/webpages/ledgerflow-accounting/`
- `/webpages/lendwise-personal-loans/`
- `/webpages/horizon-luxury-hotels/`
- `/webpages/linea-design-studio/`
- `/webpages/arq-architect-studio/`
- `/webpages/carhub-marketplace-autos/`
- `/webpages/casa-maderal/`
- `/webpages/coworkly-espacios-coworking/`
- `/webpages/coursedeck-marketplace-cursos/`
- `/webpages/illustrate-freelance-artist/`
- `/webpages/netflix-clone-mexico/`
- `/webpages/paybridge-payments-api/`
- `/webpages/petpals-cuidado-mascotas/`
- `/webpages/airbnb-clone-landing/`
- `/webpages/artwalk-culture-festival/`
- `/webpages/arenapulse-esports-platform/`
- `/webpages/arenalive-sports-events/`
- `/webpages/amplive-concert-tickets/`
- `/webpages/aniwave-anime-streaming/`
- `/webpages/canva-clone/`
- `/webpages/beatforge-marketplace/`
- `/webpages/atelier-creative-studio-portfolio/`
- `/webpages/brandmint-freelance-strategist/`
- `/webpages/buffer-clone/`
- `/webpages/collective-freelance-agency/`
- `/webpages/caselab-ux-design-portfolio/`
- `/webpages/chorus-music-lessons/`
- `/webpages/codecraft-developer-portfolio/`
- `/webpages/cozyloft-home-decor/`
- `/webpages/duolingo-clone/`
- `/webpages/embertable-steakhouse/`
- `/webpages/forma-architecture-portfolio/`
- `/webpages/framehaus-art-director-portfolio/`
- `/webpages/gearlend-renta-equipo-outdoor/`
- `/webpages/glowlab-beauty-shop/`
- `/webpages/grain-film-photography/`
- `/webpages/guildforge-mmo-community/`
- `/webpages/healmatch-terapias-wellness/`
- `/webpages/ink-quarterly-magazine/`
- `/webpages/inkwell-illustrator-portfolio/`
- `/webpages/insuregrid-insurtech/`
- `/webpages/linear-clone/`
- `/webpages/lenshire-freelance-photographer/`
- `/webpages/meetpoint-community-meetups/`
- `/webpages/linkedin-clone/`
- `/webpages/mononote-writing-app/`
- `/webpages/luxethread-fashion-store/`
- `/webpages/lootvault-game-marketplace/`
- `/webpages/neonstrike-game-launch/`
- `/webpages/norte-atelier/`
- `/webpages/nightmarket-food-events/`
- `/webpages/nomadstay-budget-hostels/`
- `/webpages/notion-clone/`
- `/webpages/otakucon-anime-convention/`
- `/webpages/pawpark-pet-supplies/`
- `/webpages/pizzaalta-neapolitan/`
- `/webpages/pixelframe-photography-portfolio/`
- `/webpages/pixelshelf-indie-game-store/`

#https://www.prompstudio.com/webpages/pixelshelf-indie-game-store/sitemap.xml 

### Tag pages

These are generated from tags with at least 3 related catalog items.

- `/tags/cinematic`
- `/tags/realistic`
- `/tags/photography`
- `/tags/portrait`
- `/tags/fashion`
- `/tags/human-portrait`
- `/tags/fantasy`
- `/tags/nature`
- `/tags/modern`
- `/tags/elegant`
- `/tags/surreal`
- `/tags/sci-fi`
- `/tags/corporate`
- `/tags/business`
- `/tags/realism`
- `/tags/minimalist`
- `/tags/abstract`
- `/tags/photorealistic`
- `/tags/space`
- `/tags/landscape`
- `/tags/motion`
- `/tags/urban`
- `/tags/retro`
- `/tags/slow`
- `/tags/futuristic`
- `/tags/underwater`
- `/tags/outdoor`
- `/tags/natural-light`
- `/tags/soft-light`
- `/tags/galaxy`
- `/tags/concept-art`
- `/tags/desert`
- `/tags/neon`
- `/tags/high-fashion`
- `/tags/dramatic-lighting`
- `/tags/close-up`
- `/tags/vibrant`
- `/tags/colorful`
- `/tags/centered`
- `/tags/dark-moody`
- `/tags/cyberpunk`
- `/tags/retro-vintage`
- `/tags/geometric`
- `/tags/pastel`
- `/tags/car`
- `/tags/fish`
- `/tags/cosmic`
- `/tags/ancient`
- `/tags/golden-hour`
- `/tags/ultra-realistic`
- `/tags/epic`
- `/tags/morphing`
- `/tags/effects`
- `/tags/forest`
- `/tags/product-poster`
- `/tags/vibrant-colorful`
- `/tags/infographic`
- `/tags/garden`
- `/tags/waterfall`
- `/tags/vintage`
- `/tags/art`
- `/tags/industrial`
- `/tags/documentary`
- `/tags/style`
- `/tags/mechanical`
- `/tags/dragon`
- `/tags/fiery`
- `/tags/magic`
- `/tags/library`
- `/tags/warrior`
- `/tags/queen`
- `/tags/wide-angle`
- `/tags/fine-art`
- `/tags/cartoon`
- `/tags/synthwave`
- `/tags/japanese`
- `/tags/hidden`
- `/tags/dark`
- `/tags/moody`
- `/tags/sketch`
- `/tags/editorial`
- `/tags/void`
- `/tags/smooth`
- `/tags/night`
- `/tags/scene`
- `/tags/historical`
- `/tags/fast`
- `/tags/saas`
- `/tags/glassmorphism`
- `/tags/midjourney`

### Gallery pages

- Image gallery pages: `/gallery/img-1` through `/gallery/img-199`
- Video gallery pages: `/gallery-videos/v-1` through `/gallery-videos/v-97`

## Analytics Tags
The application uses Google Analytics to track user interactions. The following tags (events) are configured:
- `web_open_demo_URL` - Triggered when a user clicks the "Open" (demo URL) link.
- `web_buy_button_premium` - Triggered when a user clicks the "Buy" button for a premium component.
- `web_view_prompt` - Triggered when a logged-in user clicks "View prompt".
- `web_download_free` - Triggered when a user downloads a free component (or submits the email form).
- `web_download_premium` - Triggered when a premium/startup user directly downloads a component they have access to.
