import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function Courses() {
  return (
    <section className="section-padding gradient-cream">
      <div className="container-narrow">
        <h2 className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl">
          Comprehensive Exam Preparation
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card
              key={c.title}
              className="card-hover border-border bg-background"
            >
              <CardHeader className="pb-3">
                <c.icon className="mb-2 h-10 w-10 text-gold" />
                <CardTitle className="text-primary">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Courses;
