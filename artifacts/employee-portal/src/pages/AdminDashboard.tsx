import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useListEmployees,
  useAdminLogout,
  useGetAuthSession,
  getListEmployeesQueryKey,
} from "@workspace/api-client-react";
import { buildObjectUrl } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutGrid,
  List,
  LogOut,
  Search,
  Download,
  Users,
  Eye,
  ShieldCheck,
  Loader2,
  X,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from "lucide-react";

/* ================= FIX 1: SESSION HOOK ================= */
const AUTH_QUERY_KEY = ["auth-session"];

type Employee = {
  id: number;
  first_name: string;
  second_name: string;
  third_name: string;
  full_name_id: string;
  phone: string;
  skills: string;
  profile_photo_path: string | null;
  id_front_path: string | null;
  id_back_path: string | null;
  created_at: string;
};

async function deleteEmployee(id: number): Promise<void> {
  const res = await fetch(`/api/employees/${id}`, {
    method: "DELETE",
    credentials: "include", // 🔥 IMPORTANT FIX
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to delete employee");
  }
}

/* ================= MAIN COMPONENT ================= */

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [toDelete, setToDelete] = useState<Employee | null>(null);
  const queryClient = useQueryClient();

  /* ================= FIX 2: SESSION CHECK ================= */
  const sessionQuery = useGetAuthSession({
    query: {
      queryKey: AUTH_QUERY_KEY,
      refetchInterval: 5000, // 🔥 keeps session alive check
    },
  });

  /* ================= FIX 3: PROPER AUTH GUARD ================= */
  useEffect(() => {
    if (sessionQuery.isSuccess && sessionQuery.data?.authenticated === false) {
      setLocation("/admin");
    }
  }, [sessionQuery.data, sessionQuery.isSuccess, setLocation]);

  /* ================= EMPLOYEES ================= */
  const employeesQuery = useListEmployees({
    query: {
      queryKey: getListEmployeesQueryKey(),
      enabled: sessionQuery.data?.authenticated === true,
    },
  });

  const adminLogout = useAdminLogout();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
      setToDelete(null);
      setSelected(null);
    },
  });

  const handleLogout = () => {
    adminLogout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin");
      },
    });
  };

  const handleDeleteRequest = (emp: Employee) => {
    setSelected(null);
    setToDelete(emp);
  };

  /* ================= LOADING ================= */
  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ================= GUARD ================= */
  if (!sessionQuery.data?.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Redirecting to login...
      </div>
    );
  }

  const employees = (employeesQuery.data ?? []) as Employee[];

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.first_name?.toLowerCase().includes(q) ||
      e.second_name?.toLowerCase().includes(q) ||
      e.third_name?.toLowerCase().includes(q) ||
      e.full_name_id?.toLowerCase().includes(q) ||
      e.phone?.includes(q) ||
      e.skills?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Employee Management
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={adminLogout.isPending}
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </header>

      {/* BODY */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* SEARCH */}
        <div className="flex gap-3">
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* EMPLOYEES */}
        {employeesQuery.isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">No employees found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtered.map((emp) => (
              <div
                key={emp.id}
                className="p-4 bg-white border rounded-xl"
              >
                <p className="font-semibold">
                  {emp.first_name} {emp.second_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {emp.phone}
                </p>

                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(emp)}
                  >
                    View
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteRequest(emp)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* DELETE */}
      {toDelete && (
        <Dialog open onOpenChange={() => setToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete employee?</DialogTitle>
            </DialogHeader>

            <div className="flex gap-2 justify-end">
              <Button onClick={() => setToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(toDelete.id)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
