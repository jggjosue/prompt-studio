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
