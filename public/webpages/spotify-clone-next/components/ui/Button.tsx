import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  variant?: "primary" | "outline";
  children: ReactNode;
  href?: string;
  className?: string;
};

const base =
  "inline-flex items-center justify-center font-bold transition-transform hover:scale-[1.04]";

const variants = {
  primary:
    "bg-white text-black px-10 py-4 rounded-full",
  outline:
    "border border-gray-500 hover:border-white text-white px-9 py-3.5 rounded-full",
};

export default function Button({
  variant = "primary",
  children,
  href = "#",
  className = "",
}: Props) {
  const classes = `${base} ${variants[variant]} ${className}`;

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
