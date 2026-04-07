import { useState } from "react";
import { Mail, Phone, Youtube, Instagram, Linkedin, Facebook } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";

const socials = [
  { icon: Youtube, href: "https://www.youtube.com/@soulsynergywitharushi", label: "YouTube" },
  { icon: Instagram, href: "https://www.instagram.com/soulsynergycoach/", label: "Instagram" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/arushibhardwaj/", label: "LinkedIn" },
  { icon: Facebook, href: "https://www.facebook.com/share/16cn5dnvCN/", label: "Facebook" },
];

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus("idle");
    try {
      const res = await fetch(`${import.meta.env.VITE_N8N_WEBHOOK_URL}/webhook/wf1-contact-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <SectionReveal>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Contact
            </p>
            <h1 className="text-5xl md:text-6xl text-display mb-6">
              Let's <span className="text-display-italic">connect</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Have a question or ready to start your journey? Reach out — I'd love to hear from you.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Form */}
          <SectionReveal>
            {submitStatus === "success" ? (
              <div className="py-12 space-y-3">
                <p className="text-lg font-display">Thank you for reaching out!</p>
                <p className="text-sm text-muted-foreground">I typically respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>
                {submitStatus === "error" && (
                  <p className="text-xs text-destructive">Something went wrong. Please try again or email us directly.</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full text-center disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </SectionReveal>

          {/* Info */}
          <SectionReveal delay={0.15}>
            <div className="space-y-8">
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  <a href="mailto:connect.sscoach@gmail.com" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                    <Mail size={16} className="text-accent" />
                    connect.sscoach@gmail.com
                  </a>
                  <a href="tel:703-945-5595" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                    <Phone size={16} className="text-accent" />
                    703-945-5595
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Follow Along</h3>
                <div className="flex gap-4">
                  {socials.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center border border-border hover:border-accent hover:text-accent transition-all"
                      aria-label={s.label}>
                      <s.icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
              <div className="pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I typically respond within 24 hours. For urgent matters, please call directly.
                </p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
};

export default Contact;