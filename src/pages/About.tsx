import { Link } from "react-router-dom";
import { Award, Heart, Lightbulb, Shield } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";

const credentials = [
  { icon: Award, title: "ICF-PCC Certified", description: "Professional Certified Coach by the International Coaching Federation" },
  { icon: Shield, title: "Corporate Leadership", description: "Years of experience leading teams in Corporate America" },
  { icon: Heart, title: "Holistic Approach", description: "Integrating mind, emotion, and purpose into every session" },
  { icon: Lightbulb, title: "Results-Driven", description: "Personalized growth plans with measurable outcomes" },
];

const About = () => {
  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-secondary">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <SectionReveal>
            <img
              src="/images/arushi-portrait.png"
              alt="Coach Arushi Bhardwaj"
              className="w-full max-w-md mx-auto lg:mx-0"
            />
          </SectionReveal>
          <SectionReveal delay={0.15}>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              About Me
            </p>
            <h1 className="text-5xl md:text-6xl text-display mb-6">
              Meet Arushi <span className="text-display-italic">Bhardwaj</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-4">
              I provide professional career coaching to help ambitious individuals achieve career growth, transitions, or new opportunities. Whether you're looking for a new job, planning a career change, or starting your own business, I offer actionable guidance to move forward with confidence.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Through my sessions, you'll receive a personalized growth plan, resume review, LinkedIn optimization, and progress monitoring — ensuring accountability and forward momentum.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* My Story */}
      <section className="section-padding">
        <div className="container-wide max-w-3xl mx-auto">
          <SectionReveal>
            <h2 className="text-4xl md:text-5xl text-display text-center mb-12">
              My <span className="text-display-italic">Story</span>
            </h2>
          </SectionReveal>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <SectionReveal>
              <p className="text-lg font-display italic text-foreground">
                Hi, I'm Arushi Bhardwaj — and my journey into coaching began unexpectedly.
              </p>
            </SectionReveal>
            <SectionReveal>
              <p>
                I simply wanted to lead my teams better — and learning this skill felt like a practical career decision. That was my intention when I signed up for my first coaching program during my time in Corporate America.
              </p>
            </SectionReveal>
            <SectionReveal>
              <p>
                I expected techniques, frameworks. Instead, I found transformation. Coaching changed how I thought. How I felt. How I made decisions. How I handled challenges. And ultimately, it fundamentally changed the one thing I never expected — <em>how I saw myself.</em>
              </p>
            </SectionReveal>
            <SectionReveal>
              <p>
                It opened a door to deeper clarity, emotional strength, and purpose. And I realized if this work could shift me so profoundly, it had the power to do the same for others.
              </p>
            </SectionReveal>
            <SectionReveal>
              <p>Today, I help people who feel:</p>
              <ul className="list-none space-y-2 mt-4 ml-4">
                {[
                  "Stuck or directionless",
                  "Overwhelmed by emotions",
                  "Disconnected from themselves",
                  "Held back by self-doubt",
                  "Buried in guilt or self-blame",
                  "Ready for change but unsure where to start",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-6 h-px bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionReveal>
            <SectionReveal>
              <p>
                My work is simple: I create a safe, grounding space for you to explore, understand, and transform what's happening inside you — so you can step into a life that feels aligned, empowered, and true to who you are.
              </p>
            </SectionReveal>
            <SectionReveal>
              <p className="text-lg font-display italic text-foreground">
                Coaching didn't just arrive in my life by chance. It arrived with purpose. And now, that purpose is to support you.
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <SectionReveal>
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Credentials
              </p>
              <h2 className="text-4xl md:text-5xl text-display">
                Why trust <span className="text-display-italic">SoulSynergy?</span>
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((cred, i) => (
              <SectionReveal key={cred.title} delay={i * 0.08}>
                <div className="card-service text-center">
                  <cred.icon className="mx-auto mb-4 text-accent" size={28} strokeWidth={1} />
                  <h3 className="text-lg font-display font-semibold mb-2">{cred.title}</h3>
                  <p className="text-sm text-muted-foreground">{cred.description}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground text-center">
        <div className="container-wide max-w-2xl mx-auto">
          <SectionReveal>
            <h2 className="text-4xl md:text-5xl text-display mb-6">
              Ready to begin your <span className="text-display-italic">journey?</span>
            </h2>
            <p className="text-primary-foreground/70 mb-8">
              Book your first free 30-minute consultation and discover how coaching can transform your path.
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

export default About;
