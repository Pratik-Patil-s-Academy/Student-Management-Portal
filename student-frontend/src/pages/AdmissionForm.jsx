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

const admissionSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  address: z.string().max(500).optional(),
  dob: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  caste: z.string().max(100).optional(),
  fatherName: z.string().max(100).optional(),
  fatherOccupation: z.string().max(100).optional(),
  motherName: z.string().max(100).optional(),
  motherOccupation: z.string().max(100).optional(),
  parentMobile: z.string().trim().min(10, "Parent mobile is required").max(15),
  studentMobile: z.string().max(15).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  sscBoard: z.enum(["State Board", "CBSE", "ICSE"]).optional(),
  sscSchoolName: z.string().max(200).optional(),
  sscPercentageOrCGPA: z.coerce.number().min(0).max(100).optional(),
  sscMathsMarks: z.coerce.number().min(0).max(100).optional(),
  hscBoard: z.enum(["State Board", "CBSE", "ICSE"]).optional(),
  hscCollegeName: z.string().max(200).optional(),
  hscPercentageOrCGPA: z.coerce.number().min(0).max(100).optional(),
  hscMathsMarks: z.coerce.number().min(0).max(100).optional(),
  reference: z.string().max(200).optional(),
  admissionDate: z.string().optional(),
  targetExamination: z.string().max(200).optional(),
  rollno: z.coerce.number().optional(),
  photo: z.instanceof(FileList).optional(),
});

function AdmissionForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(admissionSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      if (data.address) formData.append("address", data.address);
      if (data.dob) formData.append("dob", data.dob);
      if (data.gender) formData.append("gender", data.gender);
      if (data.caste) formData.append("caste", data.caste);
      if (data.fatherName) formData.append("fatherName", data.fatherName);
      if (data.fatherOccupation)
        formData.append("fatherOccupation", data.fatherOccupation);
      if (data.motherName) formData.append("motherName", data.motherName);
      if (data.motherOccupation)
        formData.append("motherOccupation", data.motherOccupation);
      formData.append("parentMobile", data.parentMobile);
      if (data.studentMobile)
        formData.append("studentMobile", data.studentMobile);
      if (data.email) formData.append("email", data.email);
      if (data.sscBoard) formData.append("sscBoard", data.sscBoard);
      if (data.sscSchoolName)
        formData.append("sscSchoolName", data.sscSchoolName);
      if (data.sscPercentageOrCGPA !== undefined)
        formData.append(
          "sscPercentageOrCGPA",
          String(data.sscPercentageOrCGPA),
        );
      if (data.sscMathsMarks !== undefined)
        formData.append("sscMathsMarks", String(data.sscMathsMarks));
      if (data.hscBoard) formData.append("hscBoard", data.hscBoard);
      if (data.hscCollegeName)
        formData.append("hscCollegeName", data.hscCollegeName);
      if (data.hscPercentageOrCGPA !== undefined)
        formData.append(
          "hscPercentageOrCGPA",
          String(data.hscPercentageOrCGPA),
        );
      if (data.hscMathsMarks !== undefined)
        formData.append("hscMathsMarks", String(data.hscMathsMarks));
      if (data.reference) formData.append("reference", data.reference);
      if (data.admissionDate)
        formData.append("admissionDate", data.admissionDate);
      if (data.targetExamination)
        formData.append("targetExamination", data.targetExamination);
      if (data.rollno !== undefined)
        formData.append("rollno", String(data.rollno));
      if (data.photo && data.photo.length > 0)
        formData.append("file", data.photo[0]);

      await fetch(`${API_BASE_URL}/api/admissions/create`, {
        method: "POST",
        body: formData,
      });
      toast.success("Admission application submitted successfully!");
      navigate("/");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit admission",
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
              Admission Form
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fill in the details below to apply for admission
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Details */}
              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-semibold text-primary">
                  Personal Details
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
                    <Label>Date of Birth</Label>
                    <Input {...register("dob")} type="date" />
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
                  <div className={fieldClass}>
                    <Label>Caste</Label>
                    <Input {...register("caste")} placeholder="Caste" />
                  </div>
                  <div className={`${fieldClass} sm:col-span-2`}>
                    <Label>Address</Label>
                    <Input
                      {...register("address")}
                      placeholder="Full address"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Photo</Label>
                    <Input
                      {...register("photo")}
                      type="file"
                      accept="image/*"
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
                      placeholder="Student mobile"
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

              {/* HSC */}
              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-semibold text-primary">
                  HSC Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={fieldClass}>
                    <Label>Board</Label>
                    <Select onValueChange={(v) => setValue("hscBoard", v)}>
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
                      {...register("hscCollegeName")}
                      placeholder="College name"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Percentage / CGPA</Label>
                    <Input
                      {...register("hscPercentageOrCGPA")}
                      type="number"
                      step="0.01"
                      placeholder="e.g. 78.0"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Maths Marks</Label>
                    <Input
                      {...register("hscMathsMarks")}
                      type="number"
                      placeholder="e.g. 85"
                    />
                  </div>
                </div>
              </section>

              {/* Admission Info */}
              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-semibold text-primary">
                  Admission Info
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={fieldClass}>
                    <Label>Reference</Label>
                    <Input
                      {...register("reference")}
                      placeholder="How did you hear about us?"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Admission Date</Label>
                    <Input {...register("admissionDate")} type="date" />
                  </div>
                  <div className={fieldClass}>
                    <Label>Target Examination</Label>
                    <Input
                      {...register("targetExamination")}
                      placeholder="e.g. JEE Mains 2026"
                    />
                  </div>
                  <div className={fieldClass}>
                    <Label>Roll No</Label>
                    <Input
                      {...register("rollno")}
                      type="number"
                      placeholder="Roll number (if assigned)"
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
                Submit Admission Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

export default AdmissionForm;
