import { Card, CardContent } from "@/components/ui/card";
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

function Methodology() {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow">
        <h2 className="mb-12 text-center text-3xl font-bold text-primary md:text-4xl">
          Our Teaching Methodology
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((m) => (
            <Card key={m.title} className="card-hover border-border">
              <CardContent className="flex items-start gap-4 p-5">
                <m.icon className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
                <div>
                  <h3 className="mb-1 font-semibold text-primary">{m.title}</h3>
                  <p className="text-sm text-muted-foreground">{m.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Methodology;
