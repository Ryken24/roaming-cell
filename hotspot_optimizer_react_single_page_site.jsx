import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, PhoneCall, Wifi, Shield, Gauge, Cpu, Battery, SignalHigh, ArrowRight, CheckCircle2, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/**
 * Hotspot Optimizer – Single‑page marketing site
 * -------------------------------------------------------------
 * Purpose: Consumer‑facing website serving B2B + B2C buyers of hotspot and IoT devices
 * Goals: Emphasize scheduling with a sales rep, display products, collect warm leads
 * Integrations: HubSpot (forms + tracking), Google Calendar (appointments)
 *
 * USAGE NOTES
 * 1) Tailwind is assumed. The ChatGPT canvas can preview React+Tailwind+shadcn UI.
 * 2) Replace HUBSPOT_* placeholders below with your portal + form IDs.
 * 3) Replace GOOGLE_APPTS_URL with your Google appointment scheduling page URL.
 *    (Google Calendar → Appointment schedules → Share link)
 * 4) Optionally replace with Calendly or HubSpot Meetings if preferred.
 * 5) To enable HubSpot tracking, include the hubspot script snippet in index.html.
 *
 *    <!-- HubSpot tracking (replace with your portal ID) -->
 *    <script type="text/javascript" id="hs-script-loader" async defer src="https://js.hs-scripts.com/YOUR_PORTAL_ID.js"></script>
 *
 * 6) To embed a HubSpot form, use the create form method below (see HubSpotFormEmbed).
 *    Docs: https://developers.hubspot.com/docs/api/marketing/forms
 * 7) The fallback form POSTs to "/api/hubspot/lead". Implement a tiny serverless handler
 *    that calls HubSpot Forms API using your private app token.
 */

// ---- CONFIG PLACEHOLDERS ---------------------------------------------------
const HUBSPOT = {
  portalId: "YOUR_PORTAL_ID", // e.g., "12345678"
  formId: "YOUR_FORM_ID", // e.g., "abcd-efgh-1234-5678"
};
const GOOGLE_APPTS_URL = "https://calendar.google.com/calendar/appointments/schedules/YOUR_APPOINTMENT_LINK"; // Replace with real link

// Optional: product catalogue stub. Replace with your actual product feed or CMS data.
const PRODUCTS = [
  {
    sku: "HX-5G-Pro",
    name: "HX‑5G Pro Hotspot",
    blurb: "Carrier‑smart 5G hotspot that auto‑optimizes across major networks.",
    bullets: ["5G Sub‑6 + LTE fallback", "eSIM + physical SIM", "Wi‑Fi 6, up to 32 clients"],
    price: "$499",
    hero: true,
    img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop", // placeholder
    specs: {
      modem: "Qualcomm X62 class",
      battery: "10,000 mAh",
      wifi: "802.11ax (Wi‑Fi 6)",
      vpn: "WireGuard built‑in",
    },
  },
  {
    sku: "HX‑Fleet‑LTE",
    name: "HX Fleet LTE Router",
    blurb: "Vehicle‑ready LTE router with dual‑SIM failover and GPS telematics.",
    bullets: ["Dual‑SIM auto failover", "12/24V power", "External MIMO antennas"],
    price: "$349",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
  },
  {
    sku: "HX‑Mini‑WiFi6",
    name: "HX Mini Wi‑Fi 6 Hotspot",
    blurb: "Pocket‑sized hotspot for travelers and remote workers.",
    bullets: ["Wi‑Fi 6", "Unlocked SIM", "All‑day battery"],
    price: "$199",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
  },
  {
    sku: "HX‑Sensor‑IoT",
    name: "HX Sensor Hub (IoT)",
    blurb: "Edge‑connected hub for sensors and kiosks with MQTT/HTTPS.",
    bullets: ["PoE/USB‑C", "MQTT/HTTPS", "Remote fleet mgmt"],
    price: "$229",
    img: "https://images.unsplash.com/photo-1491299739456-16f362f1d07b?q=80&w=1200&auto=format&fit=crop",
  },
];

// ---- HUBSPOT EMBED (optional) ---------------------------------------------
// This component tries to embed a HubSpot form if window.hbspt is present.
// If not present (e.g., local preview), it renders a graceful fallback form.
function HubSpotFormEmbed() {
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    const tryMount = () => {
      if (window.hbspt && !loaded) {
        try {
          window.hbspt.forms.create({
            portalId: HUBSPOT.portalId,
            formId: HUBSPOT.formId,
            target: "#hubspot-form-root",
          });
          setLoaded(true);
        } catch (e) {
          console.warn("HubSpot form create failed, showing fallback.", e);
        }
      }
    };

    // If not present, attempt to inject HubSpot forms script
    if (!window.hbspt && !document.getElementById("hs-form-js")) {
      const s = document.createElement("script");
      s.src = "https://js.hsforms.net/forms/embed/v2.js";
      s.async = true;
      s.defer = true;
      s.id = "hs-form-js";
      s.onload = tryMount;
      document.body.appendChild(s);
    } else {
      tryMount();
    }
  }, [loaded]);

  return (
    <div className="space-y-4">
      <div id="hubspot-form-root" />
      {!loaded && (
        <FallbackLeadForm />
      )}
    </div>
  );
}

function FallbackLeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErr("");
    try {
      const form = new FormData(e.currentTarget);
      const payload = Object.fromEntries(form.entries());
      const res = await fetch("/api/hubspot/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setOk(true);
    } catch (e) {
      setErr(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (ok) {
    return (
      <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
        Thanks! A rep will reach out shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input name="name" id="name" required placeholder="Jane Smith" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="email">Work Email</Label>
          <Input type="email" name="email" id="email" required placeholder="jane@company.com" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input type="tel" name="phone" id="phone" placeholder="(555) 123‑4567" />
        </div>
      </div>
      <div>
        <Label htmlFor="company">Company (optional)</Label>
        <Input name="company" id="company" placeholder="Acme Co." />
      </div>
      <div>
        <Label htmlFor="message">What are you looking to solve?</Label>
        <Textarea name="message" id="message" rows={4} placeholder="e.g., Failover for our stores, mobile pop‑ups, field workforce connectivity…" />
      </div>
      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Sending…" : "Submit & Talk to Sales"}
      </Button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </form>
  );
}

// ---- SCHEDULING DIALOG -----------------------------------------------------
function SchedulingDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Book time with a connectivity specialist</DialogTitle>
          <DialogDescription>
            Pick a time or leave your details — we’ll match you with the right expert.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="calendar">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="calendar"><Calendar className="h-4 w-4 mr-2"/>Pick a time</TabsTrigger>
            <TabsTrigger value="form"><PhoneCall className="h-4 w-4 mr-2"/>Get a call</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="pt-4">
            {/* Google Calendar Appointment Schedule embed via iframe */}
            <div className="aspect-video w-full rounded-xl overflow-hidden border">
              <iframe
                title="Schedule on Google Calendar"
                src={GOOGLE_APPTS_URL}
                className="w-full h-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tip: If your organization blocks Google Calendar embeds, open the booking page in a new tab.
              {" "}
              <a className="underline" href={GOOGLE_APPTS_URL} target="_blank" rel="noreferrer">Open booking</a>
            </p>
          </TabsContent>
          <TabsContent value="form" className="pt-4">
            <HubSpotFormEmbed />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ---- SMALL UI BITS ---------------------------------------------------------
const Feature = ({ icon: Icon, title, children }) => (
  <div className="flex gap-3 items-start">
    <div className="p-2 rounded-xl bg-primary/10">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-muted-foreground text-sm">{children}</p>
    </div>
  </div>
);

const ProductCard = ({ p }) => (
  <Card className={`overflow-hidden ${p.hero ? "ring-2 ring-primary" : ""}`}>
    <div className="h-44 w-full overflow-hidden">
      <img src={p.img} alt={p.name} className="h-full w-full object-cover" />
    </div>
    <CardContent className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{p.name}</h3>
          <p className="text-sm text-muted-foreground">{p.blurb}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">{p.price}</div>
          <div className="text-xs text-muted-foreground">MSRP</div>
        </div>
      </div>
      {p.bullets && (
        <ul className="text-sm space-y-1">
          {p.bullets.map((b, i) => (
            <li key={i} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/>{b}</li>
          ))}
        </ul>
      )}
      <div className="pt-2">
        <SchedulingDialog>
          <Button className="w-full">Talk to Sales <ArrowRight className="h-4 w-4 ml-1"/></Button>
        </SchedulingDialog>
      </div>
    </CardContent>
  </Card>
);

// ---- MAIN PAGE -------------------------------------------------------------
export default function HotspotOptimizerSite() {
  const hero = useMemo(() => PRODUCTS.find(p => p.hero) ?? PRODUCTS[0], []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="h-6 w-6"/>
            <span className="font-bold">Hotspot Optimizer</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#products" className="hover:underline">Products</a>
            <a href="#how-it-works" className="hover:underline">How it works</a>
            <a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#faq" className="hover:underline">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <SchedulingDialog>
              <Button size="sm"><Calendar className="h-4 w-4 mr-1"/>Book a demo</Button>
            </SchedulingDialog>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h1
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold leading-tight"
          >
            Smarter hotspots that <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">auto‑optimize across carriers</span>
          </motion.h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Keep your teams and kiosks online with carrier‑aware hotspots that pick the best network in real time — with built‑in VPN, fleet controls, and simple rollout.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <SchedulingDialog>
              <Button size="lg">Talk to a specialist</Button>
            </SchedulingDialog>
            <a href="#products" className="inline-flex items-center text-sm font-medium underline">Browse devices <ArrowRight className="h-4 w-4 ml-1"/></a>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Feature icon={SignalHigh} title="Carrier‑smart">Auto selects best signal & throughput</Feature>
            <Feature icon={Shield} title="Secure by default">Zero‑trust + WireGuard VPN</Feature>
            <Feature icon={Gauge} title="Fleet controls">Data caps, alerts, remote config</Feature>
            <Feature icon={Cpu} title="Edge‑ready">APIs, webhooks, and OTA updates</Feature>
          </div>
        </div>
        <div>
          <Card className="overflow-hidden">
            <div className="h-72 w-full overflow-hidden">
              <img src={hero.img} alt={hero.name} className="h-full w-full object-cover"/>
            </div>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{hero.name}</h3>
                  <p className="text-muted-foreground text-sm">{hero.blurb}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{hero.price}</div>
                  <div className="text-xs text-muted-foreground">MSRP</div>
                </div>
              </div>
              <ul className="text-sm space-y-1">
                {Object.entries(hero.specs).map(([k, v]) => (
                  <li key={k} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> <span className="font-medium capitalize">{k}</span>: {v}</li>
                ))}
              </ul>
              <SchedulingDialog>
                <Button className="w-full">Get pricing & availability</Button>
              </SchedulingDialog>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Featured devices</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.sku} p={p} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">How optimization works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card><CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-2 font-semibold"><SignalHigh className="h-5 w-5"/> Network scoring</div>
            <p className="text-sm text-muted-foreground">We continuously score carrier signal, latency, and throughput to choose the best link per device.</p>
          </CardContent></Card>
          <Card><CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-2 font-semibold"><Globe className="h-5 w-5"/> Policy‑driven routing</div>
            <p className="text-sm text-muted-foreground">Create policies for locations, data plans, or hours (e.g., ".edu prefer Carrier A, failover to B").</p>
          </CardContent></Card>
          <Card><CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-2 font-semibold"><Battery className="h-5 w-5"/> Fleet telemetry</div>
            <p className="text-sm text-muted-foreground">See usage, health, and alerts. Push remote configs and OTA firmware updates.
            </p>
          </CardContent></Card>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Simple pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[{
            tier: "Starter",
            price: "$0/mo + devices",
            bullets: ["Self‑serve", "Email support", "Up to 10 devices"],
          },{
            tier: "Business",
            price: "$8/device/mo",
            bullets: ["Policy routing", "VPN included", "Priority support"],
          },{
            tier: "Enterprise",
            price: "Custom",
            bullets: ["SAML SSO", "SLA & TAM", "API + webhooks"],
          }].map(plan => (
            <Card key={plan.tier} className="flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold">{plan.tier}</h3>
                <div className="text-3xl font-bold mt-2">{plan.price}</div>
                <ul className="mt-4 space-y-1 text-sm">
                  {plan.bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/>{b}</li>
                  ))}
                </ul>
                <div className="mt-6">
                  <SchedulingDialog>
                    <Button className="w-full">Talk to Sales</Button>
                  </SchedulingDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Frequently asked</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <Card><CardContent className="p-6 space-y-2">
            <h3 className="font-semibold">Can you ship pre‑provisioned SIMs?</h3>
            <p className="text-muted-foreground">Yes — bring your own plan or use ours. We support eSIM at scale and pooled data plans.</p>
          </CardContent></Card>
          <Card><CardContent className="p-6 space-y-2">
            <h3 className="font-semibold">Which carriers do you support?</h3>
            <p className="text-muted-foreground">We’re carrier‑agnostic across the major US networks, with international roaming available.</p>
          </CardContent></Card>
          <Card><CardContent className="p-6 space-y-2">
            <h3 className="font-semibold">Do you offer kiosks/IoT management?</h3>
            <p className="text-muted-foreground">Yes — REST APIs, webhooks, and a fleet console with per‑device policy control.</p>
          </CardContent></Card>
          <Card><CardContent className="p-6 space-y-2">
            <h3 className="font-semibold">Is there a consumer option?</h3>
            <p className="text-muted-foreground">We offer the HX Mini for individuals; small businesses typically choose Business tier.</p>
          </CardContent></Card>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 font-semibold mb-2"><Wifi className="h-5 w-5"/> Hotspot Optimizer</div>
            <p className="text-muted-foreground">Connectivity that just works — for pop‑ups, fleets, and remote teams.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Company</div>
            <ul className="space-y-1 text-muted-foreground">
              <li><a href="#products" className="hover:underline">Products</a></li>
              <li><a href="#how-it-works" className="hover:underline">How it works</a></li>
              <li><a href="#pricing" className="hover:underline">Pricing</a></li>
              <li><a href="#faq" className="hover:underline">FAQ</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Talk to us</div>
            <SchedulingDialog>
              <Button className="w-full sm:w-auto">Book a demo</Button>
            </SchedulingDialog>
            <p className="text-xs text-muted-foreground mt-3">Prefer email? sales@yourdomain.com</p>
          </div>
        </div>
      </footer>

      {/* SEO microdata (basic) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: hero.name,
        description: hero.blurb,
        brand: {
          "@type": "Brand",
          name: "Hotspot Optimizer"
        },
        offers: {
          "@type": "Offer",
          price: hero.price.replace(/[^0-9.]/g, ""),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock"
        }
      })}} />
    </div>
  );
}
