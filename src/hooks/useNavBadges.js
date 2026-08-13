/**
 * useNavBadges – returns live badge counts for sidebar nav items.
 *
 * ALL badge bumps come through the 'navBadgeBump' custom DOM event,
 * dispatched from DatabaseContext or StaffLayout socket handlers.
 * This makes the hook universal — no direct socket dependency needed.
 *
 * Badge counts auto-reset when the user navigates to that page.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const STORE_KEY = 'queueless_nav_badges';

const loadBadges = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
};

const saveBadges = (b) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(b)); } catch {}
};

/** Dispatch from any code to bump a badge key: 'appointments' | 'queue' | 'notifications' */
export const dispatchNavBadge = (key) => {
  window.dispatchEvent(new CustomEvent('navBadgeBump', { detail: { key } }));
};

// Route → badge key map
const ROUTE_TO_BADGE = {
  '/business/appointments': 'appointments',
  '/business/queue': 'queue',
  '/customer/appointments': 'appointments',
  '/customer/queue': 'queue',
  '/staff/appointments': 'appointments',
  '/staff/queue': 'queue',
  '/business/notifications': 'notifications',
  '/customer/notifications': 'notifications',
  '/staff/notifications': 'notifications',
};

export const useNavBadges = () => {
  const location = useLocation();
  const [badges, setBadges] = useState(loadBadges);
  const pathRef = useRef(location.pathname);

  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  // Persist whenever badges change
  useEffect(() => {
    saveBadges(badges);
  }, [badges]);

  // Auto-clear badge when user visits that page
  useEffect(() => {
    const key = ROUTE_TO_BADGE[location.pathname];
    if (key) {
      setBadges(prev => {
        if (!prev[key]) return prev;
        const next = { ...prev, [key]: 0 };
        saveBadges(next);
        return next;
      });
    }
  }, [location.pathname]);

  const bump = useCallback((key) => {
    const path = pathRef.current;
    // Don't bump if user is already on that page
    const onPage =
      (key === 'appointments' && path.includes('/appointments')) ||
      (key === 'queue' && (path.includes('/queue'))) ||
      (key === 'notifications' && path.includes('/notifications'));
    if (onPage) return;

    setBadges(prev => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      saveBadges(next);
      return next;
    });
  }, []);

  // Listen to all navBadgeBump DOM events (dispatched by DatabaseContext + StaffLayout)
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.key) bump(e.detail.key);
    };
    window.addEventListener('navBadgeBump', handler);
    return () => window.removeEventListener('navBadgeBump', handler);
  }, [bump]);

  return badges;
};
