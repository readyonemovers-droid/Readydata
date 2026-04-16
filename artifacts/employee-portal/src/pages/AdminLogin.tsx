import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const adminLogin = useAdminLogin();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const handleLogin = form.handleSubmit((data) => {
    setErrorMsg(null);
    adminLogin.mutate(
      { data },
      {
        onSuccess: (result) => {
          if (result.authenticated) {
            setLocation("/admin/dashboard");
          } else {
            setErrorMsg("Invalid credentials. Access denied.");
          }
        },
        onError: () => {
          setErrorMsg("Invalid credentials. Access denied.");
        },
      }
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
          <p className="text-muted-foreground text-sm">
            Secure access for administrators only
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-border p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                data-testid="input-admin-phone"
                type="tel"
                placeholder="0798940935"
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="input-admin-password"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter password"
                  {...form.register("password")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-toggle-password"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {errorMsg && (
              <div
                data-testid="error-login"
                className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive"
              >
                {errorMsg}
              </div>
            )}

            <Button
              data-testid="button-admin-login"
              type="submit"
              className="w-full gap-2"
              disabled={adminLogin.isPending}
            >
              {adminLogin.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Sign In
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
