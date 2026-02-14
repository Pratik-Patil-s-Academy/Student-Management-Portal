import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Users,
  Award,
  Target,
  Stethoscope,
  CheckCircle,
  Trophy,
} from "lucide-react";

const stats = [
  { icon: Users, value: "500+", label: "Students Trained" },
  { icon: Award, value: "150+", label: "JEE Qualifiers" },
  { icon: Target, value: "200+", label: "MHT-CET Selections" },
  { icon: Stethoscope, value: "75+", label: "NEET Qualifiers" },
  { icon: CheckCircle, value: "100%", label: "Board Pass Rate" },
  { icon: Trophy, value: "25+", label: "Top 1000 Ranks" },
];

function Achievements() {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow">
        <motion.h2
          className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Our Achievements
        </motion.h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card className="relative card-hover border-2 border-gold/30 text-center bg-white/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-visible">
                {/* Glowing Effect */}
                <div className="absolute inset-0 z-20">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={60}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />
                </div>
                <CardContent className="relative z-30 flex flex-col items-center gap-2 p-6">
                  <s.icon className="h-8 w-8 text-gold" />
                  <span className="text-2xl font-extrabold text-primary">
                    {s.value}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.label}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Achievements;
