import { Link } from 'react-router-dom';

// Temporary stand-in for pages that have not been built from the Figma file yet.
export default function ComingSoon() {
  return (
    <div style={{ padding: '120px 24px', textAlign: 'center', background: 'var(--paper)' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: '40px', marginBottom: 12 }}>This page is on its way</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>It is being built from the Noholi design right now.</p>
      <Link to="/" style={{ color: 'var(--oxblood)', fontWeight: 600 }}>← Back to home</Link>
    </div>
  );
}
