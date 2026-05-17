import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "spotify-green": "#1ed760",
        "spotify-black": "#000000",
        "spotify-gray": "#b3b3b3",
        "spotify-dark": "#121212",
        "spotify-border": "#282828",
      },
      fontFamily: {
        montserrat: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      transitionProperty: {
        transform: "transform",
      },
    },
  },
  plugins: [],
};

export default config;
