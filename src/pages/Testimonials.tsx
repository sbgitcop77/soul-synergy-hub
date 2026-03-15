import { Star } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";

const testimonials = [
  {
    name: "Poonam Agrawal",
    title: "Program Management, IT Industry",
    text: "Working with Arushi ahead of my interview was one of the best decisions I made, and I'm so grateful for her guidance. Arushi is an exceptional Professional Coach who has a real gift for distilling complex ideas into advice you can actually use. What stood out most to me was her emphasis on active listening — truly giving 100% of your attention before responding. I felt calm, focused, and genuinely present throughout the interview. Arushi's coaching goes beyond tips and tricks — she helps you build real confidence.",
    rating: 5,
  },
  {
    name: "Sarah M.",
    title: "Marketing Director",
    text: "Arushi's coaching transformed how I approach challenges. She creates a safe, grounding space where you can truly explore what's holding you back. After our sessions, I felt more aligned with my purpose than ever.",
    rating: 5,
  },
  {
    name: "Ravi K.",
    title: "Startup Founder",
    text: "The clarity I gained in just 4 sessions was remarkable. Arushi helped me see patterns I'd been blind to and gave me actionable steps to move forward with confidence. My business grew 40% in the following quarter.",
    rating: 5,
  },
  {
    name: "Jennifer L.",
    title: "VP of Operations",
    text: "I was skeptical about coaching, but Arushi changed my mind completely. Her approach is warm yet focused, and she held me accountable in a way that felt supportive, not pushy. Highly recommend.",
    rating: 5,
  },
  {
    name: "Michael T.",
    title: "Software Engineer",
    text: "Arushi helped me navigate a difficult career transition. Her empathetic approach and practical strategies gave me the confidence to make the leap. I'm now in a role that truly aligns with my values.",
    rating: 5,
  },
  {
    name: "Priya S.",
    title: "Entrepreneur",
    text: "Working with Arushi was a turning point. She helped me uncover limiting beliefs I didn't even know I had. Her coaching style is deeply intuitive — she asks the right questions at the right time.",
    rating: 4,
  },
];

const Testimonials = () => {
  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <SectionReveal>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Testimonials
            </p>
            <h1 className="text-5xl md:text-6xl text-display mb-6">
              Stories of <span className="text-display-italic">transformation</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Every journey is unique. Here's what clients say about their experience with SoulSynergy coaching.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Grid */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <SectionReveal key={t.name} delay={i * 0.06}>
                <div className="card-service h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={14}
                        className={j < t.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic flex-1">
                    "{t.text}"
                  </p>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Submit Form */}
      <section className="section-padding">
        <div className="container-wide max-w-xl mx-auto">
          <SectionReveal>
            <h2 className="text-3xl md:text-4xl text-display text-center mb-8">
              Share your <span className="text-display-italic">experience</span>
            </h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">First Name *</label>
                  <input type="text" required className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors" />
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Email *</label>
                <input type="email" required className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" className="text-muted-foreground/30 hover:text-accent transition-colors">
                      <Star size={24} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Your Testimonial *</label>
                <textarea required rows={5} className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors resize-none" />
              </div>
              <p className="text-xs text-muted-foreground">
                By submitting, you agree to have your first name, star rating, and testimonial published online after approval.
              </p>
              <button type="submit" className="btn-primary w-full text-center">
                Submit Testimonial
              </button>
            </form>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
