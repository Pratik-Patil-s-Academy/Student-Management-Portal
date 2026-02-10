import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, UserPlus, ArrowRight } from "lucide-react";

function CTACards() {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="card-hover border-border">
            <CardHeader>
              <ClipboardList className="mb-2 h-10 w-10 text-gold" />
              <CardTitle className="text-xl text-primary">
                Make an Enquiry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get detailed information about our courses, batch timings, fee
                structure, and admission process
              </p>
              <Button asChild className="gap-2">
                <Link to="/enquiry">
                  Submit Enquiry <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover border-border">
            <CardHeader>
              <UserPlus className="mb-2 h-10 w-10 text-gold" />
              <CardTitle className="text-xl text-primary">
                Apply for Admission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ready to start your preparation? Fill the admission form and
                secure your seat in our upcoming batches
              </p>
              <Button asChild className="gap-2">
                <Link to="/admission">
                  Apply Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default CTACards;
