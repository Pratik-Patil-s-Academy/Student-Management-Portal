import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import API_BASE_URL from "@/config/api";
import { Loader2 } from "lucide-react";

const inquirySchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  address: z.string().max(500).optional(),
  fatherName: z.string().max(100).optional(),
  fatherOccupation: z.string().max(100).optional(),
  motherName: z.string().max(100).optional(),
  motherOccupation: z.string().max(100).optional(),
  parentMobile: z.string().trim().min(10, "Parent mobile is required").max(15),
  studentMobile: z.string().max(15).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  reference: z.string().max(200).optional(),
  interestedStudentNote: z.string().max(1000).optional(),
  sscBoard: z.enum(["State Board", "CBSE", "ICSE"]).optional(),
  sscSchoolName: z.string().max(200).optional(),
  sscPercentageOrCGPA: z.coerce.number().min(0).max(100).optional(),
  sscMathsMarks: z.coerce.number().min(0).max(100).optional(),
  eleventhBoard: z.enum(["State Board", "CBSE", "ICSE"]).optional(),
  eleventhCollegeName: z.string().max(200).optional(),
  eleventhPercentageOrCGPA: z.coerce.number().min(0).max(100).optional(),
  eleventhMathsMarks: z.coerce.number().min(0).max(100).optional(),
  specialRequirement: z.string().max(1000).optional(),
});

function InquiryForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        studentDetails: {
          fullName: data.fullName,
          gender: data.gender,
          address: data.address,
        },
        parents: {
          father: { name: data.fatherName, occupation: data.fatherOccupation },
          mother: { name: data.motherName, occupation: data.motherOccupation },
        },
        contact: {
          parentMobile: data.parentMobile,
          studentMobile: data.studentMobile,
          email: data.email,
        },
        reference: data.reference,
        interestedStudentNote: data.interestedStudentNote,
        academics: {
          ssc: {
            board: data.sscBoard,
            schoolName: data.sscSchoolName,
            percentageOrCGPA: data.sscPercentageOrCGPA,
            mathsMarks: data.sscMathsMarks,
          },
          eleventh: {
            board: data.eleventhBoard,
            collegeName: data.eleventhCollegeName,
            percentageOrCGPA: data.eleventhPercentageOrCGPA,
            mathsMarks: data.eleventhMathsMarks,
          },
        },
        specialRequirement: data.specialRequirement,
      };

      await fetch(`${API_BASE_URL}/api/inquiries/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success("Enquiry submitted successfully!");
      navigate("/");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit enquiry",
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "space-y-1.5";

  return (
    <div className="min-h-screen bg-accent">
      <Navbar />
      <div className="container-narrow section-padding">
        <Card className="mx-auto max-w-3xl border-border bg-background">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary md:text-3xl">
              Enquiry Form
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fill in the details below and we'll get back to you shortly
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Student Details */}
              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-semibold text-primary">
                  Student Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={fieldClass}>
                    <Label>Full Name *</Label>
                    <Input
                      {...register("fullName")}
                      placeholder="Enter full name"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className={fieldClass}>
                    <Label>Gender</Label>
                    <Select onValueChange={(v) => setValue("gender", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={`${fieldClass} sm:col-span-2`}>
                    <Label>Address</Label>
                    <Textarea
                      {...register("address")}
                      placeholder="Enter address"
                      rows={2}
                    />
                  </div>
                </div>
              </section>

              {/* Parent Details */}
              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-semibold text-primary">
                  Parent Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={fieldClass}>
                    <Label>Father's Name</Label>
                    <Input
                      {...register("fatherName")}
                      placeholder="Father's name"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Father's Occupation</Label>
                    <Input
                      {...register("fatherOccupation")}
                      placeholder="Occupation"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Mother's Name</Label>
                    <Input
                      {...register("motherName")}
                      placeholder="Mother's name"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Mother's Occupation</Label>
                    <Input
                      {...register("motherOccupation")}
                      placeholder="Occupation"
                    />
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-semibold text-primary">
                  Contact Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={fieldClass}>
                    <Label>Parent Mobile *</Label>
                    <Input
                      {...register("parentMobile")}
                      placeholder="Parent mobile number"
                    />
                    {errors.parentMobile && (
                      <p className="text-xs text-destructive">
                        {errors.parentMobile.message}
                      </p>
                    )}
                  </div>
                  <div className={fieldClass}>
                    <Label>Student Mobile</Label>
                    <Input
                      {...register("studentMobile")}
                      placeholder="Student mobile number"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Email</Label>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="Email address"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className={fieldClass}>
                    <Label>Reference</Label>
                    <Input
                      {...register("reference")}
                      placeholder="How did you hear about us?"
                    />
                  </div>
                </div>
              </section>

              {/* SSC */}
              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-semibold text-primary">
                  SSC Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={fieldClass}>
                    <Label>Board</Label>
                    <Select onValueChange={(v) => setValue("sscBoard", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="State Board">State Board</SelectItem>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                        <SelectItem value="ICSE">ICSE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={fieldClass}>
                    <Label>School Name</Label>
                    <Input
                      {...register("sscSchoolName")}
                      placeholder="School name"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Percentage / CGPA</Label>
                    <Input
                      {...register("sscPercentageOrCGPA")}
                      type="number"
                      step="0.01"
                      placeholder="e.g. 85.5"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Maths Marks</Label>
                    <Input
                      {...register("sscMathsMarks")}
                      type="number"
                      placeholder="e.g. 90"
                    />
                  </div>
                </div>
              </section>

              {/* 11th */}
              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-semibold text-primary">
                  11th Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={fieldClass}>
                    <Label>Board</Label>
                    <Select onValueChange={(v) => setValue("eleventhBoard", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="State Board">State Board</SelectItem>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                        <SelectItem value="ICSE">ICSE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={fieldClass}>
                    <Label>College Name</Label>
                    <Input
                      {...register("eleventhCollegeName")}
                      placeholder="College name"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Percentage / CGPA</Label>
                    <Input
                      {...register("eleventhPercentageOrCGPA")}
                      type="number"
                      step="0.01"
                      placeholder="e.g. 78.0"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Maths Marks</Label>
                    <Input
                      {...register("eleventhMathsMarks")}
                      type="number"
                      placeholder="e.g. 85"
                    />
                  </div>
                </div>
              </section>

              {/* Special Requirement */}
              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-semibold text-primary">
                  Special Requirement
                </h3>
                <div className="grid gap-4">
                  <div className={fieldClass}>
                    <Label>Special Requirement</Label>
                    <Textarea
                      {...register("specialRequirement")}
                      placeholder="Any special requirement or note"
                      rows={2}
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Interested Student Note</Label>
                    <Textarea
                      {...register("interestedStudentNote")}
                      placeholder="Any note from student"
                      rows={2}
                    />
                  </div>
                </div>
              </section>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Enquiry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

export default InquiryForm;
