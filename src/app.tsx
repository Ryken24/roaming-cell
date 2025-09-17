import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const GOOGLE_APPTS_URL = import.meta.env.VITE_GOOGLE_APPTS_URL || '#'
const HS_PORTAL_ID = import.meta.env.VITE_HS_PORTAL_ID

const PRODUCTS = [
  { sku: 'HX-5G-Pro', name: 'HX‑5G Pro Hotspot', blurb: 'Carrier‑smart 5G hotspot that auto‑optimizes across major networks.', bullets: ['5G Sub‑6 + LTE fallback', 'eSIM + physical SIM', 'Wi‑Fi 6, up to 32 clients'], price: '$499', hero: true, img: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop', specs: { modem: 'Qualcomm X62 class', battery: '10,000 mAh', wifi: '802.11ax (Wi‑Fi 6)', vpn: 'WireGuard built‑in' } },
  { sku: 'HX‑Fleet‑LTE', name: 'HX Fleet LTE Router', blurb: 'Vehicle‑ready LTE router with dual‑SIM failover and GPS telematics.', bullets: ['Dual‑SIM auto failover', '12/24V power', 'External MIMO antennas'], price: '$349', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' },
  { sku: 'HX‑Mini‑WiFi6', name: 'HX Mini Wi‑Fi 6 Hotspot', blurb: 'Pocket‑sized hotspot for travelers and remote workers.', bullets: ['Wi‑Fi 6', 'Unlocked SIM', 'All‑day battery'], price: '$199', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop' },
  { sku: 'HX‑Sensor‑IoT', name: 'HX Sensor Hub (IoT)', blurb: 'Edge‑connected hub for sensors and kiosks with MQTT/HTTPS.', bullets: ['PoE/USB‑C', 'MQTT/HTTPS', 'Remote fleet mgmt'], price: '$229', img: 'https://images.unsplash.com/photo-1491299739456-16f362f1d07b?q=80&w=1200&auto=format&fit=crop' },
]

function Header({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
      <div className="container py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">📶 Hotspot Optimizer</div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#products" className="hover:underline">Products</a>
          <a href="#how-it-works" className="hover:underline">How it works</a>
          <a href="#pricing" className="hover:underline">Pricing</a>
          <a href="#faq" className="hover:underline">FAQ</a>
        </nav>
        <button onClick={onOpen} className="btn btn-primary text-sm">Book a demo</button>
      </div>
    </header>
  )
}

function SchedulingDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="card max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Book time with a connectivity specialist</h3>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-semibold mb-2">Pick a time</h4>
              <div className="aspect-video w-full rounded-xl overflow-hidden border">
                <iframe title="Schedule on Google Calendar" src={GOOGLE_APPTS_URL} className="w-full h-full" />
              </div>
              <p className="text-xs text-slate-500 mt-2">If your org blocks embeds, <a className="underline" href={GOOGLE_APPTS_URL} target="_blank" rel="noreferrer">open booking</a>.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Get a call</h4>
              <HubSpotForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HubSpotForm() {
  const [submitting, setSubmitting] = useState(false)
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setErr('')
    try {
      const form = new FormData(e.currentTarget)
      const payload = Object.fromEntries(form.entries()) as Record<string, string>
      const res = await fetch('/.netlify/functions/hubspot-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setOk(true)
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setSubmitting(false)
    }
  }

  if (ok) return <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">Thanks! A rep will reach out shortly.</div>

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3">
      <div>
        <label className="block text-sm font-medium" htmlFor="name">Name</label>
        <input className="w-full mt-1 rounded-xl border p-2" name="name" id="name" placeholder="Jane Smith" required />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium" htmlFor="email">Work Email</label>
          <input className="w-full mt-1 rounded-xl border p-2" type="email" name="email" id="email" placeholder="jane@company.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="phone">Phone</label>
          <input className="w-full mt-1 rounded-xl border p-2" type="tel" name="phone" id="phone" placeholder="(555) 123‑4567" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="company">Company (optional)</label>
        <input className="w-full mt-1 rounded-xl border p-2" name="company" id="company" placeholder="Acme Co." />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="message">What are you looking to solve?</label>
        <textarea className="w-full mt-1 rounded-xl border p-2" name="message" id="message" rows={4} placeholder="e.g., Failover for our stores, mobile pop‑ups, field workforce connectivity…" />
      </div>
      <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Sending…' : 'Submit & Talk to Sales'}</button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </form>
  )
}

export default function App() {
  const hero = useMemo(() => (PRODUCTS as any[]).find(p => p.hero) ?? PRODUCTS[0], [])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Inject HubSpot tracking script if provided
    if (HS_PORTAL_ID && !document.getElementById('hs-script-loader')) {
      const s = document.createElement('script')
      s.src = `https://js.hs-scripts.com/${HS_PORTAL_ID}.js`
      s.type = 'text/javascript'
      s.async = true
      s.defer = true
      s.id = 'hs-script-loader'
      document.body.appendChild(s)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Header onOpen={() => setOpen(true)} />

      {/* HERO */}
      <section className="container py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h1 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="text-4xl md:text-5xl font-extrabold leading-tight">
            Smarter hotspots that <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">auto‑optimize across carriers</span>
          </motion.h1>
          <p className="mt-4 text-lg text-slate-600">Keep your teams and kiosks online with carrier‑aware hotspots that pick the best network in real time — with built‑in VPN, fleet controls, and simple rollout.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => setOpen(true)}>Talk to a specialist</button>
            <a href="#products" className="btn">Browse devices →</a>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="badge">Carrier‑smart</div>
            <div className="badge">Zero‑trust VPN</div>
            <div className="badge">Fleet controls</div>
            <div className="badge">Edge‑ready</div>
          </div>
        </div>
        <div>
          <div className="card overflow-hidden">
            <img src={hero.img} alt={hero.name} className="h-72 w-full object-cover" />
            <div className="card-body space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{hero.name}</h3>
                  <p className="text-slate-600 text-sm">{hero.blurb}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{hero.price}</div>
                  <div className="text-xs text-slate-500">MSRP</div>
                </div>
              </div>
              <ul className="text-sm list-disc ml-5">
                {Object.entries((hero as any).specs).map(([k, v]) => (
                  <li key={k}><span className="font-medium capitalize">{k}</span>: {String(v)}</li>
                ))}
              </ul>
              <button className="btn btn-primary w-full" onClick={() => setOpen(true)}>Get pricing & availability</button>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Featured devices</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => (
            <div key={p.sku} className="card overflow-hidden">
              <img src={p.img} alt={p.name} className="h-44 w-full object-cover" />
              <div className="card-body space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-sm text-slate-600">{p.blurb}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{p.price}</div>
                    <div className="text-xs text-slate-500">MSRP</div>
                  </div>
                </div>
                <ul className="text-sm list-disc ml-5">
                  {(p.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                <button className="btn btn-primary w-full" onClick={() => setOpen(true)}>Talk to Sales</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">How optimization works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="card"><div className="card-body space-y-2">
            <div className="font-semibold">Network scoring</div>
            <p className="text-slate-600">We continuously score carrier signal, latency, and throughput to choose the best link per device.</p>
          </div></div>
          <div className="card"><div className="card-body space-y-2">
            <div className="font-semibold">Policy‑driven routing</div>
            <p className="text-slate-600">Create policies for locations, data plans, or hours (e.g., “.edu prefer Carrier A, failover to B”).</p>
          </div></div>
          <div className="card"><div className="card-body space-y-2">
            <div className="font-semibold">Fleet telemetry</div>
            <p className="text-slate-600">See usage, health, and alerts. Push remote configs and OTA firmware updates.</p>
          </div></div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Simple pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[{ tier: 'Starter', price: '$0/mo + devices', bullets: ['Self‑serve', 'Email support', 'Up to 10 devices'] },{ tier: 'Business', price: '$8/device/mo', bullets: ['Policy routing', 'VPN included', 'Priority support'] },{ tier: 'Enterprise', price: 'Custom', bullets: ['SAML SSO', 'SLA & TAM', 'API + webhooks'] }].map(plan => (
            <div key={plan.tier} className="card flex flex-col">
              <div className="card-body flex-1 flex flex-col">
                <h3 className="text-xl font-semibold">{plan.tier}</h3>
                <div className="text-3xl font-bold mt-2">{plan.price}</div>
                <ul className="mt-4 space-y-1 text-sm list-disc ml-5">
                  {plan.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                <div className="mt-6">
                  <button className="btn btn-primary w-full" onClick={() => setOpen(true)}>Talk to Sales</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Frequently asked</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="card"><div className="card-body space-y-2">
            <h3 className="font-semibold">Can you ship pre‑provisioned SIMs?</h3>
            <p className="text-slate-600">Yes — bring your own plan or use ours. We support eSIM at scale and pooled data plans.</p>
          </div></div>
          <div className="card"><div className="card-body space-y-2">
            <h3 className="font-semibold">Which carriers do you support?</h3>
            <p className="text-slate-600">We’re carrier‑agnostic across the major US networks, with international roaming available.</p>
          </div></div>
          <div className="card"><div className="card-body space-y-2">
            <h3 className="font-semibold">Do you offer kiosks/IoT management?</h3>
            <p className="text-slate-600">Yes — REST APIs, webhooks, and a fleet console with per‑device policy control.</p>
          </div></div>
          <div className="card"><div className="card-body space-y-2">
            <h3 className="font-semibold">Is there a consumer option?</h3>
            <p className="text-slate-600">We offer the HX Mini for individuals; small businesses typically choose Business tier.</p>
          </div></div>
        </div>
      </section>

      <footer className="border-t">
        <div className="container py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-semibold mb-2">Hotspot Optimizer</div>
            <p className="text-slate-600">Connectivity that just works — for pop‑ups, fleets, and remote teams.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Company</div>
            <ul className="space-y-1 text-slate-600">
              <li><a href="#products" className="hover:underline">Products</a></li>
              <li><a href="#how-it-works" className="hover:underline">How it works</a></li>
              <li><a href="#pricing" className="hover:underline">Pricing</a></li>
              <li><a href="#faq" className="hover:underline">FAQ</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Talk to us</div>
            <button className="btn btn-primary" onClick={() => setOpen(true)}>Book a demo</button>
            <p className="text-xs text-slate-500 mt-3">Prefer email? sales@yourdomain.com</p>
          </div>
        </div>
      </footer>

      {/* Basic Product JSON‑LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: hero.name,
          description: hero.blurb,
          brand: { '@type': 'Brand', name: 'Hotspot Optimizer' },
          offers: { '@type': 'Offer', price: hero.price.replace(/[^0-9.]/g, ''), priceCurrency: 'USD', availability: 'https://schema.org/InStock' }
        }) }}
      />

      <SchedulingDialog open={open} onClose={() => setOpen(false)} />
    </div>
  )
}