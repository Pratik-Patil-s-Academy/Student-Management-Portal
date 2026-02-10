import { Card, CardContent } from "@/components/ui/card";
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
        <h2 className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl">
          Our Achievements
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <Card
              key={s.label}
              className="card-hover border-border text-center"
            >
              <CardContent className="flex flex-col items-center gap-2 p-6">
                <s.icon className="h-8 w-8 text-gold" />
                <span className="text-2xl font-extrabold text-primary">
                  {s.value}
                </span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Achievements;
