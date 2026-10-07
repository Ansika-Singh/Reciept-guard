/**
 * Footer component — team branding.
 */
export default function Footer() {
  return (
    <footer className="hidden md:block border-t border-border bg-white py-3 text-center">
      <p className="text-xs text-muted">
        Built by <span className="font-semibold text-primary">Team Pixel Pirates</span> for{' '}
        <span className="font-semibold">Cyrus Hack-A-Thon 2026</span>
        {' · '}
        Problem Statement 03
      </p>
    </footer>
  );
}
