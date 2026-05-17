import Link from "next/link";
import Button from "./ui/Button";
import SpotifyLogo from "./SpotifyLogo";

const navLinks = ["Premium", "Asistencia", "Descargar"] as const;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-spotify-black/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:px-16">
        <Link
          href="#"
          className="flex items-center gap-2 font-bold text-white"
          aria-label="Spotify"
        >
          <SpotifyLogo />
          <span>Spotify</span>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Principal"
        >
          {navLinks.map((label) => (
            <Link
              key={label}
              href="#"
              className="text-sm font-bold text-spotify-gray transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="hidden text-sm font-bold text-spotify-gray transition-colors hover:text-white sm:inline"
          >
            Regístrate
          </Link>
          <Button variant="primary" href="#" className="!px-6 !py-3 text-sm">
            Iniciar sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
