import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

const courseTags = [
  "JEE Mains",
  "JEE Advanced",
  "MHT-CET",
  "NEET",
  "Board Exams",
];

function Hero() {
  return (
    <section className="relative overflow-hidden bg-background h-[100vh]">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Education Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      <div className="container-narrow section-padding relative z-10 text-center">
        <h1 className="mb-4 text-4xl font-extrabold leading-tight text-primary md:text-5xl lg:text-6xl">
          Pratik Patil's Academy
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Premier Coaching Institute for 11th &amp; 12th Science Students
        </p>

        {/* Course tags */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {courseTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-background/80 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2 shadow-lg">
            <Link to="/enquiry">
              Make an Enquiry <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 bg-background/50 backdrop-blur-sm">
            <Link to="/admission">
              Apply for Admission <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
