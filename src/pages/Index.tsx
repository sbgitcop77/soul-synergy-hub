import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight, Compass, Target, Sparkles, Users, ChevronLeft, ChevronRight } from "lucide-react";
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

const services = [
  {
    name: "Clarity Session",
    price: "$50",
    duration: "60 min · Single Session",
    description: "A focused session to gain clarity on your most pressing challenge.",
  },
  {
    name: "Align with Goals",
    price: "$200",
    duration: "4 Sessions · 2 Months",
    description: "A structured program to align your actions with your deepest aspirations.",
    popular: true,
  },
  {
    name: "90-Day Transformation",
    price: "$600",
    duration: "12 Sessions · 3 Months",
    description: "A comprehensive journey of personal and professional transformation.",
  },
  {
    name: "Pay as You Go",
    price: "$50",
    duration: "Per Session · Flexible",
    description: "Ongoing support at your own pace, whenever you need it.",
  },
];

const whoIHelp = [
  {
    icon: Compass,
    title: "Navigating Transitions",
    description: "Professionals facing career changes, new roles, or life pivots who need clarity and direction.",
  },
  {
    icon: Target,
    title: "Seeking Alignment",
    description: "High achievers who have the 'what' but are searching for the 'why' behind their success.",
  },
  {
    icon: Users,
    title: "Building Relationships",
    description: "Leaders looking to improve workplace dynamics, resolve conflicts, and lead with empathy.",
  },
];

const Index = () => {
  const [current, setCurrent] = useState(0);
  const isHovered = useRef(false);

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
      <section className="relative h-screen flex items-center" style={{ backgroundColor: '#FAF8F5' }}>
        <div className="container-wide relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-20 h-full">
          <SectionReveal className="flex items-center">
            <div>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
              ICF-PCC Certified Coach
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-display leading-[0.9] mb-8">
              Uncover.<br />
              <span className="text-display-italic">Align.</span><br />
              Achieve.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed mb-10">
              Your potential isn't lost. It's just waiting for alignment. Coaching for leaders ready to discover their deeper purpose.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://calendly.com/connect-sscoach" target="_blank" rel="noopener noreferrer" className="btn-primary">
                Book Free Session
              </a>
              <Link to="/services" className="btn-secondary">
                Explore Services
              </Link>
            </div>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.2} className="hidden lg:flex items-end justify-end h-full pt-20">
            <div className="relative group h-full">
              <img
                src="/images/arushi-about.jpg"
                alt="Coach Arushi Bhardwaj"
                className="h-full w-auto object-contain object-bottom transition-transform duration-700 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.02]"
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Who I Help */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <SectionReveal>
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Who I Help
              </p>
              <h2 className="text-4xl md:text-5xl text-display">
                Where are you on your <span className="text-display-italic">journey?</span>
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whoIHelp.map((item, i) => (
              <SectionReveal key={item.title} delay={i * 0.1}>
                <div className="card-service text-center">
                  <item.icon className="mx-auto mb-6 text-accent" size={32} strokeWidth={1} />
                  <h3 className="text-xl font-display font-semibold mb-4">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <SectionReveal>
            <img
              src="/images/arushi-portrait.png"
              alt="Coach Arushi"
              className="w-full max-w-md mx-auto lg:mx-0"
            />
          </SectionReveal>
          <SectionReveal delay={0.15}>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              About Coach Arushi
            </p>
            <h2 className="text-4xl md:text-5xl text-display mb-6">
              Coaching found me when I least expected it
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              What began as a skill to lead teams in Corporate America revealed something far deeper: a personal and professional growth I never imagined. It shifted the way I think, the way I feel, and the way I show up in the world.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              The journey challenged me, surprised me, and unlocked insights that changed everything.
            </p>
            <Link to="/about" className="btn-secondary inline-flex items-center gap-2">
              Read My Story <ArrowRight size={14} />
            </Link>
          </SectionReveal>
        </div>
      </section>

      {/* Services Preview */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <SectionReveal>
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Coaching Services
              </p>
              <h2 className="text-4xl md:text-5xl text-display">
                Begin your <span className="text-display-italic">transformation</span>
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <SectionReveal key={service.name} delay={i * 0.08}>
                <div className="card-service relative flex flex-col h-full">
                  {service.popular && (
                    <span className="absolute top-4 right-4 text-[10px] tracking-[0.2em] uppercase text-accent font-medium">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-display font-semibold mb-2">{service.name}</h3>
                  <p className="text-3xl font-display font-light mb-1">{service.price}</p>
                  <p className="text-xs text-muted-foreground tracking-wider mb-4">{service.duration}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{service.description}</p>
                  <Link to="/services" className="btn-primary text-xs w-full text-center">
                    Book Now
                  </Link>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container-wide">
          <SectionReveal>
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Testimonials
              </p>
              <h2 className="text-4xl md:text-5xl text-display">
                Words from those who've <span className="text-display-italic">transformed</span>
              </h2>
            </div>
          </SectionReveal>
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
          <SectionReveal className="text-center mt-12">
            <Link to="/testimonials" className="btn-secondary inline-flex items-center gap-2">
              View All Testimonials <ArrowRight size={14} />
            </Link>
          </SectionReveal>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <SectionReveal>
            <Sparkles className="mx-auto mb-6 text-accent" size={28} strokeWidth={1} />
            <h2 className="text-4xl md:text-5xl text-display mb-4">
              Join our mailing list
            </h2>
            <p className="text-primary-foreground/70 mb-8">
              Receive insights on personal growth, coaching tips, and exclusive resources.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-sm focus:outline-none focus:border-accent"
              />
              <button type="submit" className="px-6 py-3 bg-accent text-accent-foreground text-xs tracking-[0.15em] uppercase hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </form>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
};

export default Index;
