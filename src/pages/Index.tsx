import { Link } from "react-router-dom";
import { Star, ArrowRight, Compass, Target, Sparkles, Users } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";

const testimonials = [
  {
    name: "Poonam Agrawal",
    title: "Program Management, IT Industry",
    text: "Working with Arushi ahead of my interview was one of the best decisions I made. She helps you build real confidence. I would wholeheartedly recommend her to anyone looking to level up.",
    rating: 5,
  },
  {
    name: "Sarah M.",
    title: "Marketing Director",
    text: "Arushi's coaching goes beyond tips and tricks — she creates a safe space where transformation happens naturally. My career trajectory completely shifted.",
    rating: 5,
  },
  {
    name: "Ravi K.",
    title: "Startup Founder",
    text: "The clarity I gained in just 4 sessions was remarkable. Arushi helped me see what was holding me back and gave me actionable steps to move forward.",
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
              <Link to="/services" className="btn-primary">
                Book Free Session
              </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <SectionReveal key={t.name} delay={i * 0.1}>
                <div className="card-service">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} className="fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
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
