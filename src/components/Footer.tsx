import { Link } from "react-router-dom";
import { Youtube, Instagram, Linkedin, Facebook, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src="/images/logo.png" alt="SoulSynergy" className="h-10 w-auto mb-4 brightness-200" />
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              ICF-PCC certified coaching for leaders who have achieved the "what" and are now searching for the "why."
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-primary-foreground/50">Navigate</h4>
            <div className="flex flex-col gap-3">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/services", label: "Services" },
                { to: "/testimonials", label: "Testimonials" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-primary-foreground/50">Contact</h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:connect.sscoach@gmail.com"
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors flex items-center gap-2"
              >
                <Mail size={14} />
                connect.sscoach@gmail.com
              </a>
              <a
                href="tel:703-945-5595"
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors flex items-center gap-2"
              >
                <Phone size={14} />
                703-945-5595
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-primary-foreground/50">Connect</h4>
            <div className="flex gap-4">
              <a href="https://www.youtube.com/@soulsynergywitharushi" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                <Youtube size={20} />
              </a>
              <a href="https://www.instagram.com/soulsynergycoach/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/in/arushibhardwaj/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://www.facebook.com/share/16cn5dnvCN/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-xs text-primary-foreground/40 tracking-wider">
            © {new Date().getFullYear()} SoulSynergy Coaching. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
