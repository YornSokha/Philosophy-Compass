interface Props {
  label: string;
  color?: string;
}

export default function Tag({ label, color }: Props) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs border border-[var(--border)]"
      style={
        color
          ? { background: color + "22", color, borderColor: color + "44" }
          : { color: "var(--text-muted)" }
      }
    >
      {label}
    </span>
  );
}
