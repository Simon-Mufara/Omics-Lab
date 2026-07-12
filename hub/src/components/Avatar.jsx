import { useState } from 'react';

const SIZE_PX = { sm: 28, md: 40, lg: 64, xl: 96 };

function initialsFrom(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return '?';
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase();
}

/* Falls back to initials-on-a-colored-circle when there's no
   avatar_url, or if the image fails to load (broken URL, revoked
   GitHub avatar, etc.) rather than showing a broken-image icon. */
export default function Avatar({ src, name, size = 'md', className = '' }) {
  const px = SIZE_PX[size] || SIZE_PX.md;
  const initials = initialsFrom(name);
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span
      className={`ol-avatar ${className}`}
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--ol-accent-dim, #16332d)',
        color: 'var(--ol-accent, #00C4A0)',
        fontWeight: 700,
        fontSize: Math.max(11, px * 0.38),
        flexShrink: 0,
        userSelect: 'none',
      }}
      title={name || undefined}
      aria-label={name ? `${name}'s avatar` : 'avatar'}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          width={px}
          height={px}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
