import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const transition = { duration: 0.8, ease: [0.2, 0, 0, 1] as const };

const SectionReveal = ({ children, className = "", delay = 0 }: SectionRevealProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10%" }}
    transition={{ ...transition, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export default SectionReveal;
