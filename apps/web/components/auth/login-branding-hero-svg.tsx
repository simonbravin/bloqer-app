'use client'

/**
 * Fondo creativo tipo hero ERP: cuadrícula, barrido que “dibuja” el plano,
 * panel con BLOQER, plano con cotas, flujo con punto en movimiento, tareas y finanzas.
 * Inspirado en referencia; usa colores del tema (primary-foreground, accent).
 * Respetar prefers-reduced-motion vía CSS si hace falta.
 */
export function LoginBrandingHeroSvg() {
  return (
    <svg
      className="absolute inset-0 h-full w-full overflow-hidden opacity-90 dark:opacity-80"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      role="img"
      aria-label="Bloqer hero login"
    >
      <defs>
        <style>{`
          .hero-ink { stroke: currentColor; fill: none; }
          .hero-txt { fill: currentColor; font-family: ui-sans-serif, system-ui, sans-serif; }
          .hero-mono { font-family: ui-monospace, monospace; }
          .hero-thin { stroke-width: 1.2; }
          .hero-med { stroke-width: 2; }
          .hero-muted { opacity: 0.28; }
          .hero-mid { opacity: 0.52; }
          .hero-strong { opacity: 0.88; }
          .hero-small { font-size: 11px; }
          .hero-label { font-size: 13px; }
          .hero-title { font-size: 22px; font-weight: 700; letter-spacing: 0.08em; }
          @media (prefers-reduced-motion: reduce) {
            .hero-motion { animation: none !important; }
            .hero-motion rect[width="380"], .hero-motion circle, .hero-motion text tspan { animation: none !important; }
          }
        `}</style>
        <filter id="hero-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Máscara de barrido: revela el contenido al pasar */}
        <mask id="hero-scan">
          <rect width="1600" height="900" fill="black" />
          <rect x="-400" y="0" width="420" height="900" fill="white" className="hero-motion">
            <animate attributeName="x" values="-400;1700" dur="8s" repeatCount="indefinite" />
          </rect>
        </mask>
      </defs>

      {/* Cuadrícula de fondo */}
      <g className="hero-ink hero-thin hero-muted" stroke="currentColor">
        <path d="M100 0v900M200 0v900M300 0v900M400 0v900M500 0v900M600 0v900M700 0v900M800 0v900M900 0v900M1000 0v900M1100 0v900M1200 0v900M1300 0v900M1400 0v900M1500 0v900" />
        <path d="M0 100h1600M0 200h1600M0 300h1600M0 400h1600M0 500h1600M0 600h1600M0 700h1600M0 800h1600" />
      </g>

      {/* Panel principal */}
      <g transform="translate(80 50)" className="text-primary-foreground">
        <rect x="0" y="0" width="520" height="380" rx="18" className="hero-ink hero-thin hero-strong" stroke="currentColor" fill="none" />
        <text x="24" y="42" className="hero-txt hero-title">BLOQER</text>
        <text x="24" y="68" className="hero-txt hero-mono hero-small hero-muted">ERP CONSTRUCCIÓN • PROYECTOS • OBRA • FINANZAS</text>
        <text x="496" y="42" className="hero-txt hero-mono hero-small hero-muted" textAnchor="end">REV 2.0</text>
        <g className="hero-ink hero-thin hero-mid">
          <path d="M16 16h40M16 16v40" />
          <path d="M504 16h-40M504 16v40" />
          <path d="M16 364h40M16 364v-40" />
          <path d="M504 364h-40M504 364v-40" />
        </g>
      </g>

      {/* Zona plano (con máscara de barrido) */}
      <g mask="url(#hero-scan)" transform="translate(80 100)" className="text-primary-foreground">
        <path d="M20 20H480V360H20z" className="hero-ink hero-thin hero-muted" strokeDasharray="10 8" fill="none" />
        <text x="24" y="12" className="hero-txt hero-mono hero-small hero-muted">PLANO / LAYOUT</text>
        {/* Plano simplificado */}
        <path d="M80 60h200l60 50v200H80z" className="hero-ink hero-med hero-strong" fill="none" stroke="currentColor" />
        <path d="M140 60v200M260 60v200M320 90v170" className="hero-ink hero-thin hero-mid" />
        <path d="M80 130h200M80 220h200" className="hero-ink hero-thin hero-mid" />
        <rect x="340" y="60" width="120" height="90" className="hero-ink hero-thin hero-mid" fill="none" />
        <rect x="340" y="160" width="120" height="90" className="hero-ink hero-thin hero-mid" fill="none" />
        <text x="350" y="82" className="hero-txt hero-mono hero-small hero-muted">DET. A</text>
        <text x="350" y="182" className="hero-txt hero-mono hero-small hero-muted">DET. B</text>
        {/* Cotas */}
        <g className="hero-ink hero-thin hero-muted" strokeDasharray="8 8">
          <path d="M80 28h360" />
          <path d="M80 28v20M440 28v20" />
          <path d="M28 60v260" />
          <path d="M28 60h20M28 320h20" />
        </g>
        <text x="260" y="20" className="hero-txt hero-mono hero-small hero-muted" textAnchor="middle">12,50 m</text>
        <text x="36" y="200" className="hero-txt hero-mono hero-small hero-muted" textAnchor="middle" transform="rotate(-90 36 200)">8,25 m</text>
      </g>

      {/* Flujo con punto en movimiento */}
      <g transform="translate(620 120)" className="text-primary-foreground">
        <path
          id="hero-flow"
          d="M30 50H280c50 0 70 30 70 70v50c0 55 35 75 90 75h120c65 0 95 40 95 95v28"
          className="hero-ink hero-med hero-strong"
          fill="none"
          stroke="currentColor"
          opacity="0.78"
        />
        <circle r="8" fill="currentColor" filter="url(#hero-glow)" opacity="0.9" className="hero-motion">
          <animateMotion dur="5s" repeatCount="indefinite" rotate="auto">
            <mpath href="#hero-flow" />
          </animateMotion>
          <animate attributeName="opacity" values="0.3;0.95;0.3" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <g className="hero-txt hero-mono hero-label hero-strong">
          <text x="30" y="38">PRELIMINARES</text>
          <text x="380" y="168">PLANOS</text>
          <text x="650" y="340">ANTEPROYECTO</text>
          <text x="820" y="480">EJECUCIÓN</text>
        </g>
        <g className="hero-ink hero-thin hero-strong">
          <circle cx="30" cy="50" r="12" fill="none" stroke="currentColor" />
          <text x="30" y="55" className="hero-txt hero-mono hero-small hero-strong" textAnchor="middle">01</text>
          <circle cx="400" cy="190" r="12" fill="none" stroke="currentColor" />
          <text x="400" y="195" className="hero-txt hero-mono hero-small hero-strong" textAnchor="middle">02</text>
          <circle cx="720" cy="360" r="12" fill="none" stroke="currentColor" />
          <text x="720" y="365" className="hero-txt hero-mono hero-small hero-strong" textAnchor="middle">03</text>
        </g>
      </g>

      {/* Bloque TAREAS / OBRA */}
      <g transform="translate(80 500)" className="text-primary-foreground">
        <rect x="0" y="0" width="380" height="180" rx="14" className="hero-ink hero-thin hero-mid" fill="none" stroke="currentColor" />
        <text x="18" y="28" className="hero-txt hero-mono hero-label hero-strong">TAREAS / OBRA</text>
        <g className="hero-txt hero-mono hero-small hero-muted">
          <text x="50" y="58">Permisos municipales</text>
          <text x="50" y="88">Topografía + replanteo</text>
          <text x="50" y="118">Planos estructurales</text>
          <text x="50" y="148">Compra de materiales</text>
        </g>
        <g className="hero-ink hero-med hero-strong" stroke="currentColor" fill="none">
          <path d="M28 50l8 8 16-18" strokeWidth="2.5" opacity="0">
            <animate attributeName="opacity" values="0;1;1" dur="4s" repeatCount="indefinite" />
          </path>
          <path d="M28 80l8 8 16-18" strokeWidth="2.5" opacity="0">
            <animate attributeName="opacity" values="0;0;1;1" dur="4s" repeatCount="indefinite" />
          </path>
          <path d="M28 110l8 8 16-18" strokeWidth="2.5" opacity="0">
            <animate attributeName="opacity" values="0;0;0;1;1" dur="4s" repeatCount="indefinite" />
          </path>
        </g>
        {/* Mini Gantt */}
        <g transform="translate(240 38)">
          <text x="0" y="-6" className="hero-txt hero-mono hero-small hero-muted">GANTT</text>
          <rect x="0" y="0" width="120" height="110" rx="10" className="hero-ink hero-thin hero-muted" fill="none" />
          <path d="M10 24H110M10 52H110M10 80H110" className="hero-ink hero-thin hero-muted" />
          <path d="M42 10V100M74 10V100M106 10V100" className="hero-ink hero-thin hero-muted" />
          <path d="M14 24H14" strokeWidth="2.5" strokeLinecap="round" className="hero-ink hero-strong">
            <animate attributeName="d" values="M14 24H14;M14 24H70;M14 24H100" dur="2.8s" repeatCount="indefinite" />
          </path>
          <path d="M14 52H14" strokeWidth="2.5" strokeLinecap="round" className="hero-ink hero-mid" opacity="0.8">
            <animate attributeName="d" values="M14 52H14;M14 52H52;M14 52H88" dur="2.8s" begin="0.3s" repeatCount="indefinite" />
          </path>
          <path d="M14 80H14" strokeWidth="2.5" strokeLinecap="round" className="hero-ink hero-mid" opacity="0.6">
            <animate attributeName="d" values="M14 80H14;M14 80H62;M14 80H110" dur="2.8s" begin="0.6s" repeatCount="indefinite" />
          </path>
        </g>
      </g>

      {/* Bloque FINANZAS / CAJA */}
      <g transform="translate(480 500)" className="text-primary-foreground">
        <rect x="0" y="0" width="320" height="180" rx="14" className="hero-ink hero-thin hero-mid" fill="none" stroke="currentColor" />
        <text x="18" y="28" className="hero-txt hero-mono hero-label hero-strong">FINANZAS / CAJA</text>
        <g className="hero-txt hero-mono hero-small hero-muted">
          <text x="18" y="62">Cuentas por cobrar</text>
          <text x="18" y="92">Cuentas por pagar</text>
          <text x="18" y="122">Caja disponible</text>
        </g>
        <g className="hero-txt hero-mono hero-label hero-strong" textAnchor="end">
          {/* Cuentas por cobrar: 4 valores que rotan */}
          <text x="302" y="62" opacity="1">
            <animate attributeName="opacity" values="1;0;0;0" dur="5s" repeatCount="indefinite" />$ 12.450
          </text>
          <text x="302" y="62" opacity="0">
            <animate attributeName="opacity" values="0;1;0;0" dur="5s" repeatCount="indefinite" />$ 18.920
          </text>
          <text x="302" y="62" opacity="0">
            <animate attributeName="opacity" values="0;0;1;0" dur="5s" repeatCount="indefinite" />$ 24.100
          </text>
          <text x="302" y="62" opacity="0">
            <animate attributeName="opacity" values="0;0;0;1" dur="5s" repeatCount="indefinite" />$ 31.770
          </text>
          {/* Cuentas por pagar */}
          <text x="302" y="92" opacity="1">
            <animate attributeName="opacity" values="1;0;0" dur="4s" repeatCount="indefinite" />$ 5.900
          </text>
          <text x="302" y="92" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />$ 8.110
          </text>
          <text x="302" y="92" opacity="0">
            <animate attributeName="opacity" values="0;0;1" dur="4s" repeatCount="indefinite" />$ 10.420
          </text>
          {/* Caja disponible */}
          <text x="302" y="122" opacity="1">
            <animate attributeName="opacity" values="1;0" dur="3.5s" repeatCount="indefinite" />$ 2.300
          </text>
          <text x="302" y="122" opacity="0">
            <animate attributeName="opacity" values="0;1" dur="3.5s" repeatCount="indefinite" />$ 4.850
          </text>
        </g>
      </g>
    </svg>
  )
}
