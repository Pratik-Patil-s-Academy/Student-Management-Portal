import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const batches = [
  {
    title: "Foundation Batches",
    subtitle: "For 11th Standard",
    items: [
      "Basic concept building",
      "Strong fundamentals",
      "Board exam focus",
    ],
  },
  {
    title: "Target Batches",
    subtitle: "For 12th Standard",
    items: [
      "JEE/NEET preparation",
      "Advanced problem solving",
      "Mock test series",
    ],
  },
  {
    title: "Crash Courses",
    subtitle: "Pre-Exam Preparation",
    items: [
      "Revision of full syllabus",
      "Important topics focus",
      "Exam strategy",
    ],
  },
  {
    title: "Weekend Batches",
    subtitle: "For School Students",
    items: [
      "Flexible timing",
      "School syllabus aligned",
      "Extra practice sessions",
    ],
  },
];

import { motion } from "framer-motion";

function BatchPrograms() {
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
          Special Batch Programs
        </motion.h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {batches.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card className="card-hover border-border bg-white/90 shadow-md hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-primary">
                    {b.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{b.subtitle}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {b.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BatchPrograms;
