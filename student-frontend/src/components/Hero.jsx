import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.png";
import CTACards from "./CTACards";

const courseTags = [
  "JEE Mains",
  "JEE Advanced",
  "MHT-CET",
  "NEET",
  "Board Exams",
];

function Hero() {
  return (
    <section className="relative overflow-hidden bg-background min-h-[95vh] flex items-center">
      {/* Clean Parallax Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Education Background"
          className="h-full w-full object-cover will-change-transform"
          style={{ filter: "brightness(0.85)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
      </div>

      <div className="container-narrow relative z-10 flex flex-col items-center justify-center w-full px-4 py-8 md:py-12">
        {/* Simplified Content Container without Background */}
        <div className="relative w-full max-w-4xl px-4 py-2 mb-4 flex flex-col items-center text-center">
          <motion.h1
            className="mb-3 text-4xl font-black leading-tight text-primary drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)] md:text-5xl lg:text-6xl relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Pratik Patil's Academy
          </motion.h1>

          <motion.div
            className="w-20 h-1 bg-gold mb-4 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />

          <motion.p
            className="mx-auto mb-1 max-w-2xl text-lg font-bold text-primary drop-shadow-[0_1px_5px_rgba(255,255,255,0.8)] md:text-xl relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Premier Coaching Institute for 11th &amp; 12th Science Students
          </motion.p>
        </div>

        {/* Course tags with fade-in stagger */}
        <motion.div
          className="mb-6 flex flex-wrap justify-center gap-2 md:gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {courseTags.map((tag) => (
            <motion.span
              key={tag}
              className="rounded-full border border-gold/30 bg-white/90 px-4 py-1.5 text-xs md:text-sm font-bold text-primary shadow-sm hover:border-gold hover:bg-gold hover:text-white transition-all duration-300 cursor-default"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA Cards Section with fade-in */}
        <motion.div
          className="w-full flex justify-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <CTACards />
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
