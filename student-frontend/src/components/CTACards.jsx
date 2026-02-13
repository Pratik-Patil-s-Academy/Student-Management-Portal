import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, UserPlus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";

function CTACards() {
  return (
    <section className="bg-transparent px-4 sm:px-6 py-4 md:py-6">
      <div className="container-narrow">
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          {/* Enquiry Card */}
          <motion.div
            whileHover={{
              scale: 1.04,
              boxShadow: "0 20px 40px -20px rgba(184,134,11,0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="relative bg-transparent shadow-2xl rounded-2xl p-3 overflow-visible group border-2 border-gold/30">
              {/* Glassmorphism background */}
              <div className="absolute inset-0 z-10 bg-gradient-to-br from-gold/30 via-white/40 to-gold/10 backdrop-blur-xl transition-all duration-500 rounded-[inherit]" />
              {/* Glowing Effect */}
              <div className="absolute inset-0 z-20">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={80}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
              </div>
              <CardHeader className="relative z-30 flex flex-col items-center gap-1 pb-2">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gold/10 mb-1 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="h-7 w-7 text-gold" />
                </div>
                <CardTitle className="text-2xl font-black text-primary tracking-tight">
                  Make an Enquiry
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-30 space-y-4 text-center">
                <p className="text-sm md:text-base text-primary/70 font-medium">
                  Get detailed information about our courses, batch timings, fee
                  structure, and admission process.
                </p>
                <Button
                  asChild
                  className="gap-2 bg-gold text-white hover:bg-primary shadow-xl px-6 py-4 rounded-xl text-base font-bold"
                >
                  <Link to="/enquiry">
                    Submit Enquiry <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admission Card */}
          <motion.div
            whileHover={{
              scale: 1.04,
              boxShadow: "0 20px 40px -20px rgba(184,134,11,0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="relative bg-transparent shadow-2xl rounded-2xl p-3 overflow-visible group border-2 border-gold/30">
              {/* Glassmorphism background */}
              <div className="absolute inset-0 z-10 bg-gradient-to-br from-gold/30 via-white/40 to-gold/10 backdrop-blur-xl transition-all duration-500 rounded-[inherit]" />
              {/* Glowing Effect */}
              <div className="absolute inset-0 z-20">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={80}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
              </div>
              <CardHeader className="relative z-30 flex flex-col items-center gap-1 pb-2">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gold/10 mb-1 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="h-7 w-7 text-gold" />
                </div>
                <CardTitle className="text-2xl font-black text-primary tracking-tight">
                  Apply for Admission
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-30 space-y-4 text-center">
                <p className="text-sm md:text-base text-primary/70 font-medium">
                  Ready to start your preparation? Fill the admission form and
                  secure your seat in our upcoming batches.
                </p>
                <Button
                  asChild
                  className="gap-2 bg-gold text-white hover:bg-primary shadow-xl px-6 py-4 rounded-xl text-base font-bold"
                >
                  <Link to="/admission">
                    Apply Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CTACards;
