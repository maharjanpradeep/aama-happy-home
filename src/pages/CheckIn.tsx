import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, Circle, RefreshCw, Phone, MessageCircle, Star } from "lucide-react";
import Header from "@/components/Header";
import DoorSignQrCode from "@/components/DoorSignQrCode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/auth-context";
import { usePageMeta } from "@/hooks/use-page-meta";
import { CONTACT_PHONE, defaultInquirySms } from "@/lib/contact";
import { scrollToSection } from "@/lib/scrollToSection";
import {
  ApiError,
  AdminChildStatus,
  checkInChild,
  checkOutChild,
  fetchAdminStatus,
  fetchChildren,
  ChildStatus,
} from "@/lib/checkin";

const CheckIn = () => {
  usePageMeta({
    title: "My Account | Aama Daycare",
    description: "Sign in with Google. Parents check their child in or out; staff view the admin dashboard.",
    path: "/checkin",
  });

  const { idToken, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [roleReady, setRoleReady] = useState(false);
  const [children, setChildren] = useState<ChildStatus[]>([]);
  const [actioningKey, setActioningKey] = useState<string | null>(null);
  const [childrenError, setChildrenError] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChildren, setAdminChildren] = useState<AdminChildStatus[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const loadAdmin = async (token: string) => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const res = await fetchAdminStatus(token);
      setAdminChildren(res.children);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 403)) {
        setAdminError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setAdminLoading(false);
    }
  };

  const loadAccount = useCallback(
    async (token: string) => {
      setChildrenError(null);

      const childrenDone = fetchChildren(token)
        .then((res) => setChildren(res.children))
        .catch((err) => {
          setChildrenError(err instanceof Error ? err.message : "Something went wrong.");
          if (err instanceof Error && err.message.toLowerCase().includes("token")) {
            logout();
          }
        });

      const adminDone = fetchAdminStatus(token)
        .then((res) => {
          setIsAdmin(true);
          setAdminChildren(res.children);
        })
        .catch(() => setIsAdmin(false));

      await Promise.allSettled([childrenDone, adminDone]);
    },
    [logout]
  );

  useEffect(() => {
    if (!idToken) return;
    setRoleReady(false);
    loadAccount(idToken).then(() => setRoleReady(true));
  }, [idToken, loadAccount]);

  const handleAction = async (child: ChildStatus) => {
    if (!idToken) return;
    setActioningKey(child.childKey);
    try {
      const action = child.status === "checked-in" ? checkOutChild : checkInChild;
      const updated = await action(idToken, child.childKey);
      setChildren((prev) => prev.map((c) => (c.childKey === updated.childKey ? updated : c)));
      toast.success(`${updated.childName} is now ${updated.status.replace("-", " ")}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setActioningKey(null);
    }
  };

  const hasChildren = children.length > 0;
  const defaultTab = hasChildren ? "checkin" : "admin";

  return (
    <>
      <header>
        <Header />
      </header>
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8 text-left">My Account</h1>

          {!idToken ? (
            <p className="text-muted-foreground">
              Use the <span className="font-semibold text-foreground">Login</span> button in the
              header above to sign in.
            </p>
          ) : !roleReady ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-64 rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ) : !hasChildren && !isAdmin ? (
            childrenError ? (
              <div className="space-y-3">
                <p className="text-red-600">
                  We couldn't load your account: {childrenError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => idToken && loadAccount(idToken)}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </Button>
              </div>
            ) : (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 text-center space-y-4">
                  <p className="text-2xl font-black text-slate-900">Enrollment is open!</p>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find a child linked to this account yet — but we'd love to
                    meet your family. Call or text us to schedule a tour and grab a spot
                    before it's gone.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a href={`tel:${CONTACT_PHONE}`}>
                      <Button size="lg" className="gap-2 font-bold">
                        <Phone className="w-4 h-4" />
                        Call Now
                      </Button>
                    </a>
                    <a href={defaultInquirySms}>
                      <Button size="lg" variant="outline" className="gap-2 font-bold">
                        <MessageCircle className="w-4 h-4" />
                        Text Us
                      </Button>
                    </a>
                  </div>
                  <button
                    onClick={() => scrollToSection("/#reviews", location.pathname, navigate)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
                  >
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    See what other parents are saying
                  </button>
                </CardContent>
              </Card>
            )
          ) : (
            <Tabs defaultValue={defaultTab}>
              <TabsList>
                {hasChildren && <TabsTrigger value="checkin">Check In / Out</TabsTrigger>}
                {isAdmin && <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>}
              </TabsList>

              {hasChildren && (
                <TabsContent value="checkin" className="space-y-4">
                  {childrenError && <p className="text-red-600">{childrenError}</p>}
                  {children.map((child) => (
                    <Card key={child.childKey}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {child.status === "checked-in" ? (
                            <CheckCircle2 className="h-8 w-8 text-primary shrink-0" />
                          ) : (
                            <Circle className="h-8 w-8 text-muted-foreground shrink-0" />
                          )}
                          <div>
                            <p className="font-semibold">{child.childName}</p>
                            <Badge variant={child.status === "checked-in" ? "default" : "secondary"}>
                              {child.status === "checked-in" ? "Checked in" : "Checked out"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          disabled={actioningKey === child.childKey}
                          onClick={() => handleAction(child)}
                          variant={child.status === "checked-in" ? "outline" : "default"}
                        >
                          {actioningKey === child.childKey
                            ? "Saving..."
                            : child.status === "checked-in"
                              ? "Check Out"
                              : "Check In"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              )}

              {isAdmin && (
                <TabsContent value="admin">
                  <div className="flex items-center justify-end mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => idToken && loadAdmin(idToken)}
                      disabled={adminLoading}
                      className="gap-1.5"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                  {adminError && <p className="text-red-600 mb-4">{adminError}</p>}
                  {adminLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full rounded-lg" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                  ) : (
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
                        {adminChildren.map((child) => (
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

                  <div className="mt-8">
                    <DoorSignQrCode />
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </main>
    </>
  );
};

export default CheckIn;
