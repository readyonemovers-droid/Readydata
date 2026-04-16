import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateEmployee } from "@workspace/api-client-react";
import { uploadFile } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  User,
  Camera,
  CreditCard,
  Brain,
  ClipboardCheck,
  Upload,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Profile Photo", icon: Camera },
  { id: 3, label: "National ID", icon: CreditCard },
  { id: 4, label: "Details", icon: Brain },
  { id: 5, label: "Submit", icon: ClipboardCheck },
];

const step1Schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  second_name: z.string().min(1, "Second name is required"),
  third_name: z.string().min(1, "Third name is required"),
  phone: z
    .string()
    .regex(/^07\d{8}$/, "Phone must be in format 07XXXXXXXX (10 digits)"),
});

const step4Schema = z.object({
  full_name_id: z.string().min(1, "Full name as on ID is required"),
  skills: z.string().min(1, "Skills are required"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step4Data = z.infer<typeof step4Schema>;

type FormData = {
  first_name: string;
  second_name: string;
  third_name: string;
  phone: string;
  full_name_id: string;
  skills: string;
};

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8 gap-0">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = current > step.id;
        const isActive = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-primary-foreground shadow-md"
                    : isActive
                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-xs mt-1 font-medium hidden sm:block ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 sm:w-12 mx-1 mb-4 transition-all duration-300 ${
                  current > step.id ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FileUploadBox({
  label,
  hint,
  file,
  onFileChange,
  testId,
}: {
  label: string;
  hint: string;
  file: File | null;
  onFileChange: (f: File | null) => void;
  testId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        onClick={() => inputRef.current?.click()}
        data-testid={testId}
        className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 text-center
          ${file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/30"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        {preview ? (
          <div className="space-y-2">
            <img
              src={preview}
              alt="preview"
              className="max-h-40 mx-auto rounded-lg object-cover shadow-sm"
            />
            <p className="text-sm text-primary font-medium">{file?.name}</p>
            <p className="text-xs text-muted-foreground">Click to change</p>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{hint}</p>
            <p className="text-xs text-muted-foreground">
              Click to browse — JPG, PNG supported
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeeRegistration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    second_name: "",
    third_name: "",
    phone: "",
    full_name_id: "",
    skills: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);

  const createEmployee = useCreateEmployee();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      first_name: formData.first_name,
      second_name: formData.second_name,
      third_name: formData.third_name,
      phone: formData.phone,
    },
  });

  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      full_name_id: formData.full_name_id,
      skills: formData.skills,
    },
  });

  const handleStep1 = step1Form.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  });

  const handleStep2 = () => {
    if (!profilePhoto) {
      setPhotoError("Profile photo is required");
      return;
    }
    setPhotoError(null);
    setStep(3);
  };

  const handleStep3 = () => {
    if (!idFront || !idBack) {
      setIdError("Both front and back of ID are required");
      return;
    }
    setIdError(null);
    setStep(4);
  };

  const handleStep4 = step4Form.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(5);
  });

  const [phoneTaken, setPhoneTaken] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setPhoneTaken(false);
    try {
      const [profilePath, frontPath, backPath] = await Promise.all([
        uploadFile(profilePhoto!),
        uploadFile(idFront!),
        uploadFile(idBack!),
      ]);

      await createEmployee.mutateAsync({
        data: {
          first_name: formData.first_name,
          second_name: formData.second_name,
          third_name: formData.third_name,
          full_name_id: formData.full_name_id,
          phone: formData.phone,
          skills: formData.skills,
          profile_photo_path: profilePath,
          id_front_path: frontPath,
          id_back_path: backPath,
        },
      });

      setSuccess(true);
    } catch (err: unknown) {
      const status =
        err instanceof Error && "status" in err
          ? (err as { status: number }).status
          : 0;
      const message =
        err instanceof Error && "data" in err && err.data != null &&
        typeof (err.data as Record<string, unknown>).error === "string"
          ? (err.data as { error: string }).error
          : err instanceof Error
          ? err.message
          : "Submission failed. Please try again.";

      if (status === 409) {
        setPhoneTaken(true);
        setError(message);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Submitted!</h2>
          <p className="text-muted-foreground">
            Your information has been submitted successfully. We'll be in touch soon.
          </p>
          <Button
            data-testid="button-register-again"
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setFormData({
                first_name: "",
                second_name: "",
                third_name: "",
                phone: "",
                full_name_id: "",
                skills: "",
              });
              setProfilePhoto(null);
              setIdFront(null);
              setIdBack(null);
              step1Form.reset();
              step4Form.reset();
            }}
            variant="outline"
            className="w-full"
          >
            Register Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white">
      <div className="bg-white border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Employee Registration</h1>
            <p className="text-xs text-muted-foreground">
              Complete all steps to submit your information
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator current={step} />

        <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your name exactly as you'd like it recorded
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    data-testid="input-first-name"
                    placeholder="First name"
                    {...step1Form.register("first_name")}
                  />
                  {step1Form.formState.errors.first_name && (
                    <p className="text-xs text-destructive">
                      {step1Form.formState.errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="second_name">Second Name</Label>
                  <Input
                    id="second_name"
                    data-testid="input-second-name"
                    placeholder="Second name"
                    {...step1Form.register("second_name")}
                  />
                  {step1Form.formState.errors.second_name && (
                    <p className="text-xs text-destructive">
                      {step1Form.formState.errors.second_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="third_name">Third Name</Label>
                  <Input
                    id="third_name"
                    data-testid="input-third-name"
                    placeholder="Third name"
                    {...step1Form.register("third_name")}
                  />
                  {step1Form.formState.errors.third_name && (
                    <p className="text-xs text-destructive">
                      {step1Form.formState.errors.third_name.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number (WhatsApp)</Label>
                <Input
                  id="phone"
                  data-testid="input-phone"
                  placeholder="07XXXXXXXX"
                  type="tel"
                  {...step1Form.register("phone")}
                />
                {step1Form.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {step1Form.formState.errors.phone.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Must be WhatsApp-capable (format: 07XXXXXXXX)
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <Button data-testid="button-next-step1" type="submit" className="gap-2">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Profile Photo */}
          {step === 2 && (
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">Profile Photo</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a clear half-portrait photo wearing your job uniform
                </p>
              </div>
              <FileUploadBox
                label="Profile Photo"
                hint="Upload a half-portrait photo with face clearly visible"
                file={profilePhoto}
                onFileChange={setProfilePhoto}
                testId="upload-profile-photo"
              />
              {photoError && (
                <p className="text-sm text-destructive">{photoError}</p>
              )}
              <div className="bg-accent/40 border border-accent rounded-lg p-3 text-sm text-accent-foreground space-y-1">
                <p className="font-medium">Requirements:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                  <li>Face must be clearly visible</li>
                  <li>Wearing your job uniform</li>
                  <li>Good lighting, no blur</li>
                </ul>
              </div>
              <div className="flex justify-between pt-2">
                <Button
                  data-testid="button-back-step2"
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  data-testid="button-next-step2"
                  type="button"
                  onClick={handleStep2}
                  className="gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: National ID */}
          {step === 3 && (
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">National ID</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload both sides of your national ID — images must be clear and readable
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUploadBox
                  label="Front Side"
                  hint="ID Front — face side"
                  file={idFront}
                  onFileChange={setIdFront}
                  testId="upload-id-front"
                />
                <FileUploadBox
                  label="Back Side"
                  hint="ID Back — information side"
                  file={idBack}
                  onFileChange={setIdBack}
                  testId="upload-id-back"
                />
              </div>
              {idError && (
                <p className="text-sm text-destructive">{idError}</p>
              )}
              <div className="flex justify-between pt-2">
                <Button
                  data-testid="button-back-step3"
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  data-testid="button-next-step3"
                  type="button"
                  onClick={handleStep3}
                  className="gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {step === 4 && (
            <form onSubmit={handleStep4} className="p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">Additional Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Please make sure your full name matches your ID exactly
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="full_name_id">Full Name (as on ID)</Label>
                <Input
                  id="full_name_id"
                  data-testid="input-full-name"
                  placeholder="Enter full name exactly as it appears on your ID"
                  {...step4Form.register("full_name_id")}
                />
                {step4Form.formState.errors.full_name_id && (
                  <p className="text-xs text-destructive">
                    {step4Form.formState.errors.full_name_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  data-testid="input-skills"
                  placeholder="e.g. Customer service, Microsoft Office, Arabic/English bilingual..."
                  rows={3}
                  {...step4Form.register("skills")}
                />
                {step4Form.formState.errors.skills && (
                  <p className="text-xs text-destructive">
                    {step4Form.formState.errors.skills.message}
                  </p>
                )}
              </div>
              <div className="flex justify-between pt-2">
                <Button
                  data-testid="button-back-step4"
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button data-testid="button-next-step4" type="submit" className="gap-2">
                  Review <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Review & Submit</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Check everything looks correct before submitting
                </p>
              </div>

              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                <div className="px-4 py-3 bg-muted/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Personal Information
                  </p>
                </div>
                <div className="px-4 py-3 grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">First Name</span>
                  <span className="font-medium" data-testid="review-first-name">{formData.first_name}</span>
                  <span className="text-muted-foreground">Second Name</span>
                  <span className="font-medium" data-testid="review-second-name">{formData.second_name}</span>
                  <span className="text-muted-foreground">Third Name</span>
                  <span className="font-medium" data-testid="review-third-name">{formData.third_name}</span>
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium" data-testid="review-phone">{formData.phone}</span>
                  <span className="text-muted-foreground">Full Name (ID)</span>
                  <span className="font-medium" data-testid="review-full-name">{formData.full_name_id}</span>
                  <span className="text-muted-foreground">Skills</span>
                  <span className="font-medium" data-testid="review-skills">{formData.skills}</span>
                </div>

                <div className="px-4 py-3 bg-muted/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Uploaded Files
                  </p>
                </div>
                <div className="px-4 py-3 grid grid-cols-3 gap-3">
                  {[
                    { file: profilePhoto, label: "Profile Photo" },
                    { file: idFront, label: "ID Front" },
                    { file: idBack, label: "ID Back" },
                  ].map(({ file, label }) => (
                    <div key={label} className="text-center space-y-1">
                      {file ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={label}
                          className="w-full h-20 object-cover rounded-lg border border-border"
                        />
                      ) : (
                        <div className="w-full h-20 bg-muted rounded-lg border border-dashed border-border flex items-center justify-center">
                          <span className="text-xs text-destructive">Missing</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive space-y-2">
                  <p className="font-medium">{error}</p>
                  {phoneTaken && (
                    <button
                      type="button"
                      data-testid="button-fix-phone"
                      onClick={() => {
                        setError(null);
                        setPhoneTaken(false);
                        setStep(1);
                      }}
                      className="underline underline-offset-2 text-destructive hover:opacity-80 transition-opacity text-xs font-semibold"
                    >
                      Go back to step 1 and change your phone number →
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button
                  data-testid="button-back-step5"
                  type="button"
                  variant="outline"
                  onClick={() => setStep(4)}
                  disabled={submitting}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  data-testid="button-submit"
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="gap-2 min-w-32"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Submit <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
