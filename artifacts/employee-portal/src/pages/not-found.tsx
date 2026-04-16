import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-orange-50 to-white">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Button onClick={() => setLocation("/")} className="gap-2">
        <Home className="w-4 h-4" /> Go Home
      </Button>
    </div>
  );
}
