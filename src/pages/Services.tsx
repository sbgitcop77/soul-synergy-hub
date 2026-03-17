import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";

const services = [
  {
    slug: "clarity-session",
    name: "Clarity Session",
    price: "$50",
    duration: "60 min · Single Session",
    description: "A focused session to gain clarity on your most pressing challenge.",
    features: [
      "One-on-one 60-minute session",
      "Identify key blockers",
      "Actionable next steps",
      "Follow-up summary email",
    ],
  },
  {
    slug: "align-with-goals",
    name: "Align with Goals",
    price: "$200",
    duration: "4 Sessions · 2 Months",
    description: "A structured program to align your actions with your deepest aspirations.",
    popular: true,
    features: [
      "Four 60-minute sessions",
      "Personalized growth plan",
      "Resume & LinkedIn review",
      "Progress monitoring via text",
      "Email support between sessions",
    ],
  },
  {
    slug: "90-day-transformation",
    name: "90-Day Transformation",
    price: "$600",
    duration: "12 Sessions · 3 Months",
    description: "A comprehensive journey of personal and professional transformation.",
    features: [
      "Twelve 60-minute sessions",
      "Deep-dive assessments",
      "Custom transformation roadmap",
      "Unlimited text support",
      "Priority scheduling",
      "Post-program check-in",
    ],
  },
  {
    slug: "pay-as-you-go",
    name: "Pay as You Go",
    price: "$50",
    duration: "Per Session · Flexible",
    description: "Ongoing support at your own pace, whenever you need it.",
    features: [
      "60-minute session",
      "No commitment required",
      "Book when you need it",
      "Session summary provided",
    ],
  },
];

const Services = () => {
  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <SectionReveal>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Coaching Services
            </p>
            <h1 className="text-5xl md:text-6xl text-display mb-6">
              Your growth starts <span className="text-display-italic">here</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Every session is designed to uncover what's holding you back, reconnect you with your potential, and create actionable steps towards the life and career you truly want.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Service Cards */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service, i) => (
              <SectionReveal key={service.name} delay={i * 0.08}>
                <div className={`card-service relative flex flex-col h-full ${service.popular ? "border-accent" : ""}`}>
                  {service.popular && (
                    <span className="absolute top-6 right-6 text-[10px] tracking-[0.2em] uppercase text-accent font-medium">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-2xl font-display font-semibold mb-2">{service.name}</h3>
                  <p className="text-4xl font-display font-light mb-1">{service.price}</p>
                  <p className="text-xs text-muted-foreground tracking-wider mb-4">{service.duration}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <div className="space-y-3 mb-8 flex-1">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check size={14} className="text-accent mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <a href={`/book?service=${service.slug}`} className="btn-primary w-full text-center text-xs">
                    Book Now
                  </a>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Free Consultation CTA */}
      <section className="section-padding bg-primary text-primary-foreground text-center">
        <div className="container-wide max-w-2xl mx-auto">
          <SectionReveal>
            <h2 className="text-4xl md:text-5xl text-display mb-6">
              Not sure where to <span className="text-display-italic">start?</span>
            </h2>
            <p className="text-primary-foreground/70 mb-8">
              Book a free 30-minute consultation. No pressure, no commitment — just a conversation about where you are and where you want to be.
            </p>
            <a href="/book?service=free-consultation" className="inline-block px-8 py-4 bg-accent text-accent-foreground text-sm tracking-[0.15em] uppercase hover:opacity-90 transition-opacity">
              Book Free Consultation
            </a>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
};

export default Services;
