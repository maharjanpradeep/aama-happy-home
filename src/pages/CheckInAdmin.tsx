import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePageMeta } from "@/hooks/use-page-meta";
import { AdminChildStatus, fetchAdminStatus } from "@/lib/checkin";

const ADMIN_KEY_STORAGE = "checkinAdminKey";

const CheckInAdmin = () => {
  usePageMeta({
    title: "Check-In Status | Aama Daycare Admin",
    description: "Admin view of current child check-in/check-out status.",
    path: "/checkin-admin",
  });

  const [adminKey, setAdminKey] = useState<string | null>(() =>
    sessionStorage.getItem(ADMIN_KEY_STORAGE)
  );
  const [keyInput, setKeyInput] = useState("");
  const [children, setChildren] = useState<AdminChildStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminStatus(key);
      setChildren(res.children);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      if (err instanceof Error && err.message.toLowerCase().includes("admin key")) {
        sessionStorage.removeItem(ADMIN_KEY_STORAGE);
        setAdminKey(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      load(adminKey);
    }
  }, [adminKey]);

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    sessionStorage.setItem(ADMIN_KEY_STORAGE, keyInput.trim());
    setAdminKey(keyInput.trim());
  };

  const handleLock = () => {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    setAdminKey(null);
    setChildren([]);
  };

  if (!adminKey) {
    return (
      <>
        <header>
          <Header />
        </header>
        <main className="pt-24 pb-16">
          <div className="max-w-sm mx-auto px-6">
            <h1 className="text-2xl font-bold mb-6 text-left">Admin Sign-In</h1>
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminKey">Admin key</Label>
                <Input
                  id="adminKey"
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Unlock
              </Button>
            </form>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header>
        <Header />
      </header>
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-left">Check-In Status</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => load(adminKey)} disabled={loading}>
                Refresh
              </Button>
              <Button variant="ghost" onClick={handleLock}>
                Lock
              </Button>
            </div>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}
          {loading && <p className="text-muted-foreground mb-4">Loading...</p>}

          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Child</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last event</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.map((child) => (
                  <TableRow key={child.childKey}>
                    <TableCell className="font-medium">{child.childName}</TableCell>
                    <TableCell>{child.parentEmail}</TableCell>
                    <TableCell>
                      <Badge variant={child.status === "checked-in" ? "default" : "secondary"}>
                        {child.status === "checked-in" ? "Checked in" : "Checked out"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {child.lastEventAt ? new Date(child.lastEventAt).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </>
  );
};

export default CheckInAdmin;
