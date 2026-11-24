'use client'

import { openCookieSettings } from './CookieConsent'

// Footer link that reopens the cookie consent banner so visitors can review or
// withdraw consent at any time (GDPR best practice).
export default function CookieSettingsButton({ className = 'inline-flex min-h-11 min-w-11 items-center text-xs text-night-faint transition-colors hover:text-night-accent' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={className}
    >
      Cookie Settings
    </button>
  )
}
