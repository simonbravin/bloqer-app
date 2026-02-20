'use client'

/**
 * SVG de fondo tipo plano técnico: cuadrícula, cotas, medidas, $, números.
 * Líneas y movimientos fluidos; respeta prefers-reduced-motion.
 */
export function LoginBrandingSvg({ compact = false }: { compact?: boolean }) {
  const cell = compact ? 48 : 32
  return (
    <svg
      className="absolute inset-0 h-full w-full overflow-hidden opacity-[0.28] dark:opacity-[0.22]"
      viewBox="0 0 400 300"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="login-grid"
          width={cell}
          height={cell}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${cell} 0 L 0 0 0 ${cell}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.4"
            className="text-primary-foreground"
          />
        </pattern>
        <linearGradient id="login-accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="login-accent-v" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
        </linearGradient>
        {/* Path para el círculo que va de Preliminar a Finalizado */}
        <path id="login-flow-path" d="M 52 268 L 348 268" fill="none" stroke="none" />
      </defs>

      {/* Cuadrícula estática */}
      <rect width="100%" height="100%" fill="url(#login-grid)" />

      {/* Líneas horizontales animadas */}
      {[20, 35, 50, 65, 80].map((y, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={`${y}%`}
          x2="100%"
          y2={`${y}%`}
          stroke="url(#login-accent)"
          strokeWidth="0.6"
          strokeDasharray="8 12"
          className="login-branding-dash-h"
          style={{ animationDelay: `${i * 1.2}s` }}
        />
      ))}
      {/* Líneas verticales animadas */}
      {[15, 30, 50, 70, 85].map((x, i) => (
        <line
          key={`v-${i}`}
          x1={`${x}%`}
          y1="0"
          x2={`${x}%`}
          y2="100%"
          stroke="url(#login-accent-v)"
          strokeWidth="0.5"
          strokeDasharray="6 10"
          className="login-branding-dash-v"
          style={{ animationDelay: `${i * 1.5}s` }}
        />
      ))}

      {/* Diagonales con movimiento fluido (ease-in-out) */}
      <line
        x1="0"
        y1="0"
        x2="100%"
        y2="100%"
        stroke="hsl(var(--accent))"
        strokeWidth="0.5"
        strokeOpacity="0.6"
        strokeDasharray="12 20"
        className="login-branding-dash-fluid"
        style={{ animationDelay: '0s' }}
      />
      <line
        x1="100%"
        y1="0"
        x2="0"
        y2="100%"
        stroke="hsl(var(--navy-light))"
        strokeWidth="0.4"
        strokeOpacity="0.5"
        strokeDasharray="10 16"
        className="login-branding-dash-fluid"
        style={{ animationDelay: '2s' }}
      />
      <line
        x1="0"
        y1="30%"
        x2="100%"
        y2="70%"
        stroke="url(#login-accent)"
        strokeWidth="0.4"
        strokeOpacity="0.5"
        strokeDasharray="8 14"
        className="login-branding-dash-fluid"
        style={{ animationDelay: '1s' }}
      />
      <line
        x1="0"
        y1="70%"
        x2="100%"
        y2="30%"
        stroke="hsl(var(--navy-light))"
        strokeWidth="0.4"
        strokeOpacity="0.5"
        strokeDasharray="8 14"
        className="login-branding-dash-fluid"
        style={{ animationDelay: '3s' }}
      />

      {/* Líneas extra con pulso de opacidad (fluido) */}
      {[28, 42, 58, 72].map((y, i) => (
        <line
          key={`flow-h-${i}`}
          x1="0"
          y1={`${y}%`}
          x2="100%"
          y2={`${y}%`}
          stroke="hsl(var(--accent))"
          strokeWidth="0.4"
          strokeDasharray="4 8"
          className="login-branding-dash-fluid login-branding-flow-opacity"
          style={{ animationDelay: `${i * 0.8}s` }}
        />
      ))}

      {/* Cotas tipo plano: números, $, escala (tipografía pequeña) */}
      <g fill="hsl(var(--primary-foreground))" stroke="none" style={{ fontSize: compact ? 6 : 8 }}>
        <text x="15%" y="18%" className="login-branding-pulse" style={{ animationDelay: '0s' }}>5.00</text>
        <text x="32%" y="20%" className="login-branding-pulse" style={{ animationDelay: '0.5s' }}>12.50</text>
        <text x="52%" y="16%" className="login-branding-pulse" style={{ animationDelay: '1s' }}>$</text>
        <text x="68%" y="22%" className="login-branding-pulse" style={{ animationDelay: '1.5s' }}>8.00</text>
        <text x="86%" y="18%" className="login-branding-pulse" style={{ animationDelay: '2s' }}>m</text>
        <text x="12%" y="44%" className="login-branding-pulse" style={{ animationDelay: '0.3s' }}>$</text>
        <text x="38%" y="50%" className="login-branding-pulse" style={{ animationDelay: '0.8s' }}>1:100</text>
        <text x="82%" y="46%" className="login-branding-pulse" style={{ animationDelay: '1.2s' }}>15.00</text>
        <text x="22%" y="76%" className="login-branding-pulse" style={{ animationDelay: '0.6s' }}>6.50</text>
        <text x="62%" y="80%" className="login-branding-pulse" style={{ animationDelay: '1.8s' }}>$</text>
        <text x="88%" y="74%" className="login-branding-pulse" style={{ animationDelay: '0.4s' }}>10.20</text>
      </g>

      {/* Cotas con “patas” (estilo plano) */}
      <g stroke="hsl(var(--accent))" strokeWidth="0.5" fill="none" opacity="0.7">
        <line x1="18%" y1="32%" x2="82%" y2="32%" strokeDasharray="4 4" className="login-branding-dash-fluid" style={{ animationDelay: '0.5s' }} />
        <line x1="18%" y1="32%" x2="18%" y2="35%" />
        <line x1="82%" y1="32%" x2="82%" y2="35%" />
      </g>
      <g stroke="hsl(var(--navy-light))" strokeWidth="0.4" fill="none" opacity="0.6">
        <line x1="30%" y1="62%" x2="70%" y2="62%" strokeDasharray="3 5" className="login-branding-dash-fluid" style={{ animationDelay: '1.2s' }} />
        <line x1="30%" y1="62%" x2="30%" y2="65%" />
        <line x1="70%" y1="62%" x2="70%" y2="65%" />
      </g>

      {/* Líneas en movimiento adicionales (más visibles) */}
      {[12, 38, 52, 68, 88].map((y, i) => (
        <line
          key={`move-h-${i}`}
          x1="0"
          y1={`${y}%`}
          x2="100%"
          y2={`${y}%`}
          stroke="hsl(var(--accent))"
          strokeWidth="0.45"
          strokeOpacity="0.5"
          strokeDasharray="6 14"
          className="login-branding-dash-h"
          style={{ animationDelay: `${i * 2}s` }}
        />
      ))}
      {[8, 25, 45, 62, 78, 92].map((x, i) => (
        <line
          key={`move-v-${i}`}
          x1={`${x}%`}
          y1="0"
          x2={`${x}%`}
          y2="100%"
          stroke="hsl(var(--navy-light))"
          strokeWidth="0.4"
          strokeOpacity="0.5"
          strokeDasharray="5 12"
          className="login-branding-dash-v"
          style={{ animationDelay: `${i * 1.8}s` }}
        />
      ))}

      {/* Planilla tipo presupuesto: tabla Partida / $ (izquierda) */}
      <g fill="hsl(var(--primary-foreground))" stroke="hsl(var(--accent))" strokeWidth="0.45" opacity="0.85">
        <rect x="8%" y="40%" width="20%" height="16%" fill="none" strokeOpacity="0.6" className="login-branding-flow-opacity" />
        <line x1="8%" y1="46%" x2="28%" y2="46%" strokeOpacity="0.7" />
        <line x1="18%" y1="40%" x2="18%" y2="56%" strokeOpacity="0.7" />
        <line x1="8%" y1="51%" x2="28%" y2="51%" strokeOpacity="0.5" />
        <line x1="18%" y1="46%" x2="18%" y2="56%" strokeOpacity="0.5" />
        <line x1="8%" y1="56%" x2="28%" y2="56%" strokeOpacity="0.5" />
      </g>
      <g fill="hsl(var(--primary-foreground))" stroke="none" style={{ fontSize: compact ? 5 : 6 }}>
        <text x="9%" y="43.5%" className="login-branding-pulse">Partida</text>
        <text x="19%" y="43.5%" className="login-branding-pulse">$</text>
        <text x="9%" y="48%" className="login-branding-pulse" style={{ animationDelay: '0.3s' }}>1.250</text>
        <text x="19%" y="48%" className="login-branding-pulse" style={{ animationDelay: '0.3s' }}>$ 5.200</text>
        <text x="9%" y="52%" className="login-branding-pulse" style={{ animationDelay: '0.6s' }}>2.100</text>
        <text x="19%" y="52%" className="login-branding-pulse" style={{ animationDelay: '0.6s' }}>$ 8.400</text>
        <text x="9%" y="56%" className="login-branding-pulse" style={{ animationDelay: '0.9s' }}>Total</text>
        <text x="19%" y="56%" className="login-branding-pulse" style={{ animationDelay: '0.9s' }}>$ 13.600</text>
      </g>

      {/* Planilla pequeña Item / Monto (derecha) */}
      <g fill="hsl(var(--primary-foreground))" stroke="hsl(var(--navy-light))" strokeWidth="0.4" opacity="0.75">
        <rect x="70%" y="14%" width="22%" height="12%" fill="none" strokeOpacity="0.6" />
        <line x1="70%" y1="20%" x2="92%" y2="20%" strokeOpacity="0.6" />
        <line x1="80%" y1="14%" x2="80%" y2="26%" strokeOpacity="0.6" />
        <line x1="70%" y1="23%" x2="92%" y2="23%" strokeOpacity="0.5" />
        <line x1="80%" y1="20%" x2="80%" y2="26%" strokeOpacity="0.5" />
        <line x1="70%" y1="26%" x2="92%" y2="26%" strokeOpacity="0.5" />
      </g>
      <g fill="hsl(var(--primary-foreground))" stroke="none" style={{ fontSize: compact ? 5 : 6 }}>
        <text x="71%" y="17.5%" className="login-branding-pulse">Item</text>
        <text x="81%" y="17.5%" className="login-branding-pulse">Monto</text>
        <text x="71%" y="21.5%" className="login-branding-pulse">A</text>
        <text x="81%" y="21.5%" className="login-branding-pulse">$ 2.100</text>
        <text x="71%" y="24.5%" className="login-branding-pulse">B</text>
        <text x="81%" y="24.5%" className="login-branding-pulse">$ 1.850</text>
      </g>

      {/* Cota de medida (estilo plano) */}
      <g stroke="hsl(var(--accent))" strokeWidth="0.4" fill="none" opacity="0.6">
        <line x1="50%" y1="8%" x2="72%" y2="8%" strokeDasharray="3 4" className="login-branding-dash-fluid" />
        <line x1="50%" y1="8%" x2="50%" y2="10%" />
        <line x1="72%" y1="8%" x2="72%" y2="10%" />
      </g>
      <g fill="hsl(var(--primary-foreground))" stroke="none" style={{ fontSize: compact ? 6 : 7 }}>
        <text x="58%" y="6.5%" className="login-branding-pulse">12,50 m</text>
      </g>

      {/* Plano en líneas con medidas (viewBox 400x300) */}
      <g stroke="hsl(var(--accent))" strokeWidth="0.5" fill="none" opacity="0.7" className="text-primary-foreground">
        <rect x="115" y="72" width="170" height="90" className="login-branding-flow-opacity" />
        <line x1="195" y1="72" x2="195" y2="162" strokeOpacity="0.8" />
        <line x1="255" y1="72" x2="255" y2="162" strokeOpacity="0.8" />
        <line x1="115" y1="117" x2="285" y2="117" strokeOpacity="0.8" />
        <line x1="115" y1="147" x2="285" y2="147" strokeOpacity="0.8" />
        {/* Cotas del plano */}
        <g strokeDasharray="4 4" strokeOpacity="0.8">
          <line x1="115" y1="58" x2="285" y2="58" />
          <line x1="115" y1="58" x2="115" y2="66" />
          <line x1="285" y1="58" x2="285" y2="66" />
        </g>
        <g stroke="hsl(var(--navy-light))" strokeOpacity="0.7">
          <line x1="58" y1="72" x2="58" y2="162" strokeDasharray="3 4" />
          <line x1="58" y1="72" x2="66" y2="72" />
          <line x1="58" y1="162" x2="66" y2="162" />
        </g>
        <g fill="hsl(var(--primary-foreground))" stroke="none" style={{ fontSize: 6 }} opacity="0.9">
          <text x="200" y="52" textAnchor="middle" className="login-branding-pulse">12,50 m</text>
          <text x="42" y="120" textAnchor="middle" className="login-branding-pulse" transform="rotate(-90 42 120)">8,00 m</text>
        </g>
      </g>

      {/* Línea de flujo: Preliminar → Finalizado con círculo animado */}
      <g stroke="hsl(var(--accent))" fill="none" opacity="0.75">
        <line x1="52" y1="268" x2="348" y2="268" strokeWidth="0.5" strokeDasharray="6 8" className="login-branding-dash-fluid" />
        <circle r="4" fill="hsl(var(--accent))" stroke="hsl(var(--primary-foreground))" strokeWidth="0.6" className="login-branding-motion">
          <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
            <mpath href="#login-flow-path" />
          </animateMotion>
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
      <g fill="hsl(var(--primary-foreground))" stroke="none" style={{ fontSize: 6 }} opacity="0.9">
        <text x="52" y="282" textAnchor="middle" className="login-branding-pulse">Preliminar</text>
        <text x="348" y="282" textAnchor="middle" className="login-branding-pulse">Finalizado</text>
      </g>
    </svg>
  )
}
