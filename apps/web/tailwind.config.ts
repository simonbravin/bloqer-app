import type { Config } from 'tailwindcss'

/**
 * Tailwind CSS v4 - Design System Config
 *
 * Design tokens are defined in globals.css via @theme (CSS-first).
 * Dark mode: @custom-variant in globals.css for class-based toggle.
 * This config provides content paths (v4 may auto-detect).
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

export default config
