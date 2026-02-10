import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, UserPlus, ArrowRight } from "lucide-react";

function CTACards() {
  return (
    <section className="section-padding bg-transparent -mt-10 md:-mt-15 px-2 sm:px-4">
      <div className="container-narrow">
        {/* Desktop/Tablet: Cards */}
        <div className="hidden md:grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
          {/* Enquiry Card */}
          <Card className="card-hover border border-gold/40 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-2 mb-4 md:mb-0">
            <CardHeader className="flex flex-col items-center gap-2 pb-2">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-2">
                <ClipboardList className="h-8 w-8 text-gold" />
              </div>
              <CardTitle className="text-2xl font-bold text-gradient">
                Make an Enquiry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-base text-muted-foreground">
                Get detailed information about our courses, batch timings, fee
                structure, and admission process.
              </p>
              <Button
                asChild
                className="gap-2 bg-gold text-white hover:bg-gold/90 shadow-md px-4 py-1.5 rounded-full text-base"
              >
                <Link to="/enquiry">
                  Submit Enquiry <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admission Card */}
          <Card className="card-hover border border-gold/40 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-2 mb-4 md:mb-0">
            <CardHeader className="flex flex-col items-center gap-2 pb-2">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-2">
                <UserPlus className="h-8 w-8 text-gold" />
              </div>
              <CardTitle className="text-2xl font-bold text-gradient">
                Apply for Admission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-base text-muted-foreground">
                Ready to start your preparation? Fill the admission form and
                secure your seat in our upcoming batches.
              </p>
              <Button
                asChild
                className="gap-2 bg-gold text-white hover:bg-gold/90 shadow-md px-4 py-1.5 rounded-full text-base"
              >
                <Link to="/admission">
                  Apply Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        {/* Mobile: Buttons only */}
        <div className="flex flex-col gap-5 md:hidden mt-4 px-1">
          <Button
            asChild
            className="gap-2 bg-gold text-white hover:bg-gold/90 shadow-lg w-full h-12 rounded-2xl text-lg font-bold tracking-wide flex items-center justify-center"
          >
            <Link to="/enquiry">
              <ClipboardList className="h-6 w-6" />
              Submit Enquiry
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            className="gap-2 bg-gold text-white hover:bg-gold/90 shadow-lg w-full h-12 rounded-2xl text-lg font-bold tracking-wide flex items-center justify-center"
          >
            <Link to="/admission">
              <UserPlus className="h-5 w-5" />
              Apply for Admission
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CTACards;
