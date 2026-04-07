import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";

const testimonials = [
  {
    name: "Poonam Agrawal",
    title: "Program Management, IT Industry",
    text: "Working with Arushi ahead of my interview was one of the best decisions I made, and I'm so grateful for her guidance. Arushi is an exceptional Professional Coach who has a real gift for distilling complex ideas into advice you can actually use. What stood out most to me was her emphasis on active listening — truly giving 100% of your attention before responding, and then answering exactly what is asked. It sounds simple, but having that principle anchored in my mind completely changed how I showed up. I felt calm, focused, and genuinely present throughout the interview. Arushi's coaching goes beyond tips and tricks — she helps you build real confidence. I would wholeheartedly recommend her to anyone looking to level up their interview skills or their professional growth.",
    rating: 5,
  },
  {
    name: "Architect, Construction Industry",
    title: "",
    text: "Arushi has given me great insight on how to gather myself for this next step in my life. I have left our sessions feeling confident in creating a plan for the future and it has encouraged me to take action.",
    rating: 5,
  },
  {
    name: "Manager, Tech Industry",
    title: "",
    text: "Arushi has been extremely helpful with helping me to see more clearly and be able to move forward as needed.",
    rating: 5,
  },
  {
    name: "VP, Tech Startup",
    title: "",
    text: "Arushi is really awesome, she has driven me forward in ways I didn't know I needed, as well as keeping me accountable for my own goals.",
    rating: 5,
  },
  {
    name: "Jr Associate, Digital Marketing",
    title: "",
    text: "I really enjoyed working with Arushi and digging deeper into what I can do to further my career and future!",
    rating: 5,
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const isHovered = useRef(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    setSubmitStatus("idle");
    try {
      const res = await fetch(`${import.meta.env.VITE_N8N_WEBHOOK_URL}/webhook/wf2-testimonial-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, rating, message }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitStatus("success");
      setFirstName("");
      setLastName("");
      setEmail("");
      setRating(0);
      setMessage("");
    } catch {
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered.current) setCurrent((c) => (c + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

      {/* Carousel */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <SectionReveal>
            <div
              className="relative max-w-2xl mx-auto"
              onMouseEnter={() => { isHovered.current = true; }}
              onMouseLeave={() => { isHovered.current = false; }}
            >
              {/* Card */}
              <div className="card-service text-center h-[320px] flex flex-col">
                <div className="flex gap-1 justify-center mb-6 flex-shrink-0">
                  {Array.from({ length: testimonials[current].rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-accent text-accent" />
                  ))}
                </div>
                <div className="overflow-y-auto flex-1 mb-6 pr-1">
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{testimonials[current].text}"
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-sm font-medium">{testimonials[current].name}</p>
                  {testimonials[current].title && (
                    <p className="text-xs text-muted-foreground">{testimonials[current].title}</p>
                  )}
                </div>
              </div>

              {/* Arrows */}
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={28} strokeWidth={1.5} />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight size={28} strokeWidth={1.5} />
              </button>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? "bg-accent w-4" : "bg-muted-foreground/30"}`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Submit Form */}
      <section className="section-padding">
        <div className="container-wide max-w-xl mx-auto">
          <SectionReveal>
            <h2 className="text-3xl md:text-4xl text-display text-center mb-8">
              Share your <span className="text-display-italic">experience</span>
            </h2>
            {submitStatus === "success" ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-lg font-display">Thank you for sharing your experience!</p>
                <p className="text-sm text-muted-foreground">Your testimonial has been submitted and will appear after approval.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-colors"
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          size={24}
                          className={star <= (hoverRating || rating) ? "fill-accent text-accent" : "text-muted-foreground/30"}
                        />
                      </button>
                    ))}
                  </div>
                  {rating === 0 && submitting && (
                    <p className="text-xs text-destructive mt-1">Please select a rating.</p>
                  )}
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Your Testimonial *</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  By submitting, you agree to have your first name, star rating, and testimonial published online after approval.
                </p>
                {submitStatus === "error" && (
                  <p className="text-xs text-destructive">Something went wrong. Please try again or email us directly.</p>
                )}
                <button type="submit" disabled={submitting} className="btn-primary w-full text-center disabled:opacity-50">
                  {submitting ? "Submitting…" : "Submit Testimonial"}
                </button>
              </form>
            )}
          </SectionReveal>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
