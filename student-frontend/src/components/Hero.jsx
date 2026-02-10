import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { ArrowRight } from "lucide-react";
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
        <div className="mb-1 flex flex-wrap justify-center gap-2">
          {courseTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-background/80 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Cards Section */}
        <div className="mt-2 flex justify-center">
          <CTACards />
        </div>
      </div>
    </section>
  );
}

export default Hero;
