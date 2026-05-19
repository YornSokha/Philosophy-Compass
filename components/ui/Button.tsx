import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({ variant = "secondary", className = "", children, ...props }: Props) {
  const base = "px-5 py-2.5 rounded-full text-sm transition-all font-sans";
  const variants = {
    primary: "bg-[var(--text)] text-[var(--bg)] hover:opacity-90",
    secondary: "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]",
    ghost: "text-[var(--text-muted)] hover:text-[var(--text)]",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
