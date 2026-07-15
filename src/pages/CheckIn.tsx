import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePageMeta } from "@/hooks/use-page-meta";
import { checkInChild, checkOutChild, fetchChildren, ChildStatus } from "@/lib/checkin";

const TOKEN_KEY = "checkinIdToken";

const CheckIn = () => {
  usePageMeta({
    title: "Child Check-In / Check-Out | Aama Daycare",
    description: "Sign in with Google to check your child in or out at Aama Daycare.",
    path: "/checkin",
  });

  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [children, setChildren] = useState<ChildStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioningKey, setActioningKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchChildren(token)
      .then((res) => setChildren(res.children))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        if (err instanceof Error && err.message.toLowerCase().includes("token")) {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogin = (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    sessionStorage.setItem(TOKEN_KEY, credentialResponse.credential);
    setToken(credentialResponse.credential);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setChildren([]);
  };

  const handleAction = async (child: ChildStatus) => {
    if (!token) return;
    setActioningKey(child.childKey);
    try {
      const action = child.status === "checked-in" ? checkOutChild : checkInChild;
      const updated = await action(token, child.childKey);
      setChildren((prev) => prev.map((c) => (c.childKey === updated.childKey ? updated : c)));
      toast.success(`${updated.childName} is now ${updated.status.replace("-", " ")}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setActioningKey(null);
    }
  };

  return (
    <>
      <header>
        <Header />
      </header>
      <main className="pt-24 pb-16">
        <div className="max-w-xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2 text-left">Check In / Check Out</h1>
          <p className="text-muted-foreground mb-8">
            Sign in with the Google account on file to check your child in or out.
          </p>

          {!token ? (
            <GoogleLogin onSuccess={handleLogin} onError={() => toast.error("Google sign-in failed.")} />
          ) : (
            <div className="space-y-4">
              {loading && <p className="text-muted-foreground">Loading your children...</p>}
              {error && <p className="text-red-600">{error}</p>}
              {!loading && !error && children.length === 0 && (
                <p className="text-muted-foreground">
                  No children found for this account. Contact the daycare to be added.
                </p>
              )}
              {children.map((child) => (
                <Card key={child.childKey}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{child.childName}</p>
                      <Badge variant={child.status === "checked-in" ? "default" : "secondary"}>
                        {child.status === "checked-in" ? "Checked in" : "Checked out"}
                      </Badge>
                    </div>
                    <Button
                      disabled={actioningKey === child.childKey}
                      onClick={() => handleAction(child)}
                      variant={child.status === "checked-in" ? "outline" : "default"}
                    >
                      {child.status === "checked-in" ? "Check Out" : "Check In"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button variant="ghost" onClick={handleLogout} className="mt-4">
                Sign out
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default CheckIn;
