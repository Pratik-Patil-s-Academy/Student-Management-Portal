import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
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

const MAX_FILE_SIZE = 1000000; // 1MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

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
  standard: z.enum(["11", "12", "Others"], {
    required_error: "Standard is required",
  }),
  photo: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      `Max file size is 1MB.`,
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
});

function AdmissionForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(admissionSchema),
  });

  const photoFile = watch("photo");
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (photoFile && photoFile.length > 0) {
      const file = photoFile[0];

      // Validate file size immediately
      const MAX_FILE_SIZE = 1000000; // 1MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Max file size is 1MB.");
        // Scroll to photo field
        const photoField = document.querySelector('[data-field="photo"]');
        if (photoField) {
          photoField.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setPhotoPreview(null);
        return;
      }

      // Validate file type
      const ACCEPTED_IMAGE_TYPES = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Only .jpg, .jpeg, .png and .webp formats are supported.");
        const photoField = document.querySelector('[data-field="photo"]');
        if (photoField) {
          photoField.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setPhotoPreview(null);
        return;
      }

      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPhotoPreview(null);
    }
  }, [photoFile]);

  // Auto-scroll to first error field
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];

      // Find element by name attribute or data-field attribute
      const element =
        document.querySelector(`[name="${firstErrorField}"]`) ||
        document.querySelector(`[data-field="${firstErrorField}"]`);

      if (element) {
        // Scroll to the field
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        // Focus after a short delay to ensure scroll completes
        setTimeout(() => {
          if (element.focus) {
            element.focus();
          } else {
            // For Select components, try to focus the trigger button
            const trigger = element.querySelector("button");
            if (trigger) trigger.focus();
          }
        }, 300);
      }
    }
  }, [errors]);

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
      formData.append("standard", data.standard);
      if (data.photo && data.photo.length > 0)
        formData.append("file", data.photo[0]);

      await axios.post(`${API_BASE_URL}/api/admissions/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Admission application submitted successfully!");
      navigate("/");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to submit admission";
      toast.error(errorMessage);
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
                  <div className={fieldClass}>
                    <Label>Standard *</Label>
                    <Select onValueChange={(v) => setValue("standard", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select standard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11">11</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.standard && (
                      <p className="text-xs text-destructive">
                        {errors.standard.message}
                      </p>
                    )}
                  </div>
                  <div className={`${fieldClass} sm:col-span-2`}>
                    <Label>Address</Label>
                    <Input
                      {...register("address")}
                      placeholder="Full address"
                    />
                  </div>
                  <div className={fieldClass} data-field="photo">
                    <Label>Photo (Max 1MB)</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("photo-upload").click()
                        }
                        className="w-full"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" x2="12" y1="3" y2="15" />
                        </svg>
                        Choose Photo
                      </Button>
                      <input
                        id="photo-upload"
                        {...register("photo")}
                        type="file"
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    {errors.photo && (
                      <p className="text-xs text-destructive">
                        {errors.photo.message}
                      </p>
                    )}
                    {photoPreview && (
                      <div className="mt-2">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="h-32 w-32 rounded-md border border-border object-cover"
                        />
                      </div>
                    )}
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
                    <Label>Percentage</Label>
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
                    <Label>Percentage</Label>
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
