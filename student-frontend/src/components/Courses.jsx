import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  Atom,
  Rocket,
  FlaskConical,
  Stethoscope,
  BookOpen,
  GraduationCap,
} from "lucide-react";

const courses = [
  {
    icon: Atom,
    title: "JEE Mains",
    desc: "Complete syllabus coverage with regular mock tests and doubt sessions for Engineering entrance",
  },
  {
    icon: Rocket,
    title: "JEE Advanced",
    desc: "Advanced problem solving techniques and intensive training for IIT aspirants",
  },
  {
    icon: FlaskConical,
    title: "MHT-CET",
    desc: "Maharashtra state exam focused preparation with previous year question analysis",
  },
  {
    icon: Stethoscope,
    title: "NEET",
    desc: "Medical entrance exam preparation with focus on Biology, Physics, and Chemistry",
  },
  {
    icon: BookOpen,
    title: "State Board",
    desc: "11th & 12th Maharashtra Board preparation with concept clarity and exam pattern practice",
  },
  {
    icon: GraduationCap,
    title: "CBSE Board",
    desc: "Central Board preparation with comprehensive study material and regular assessments",
  },
];

import { motion } from "framer-motion";

function Courses() {
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
          Comprehensive Exam Preparation
        </motion.h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <motion.div
              key={c.title}
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
                <CardHeader className="relative z-30 pb-3 flex flex-col items-center">
                  <c.icon className="mb-2 h-10 w-10 text-gold" />
                  <CardTitle className="text-primary">{c.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-30">
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Courses;
