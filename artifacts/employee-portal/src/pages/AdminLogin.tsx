import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  window.location.origin;

export default function AdminLogin() {
  const [, setLocation] = useLocation();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phone: phone.trim(),
          password: password.trim(),
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server did not return JSON");
      }

      if (!res.ok) {
        alert(data?.error || "Login failed");
        return;
      }

      if (data?.authenticated) {
        // IMPORTANT: force navigation (reliable in Replit)
        window.location.href = "/admin/dashboard";
        return;
      }

      alert("Invalid login response");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
