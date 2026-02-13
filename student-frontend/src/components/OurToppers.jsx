import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { User, Award } from "lucide-react";

// Mock Data
const toppers = [
  { name: "Aarav Patel", score: "99.8%", exam: "JEE Mains", rank: "AIR 152" },
  { name: "Sneha Rao", score: "99.5%", exam: "MHT-CET", rank: "State Rank 12" },
  { name: "Vikram Singh", score: "705/720", exam: "NEET", rank: "AIR 89" },
  {
    name: "Priya Sharma",
    score: "98.2%",
    exam: "HSC Board",
    rank: "College Topper",
  },
  {
    name: "Rahul Deshmukh",
    score: "99.1%",
    exam: "JEE Advanced",
    rank: "AIR 512",
  },
  {
    name: "Anjali Gupta",
    score: "98.9%",
    exam: "MHT-CET",
    rank: "State Rank 45",
  },
];

function OurToppers() {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow mb-12 text-center">
        <motion.h2
          className="text-3xl font-bold text-primary md:text-4xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Our Toppers
        </motion.h2>
        <motion.p
          className="mt-4 text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          Celebrating the excellence of our outstanding students
        </motion.p>
      </div>
      <div className="flex overflow-hidden">
        <motion.div
          className="flex gap-6 px-4"
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 30,
          }}
          style={{ display: "flex", width: "fit-content" }}
        >
          {/* Duplicate list for seamless loop */}
          {[...toppers, ...toppers, ...toppers].map((student, i) => (
            <Card
              key={i}
              className="w-[300px] shrink-0 border-border bg-white/90 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-primary/20 bg-gradient-to-br from-primary/20 to-primary/10">
                  <User className="h-14 w-14 text-primary" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-primary">
                    {student.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-center gap-2 text-sm font-medium text-gold">
                    <Award className="h-4 w-4" />
                    {student.rank}
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-foreground">
                    {student.score}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.exam}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default OurToppers;
