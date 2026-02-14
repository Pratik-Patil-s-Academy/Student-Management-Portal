import { Card, CardContent } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Users,
  UserCheck,
  ClipboardCheck,
  BookOpen,
  BarChart3,
  HelpCircle,
  Monitor,
  MessageSquare,
  Zap,
} from "lucide-react";

const methods = [
  {
    icon: Users,
    title: "Experienced Faculty",
    desc: "Highly qualified teachers with years of competitive exam coaching experience",
  },
  {
    icon: UserCheck,
    title: "Personalized Attention",
    desc: "Small batch sizes ensuring individual attention and doubt clearing",
  },
  {
    icon: ClipboardCheck,
    title: "Weekly Tests",
    desc: "Regular assessments to track progress and improve time management",
  },
  {
    icon: BookOpen,
    title: "Study Material",
    desc: "Comprehensive notes, practice questions, and previous year papers",
  },
  {
    icon: BarChart3,
    title: "Performance Analysis",
    desc: "Detailed test analysis with personalized feedback",
  },
  {
    icon: HelpCircle,
    title: "Doubt Sessions",
    desc: "Dedicated doubt clearing and one-on-one guidance",
  },
  {
    icon: Monitor,
    title: "Online Support",
    desc: "Access to online resources and video lectures anytime",
  },
  {
    icon: MessageSquare,
    title: "Parent Updates",
    desc: "Regular communication about student progress",
  },
  {
    icon: Zap,
    title: "Competitive Environment",
    desc: "Healthy peer competition to motivate students",
  },
];

import { motion } from "framer-motion";

function Methodology() {
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
          Our Teaching Methodology
        </motion.h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card className="relative card-hover border-2 border-gold/30 bg-white/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-visible">
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
                <CardContent className="relative z-30 flex items-start gap-4 p-5">
                  <m.icon className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
                  <div>
                    <h3 className="mb-1 font-semibold text-primary">
                      {m.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{m.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Methodology;
