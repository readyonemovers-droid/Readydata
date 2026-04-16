import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  useListEmployees,
  useAdminLogout,
  useGetAuthSession,
  getListEmployeesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";

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

function downloadFromUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.click();
}

function ImagePreview({
  path,
  label,
  filename,
}: {
  path: string | null;
  label: string;
  filename: string;
}) {
  const url = buildObjectUrl(path);
  if (!url) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="h-32 bg-muted rounded-xl flex items-center justify-center border border-dashed border-border">
          <span className="text-xs text-muted-foreground">Not uploaded</span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="relative group rounded-xl overflow-hidden border border-border">
        <img src={url} alt={label} className="w-full h-32 object-cover" data-testid={`img-${filename}`} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => window.open(url, "_blank")}
            className="bg-white/90 hover:bg-white text-foreground rounded-lg p-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => downloadFromUrl(url, filename)}
            data-testid={`button-download-${filename}`}
            className="bg-white/90 hover:bg-white text-foreground rounded-lg p-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs gap-1.5 h-7"
        onClick={() => downloadFromUrl(url, filename)}
        data-testid={`button-download-full-${filename}`}
      >
        <Download className="w-3 h-3" /> Download
      </Button>
    </div>
  );
}

function EmployeeModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const fullName = [employee.first_name, employee.second_name, employee.third_name].filter(Boolean).join(" ");
  const photoUrl = buildObjectUrl(employee.profile_photo_path);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {photoUrl ? (
              <img src={photoUrl} alt={fullName} className="w-10 h-10 rounded-full object-cover border-2 border-primary" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            )}
            <span>{fullName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-3 bg-muted/40 rounded-xl p-4">
            {[
              { label: "First Name", value: employee.first_name },
              { label: "Second Name", value: employee.second_name },
              { label: "Third Name", value: employee.third_name },
              { label: "Full Name (ID)", value: employee.full_name_id },
              { label: "Phone", value: employee.phone },
              { label: "Submitted", value: new Date(employee.created_at).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value || "—"}</p>
              </div>
            ))}
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Skills</p>
              <p className="text-sm font-medium text-foreground">{employee.skills || "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <ImagePreview
              path={employee.profile_photo_path}
              label="Profile Photo"
              filename={`${employee.first_name}-profile.jpg`}
            />
            <ImagePreview
              path={employee.id_front_path}
              label="ID Front"
              filename={`${employee.first_name}-id-front.jpg`}
            />
            <ImagePreview
              path={employee.id_back_path}
              label="ID Back"
              filename={`${employee.first_name}-id-back.jpg`}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmployeeCard({ employee, onView }: { employee: Employee; onView: () => void }) {
  const fullName = [employee.first_name, employee.second_name, employee.third_name].filter(Boolean).join(" ");
  const photoUrl = buildObjectUrl(employee.profile_photo_path);

  return (
    <div
      data-testid={`card-employee-${employee.id}`}
      className="bg-white rounded-xl border border-border p-4 space-y-3 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        {photoUrl ? (
          <img src={photoUrl} alt={fullName} className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate" data-testid={`text-name-${employee.id}`}>{fullName}</p>
          <p className="text-sm text-muted-foreground">{employee.phone}</p>
          <p className="text-xs text-muted-foreground truncate">{employee.skills}</p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full gap-1.5 text-xs"
        onClick={onView}
        data-testid={`button-view-${employee.id}`}
      >
        <Eye className="w-3.5 h-3.5" /> View Profile
      </Button>
    </div>
  );
}

function EmployeeRow({ employee, onView }: { employee: Employee; onView: () => void }) {
  const fullName = [employee.first_name, employee.second_name, employee.third_name].filter(Boolean).join(" ");
  const photoUrl = buildObjectUrl(employee.profile_photo_path);

  return (
    <tr
      data-testid={`row-employee-${employee.id}`}
      className="border-b border-border hover:bg-muted/30 transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          {photoUrl ? (
            <img src={photoUrl} alt={fullName} className="w-8 h-8 rounded-lg object-cover border border-border" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
          )}
          <span className="text-sm font-medium" data-testid={`text-name-row-${employee.id}`}>{fullName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{employee.phone}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{employee.skills}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {new Date(employee.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onView} data-testid={`button-view-row-${employee.id}`}>
          <Eye className="w-3.5 h-3.5" /> View
        </Button>
      </td>
    </tr>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selected, setSelected] = useState<Employee | null>(null);
  const queryClient = useQueryClient();

  const sessionQuery = useGetAuthSession({
    query: { queryKey: ["auth-session"] },
  });

  const employeesQuery = useListEmployees({
    query: {
      queryKey: getListEmployeesQueryKey(),
      enabled: sessionQuery.data?.authenticated === true,
    },
  });

  const adminLogout = useAdminLogout();

  useEffect(() => {
    if (sessionQuery.data?.authenticated === false) {
      setLocation("/admin");
    }
  }, [sessionQuery.data, setLocation]);

  const handleLogout = () => {
    adminLogout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin");
      },
    });
  };

  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Employee Management</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={adminLogout.isPending}
            className="gap-1.5 text-xs"
            data-testid="button-logout"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground" data-testid="text-employee-count">
              {employees.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Employees</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search by name, phone, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="button-view-grid"
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="flex-shrink-0"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              data-testid="button-view-table"
              variant={viewMode === "table" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("table")}
              className="flex-shrink-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Employees */}
        {employeesQuery.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-border py-20 text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              {search ? "No employees match your search" : "No employees yet"}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {search ? "Try a different search term" : "Employee submissions will appear here"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((emp) => (
              <EmployeeCard key={emp.id} employee={emp} onView={() => setSelected(emp)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  {["Name", "Phone", "Skills", "Submitted", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <EmployeeRow key={emp.id} employee={emp} onView={() => setSelected(emp)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selected && (
        <EmployeeModal employee={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
