import './app.scss'

const stats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '4.2M+', label: 'Requests / day' },
  { value: '180+', label: 'Countries served' },
  { value: '<40ms', label: 'Global p95 latency' },
]

export function App() {
  return (
    <div class="hero-page">
      <div class="hero-glow" aria-hidden="true" />

      <nav class="nav">
        <div class="nav__brand">
          <span class="nav__mark" />
          Nimbus
        </div>
        <div class="nav__links">
          <a href="#">Product</a>
          <a href="#">Pricing</a>
          <a href="#">Docs</a>
          <a href="#">Company</a>
        </div>
        <a class="nav__cta" href="#">
          Sign in
        </a>
      </nav>

      <header class="hero">
        <div class="hero__badge">
          <span class="dot" />
          Now shipping v2.0 — faster, smarter, global
        </div>

        <h1 class="hero__title">
          Ship products <span class="accent">people love</span>,<br />
          without the busywork
        </h1>

        <p class="hero__subtitle">
          Nimbus gives your team one platform to plan, build, and launch —
          so you spend less time wiring tools together and more time
          shipping.
        </p>

        <div class="hero__actions">
          <a class="btn btn--primary" href="#">
            Start free trial
          </a>
          <a class="btn btn--ghost" href="#">
            Book a demo
          </a>
        </div>
      </header>

      <section class="trust">
        <p class="trust__label">Trusted at global scale</p>
        <div class="trust__grid">
          {stats.map((stat) => (
            <div class="trust__stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
