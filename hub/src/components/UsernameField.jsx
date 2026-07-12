import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { RESERVED_USERNAMES, USERNAME_PATTERN } from '../config.js';

const DEBOUNCE_MS = 400;

/* Live availability check via the is_username_available() RPC — a
   SECURITY DEFINER function, so it can see ALL usernames (including
   ones belonging to is_public=false rows) without needing a public
   read policy that would otherwise leak private rows just to power
   this check. Mirrors the exact rules of the DB constraint so the UI
   never promises something the server will then reject. */
export default function UsernameField({ value, onChange, currentUsername, onStatusChange }) {
  const [status, setStatus] = useState('idle'); // idle | checking | available | taken | invalid
  const [message, setMessage] = useState('');
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const report = (nextStatus, nextMessage) => {
    setStatus(nextStatus);
    setMessage(nextMessage);
    onStatusChange?.(nextStatus);
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);

    const candidate = value.trim().toLowerCase();

    if (!candidate) {
      report('idle', '');
      return;
    }
    if (candidate === currentUsername) {
      report('available', 'This is already your username.');
      return;
    }
    if (!USERNAME_PATTERN.test(candidate)) {
      report('invalid', '3–30 characters: lowercase letters, numbers, underscore only.');
      return;
    }
    if (RESERVED_USERNAMES.includes(candidate)) {
      report('invalid', 'That username is reserved.');
      return;
    }

    report('checking', 'Checking availability…');
    const myRequestId = ++requestIdRef.current;

    debounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase.rpc('is_username_available', { check_username: candidate });
      if (myRequestId !== requestIdRef.current) return; // stale response, a newer keystroke superseded it
      if (error) {
        report('invalid', 'Could not check availability — try again.');
        return;
      }
      report(data ? 'available' : 'taken', data ? 'Available!' : 'That username is taken.');
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, currentUsername]);

  const color =
    status === 'available' ? '#00C4A0' : status === 'taken' || status === 'invalid' ? '#ff6b6b' : '#A8A098';

  return (
    <div className="ol-field">
      <label className="ol-label" htmlFor="username">
        @username
      </label>
      <div className="ol-input-prefix-wrap">
        <span className="ol-input-prefix">@</span>
        <input
          id="username"
          className="ol-input"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          placeholder="yourhandle"
          maxLength={30}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {message && (
        <div className="ol-field-hint" style={{ color }}>
          {message}
        </div>
      )}
    </div>
  );
}
