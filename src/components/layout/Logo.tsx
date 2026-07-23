export default function Logo({
  text = "Brian",
  className = "text-lg",
}: {
  text?: string;
  className?: string;
}) {
  return (
    <a href="/" className={`font-display font-semibold tracking-tight ${className}`}>
      {text}
      <span className="text-accent">.</span>
    </a>
  );
}
