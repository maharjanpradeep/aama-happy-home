import { Fragment, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  RefreshCw,
  Phone,
  MessageCircle,
  Star,
  UserPlus,
  Pencil,
  UserMinus,
  NotebookPen,
  StickyNote,
} from "lucide-react";
import Header from "@/components/Header";
import DoorSignQrCode from "@/components/DoorSignQrCode";
import EnrollChildDialog, { ChildFormValues } from "@/components/EnrollChildDialog";
import DailyNoteDialog from "@/components/DailyNoteDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  enrollChild,
  updateChild,
  deactivateChild,
  adminCheckInChild,
  adminCheckOutChild,
  setDailyNote,
} from "@/lib/checkin";

const MAX_NOTE_WORDS = 50;
const DEFAULT_PICKUP_TIME = "17:00";

function countWords(value: string): number {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function nowHHMM(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// dateStr is "YYYY-MM-DD" — parse as local y/m/d components (not via the
// Date constructor directly) so it doesn't shift a day when the client's
// timezone differs from Pacific.
function formatNoteDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { month: "short", day: "numeric" });
}

const PICKUP_TIME_END_MINUTES = 18 * 60; // 6:00 PM

function minutesToHHMM(minutes: number): string {
  const hh = Math.floor(minutes / 60) % 24;
  const mm = minutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// Every 15 minutes from just after the given check-in time through 6:00 PM,
// latest first — the earliest a parent could plausibly be picked up is right
// after dropping off, not some fixed clock time.
function generatePickupTimeOptions(fromHHMM: string): string[] {
  const [h, m] = fromHHMM.split(":").map(Number);
  let startMinutes = h * 60 + m;
  const remainder = startMinutes % 15;
  if (remainder !== 0) startMinutes += 15 - remainder;

  const options: string[] = [];
  for (let minutes = startMinutes; minutes <= PICKUP_TIME_END_MINUTES; minutes += 15) {
    options.push(minutesToHHMM(minutes));
  }
  if (options.length === 0) options.push(minutesToHHMM(startMinutes));
  return options.reverse();
}

type ConfirmTarget =
  | { child: ChildStatus; role: "parent" }
  | { child: AdminChildStatus; role: "admin" };

const CheckIn = () => {
  usePageMeta({
    title: "My Account | Aama Daycare",
    description: "Sign in with Google. Parents check their child in or out; admins view the admin dashboard.",
    path: "/checkin",
  });

  const { idToken, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [roleReady, setRoleReady] = useState(false);
  const [children, setChildren] = useState<ChildStatus[]>([]);
  const [actioningKey, setActioningKey] = useState<string | null>(null);
  const [childrenError, setChildrenError] = useState<string | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const [eventTime, setEventTime] = useState(nowHHMM());
  const [pickupTime, setPickupTime] = useState(DEFAULT_PICKUP_TIME);
  const [confirmNote, setConfirmNote] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChildren, setAdminChildren] = useState<AdminChildStatus[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminActioningKey, setAdminActioningKey] = useState<string | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<AdminChildStatus | null>(null);
  const [deactivatingChild, setDeactivatingChild] = useState<AdminChildStatus | null>(null);
  const [dailyNoteChild, setDailyNoteChild] = useState<AdminChildStatus | null>(null);

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

  useEffect(() => {
    if (confirmTarget) {
      const t = nowHHMM();
      const options = generatePickupTimeOptions(t);
      setEventTime(t);
      setPickupTime(options.includes(DEFAULT_PICKUP_TIME) ? DEFAULT_PICKUP_TIME : options[0]);
      setConfirmNote("");
    }
  }, [confirmTarget?.child.childKey, confirmTarget?.role]);

  interface ActionOptions {
    note: string;
    eventTime: string;
    pickupTime?: string;
  }

  const handleAction = async (child: ChildStatus, options: ActionOptions) => {
    if (!idToken) return;
    setActioningKey(child.childKey);
    try {
      const isCheckingIn = child.status !== "checked-in";
      const action = isCheckingIn ? checkInChild : checkOutChild;
      const updated = await action(idToken, child.childKey, options);
      setChildren((prev) => prev.map((c) => (c.childKey === updated.childKey ? updated : c)));
      toast.success(`${updated.childName} is now ${updated.status.replace("-", " ")}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      throw err;
    } finally {
      setActioningKey(null);
    }
  };

  const handleAdminAction = async (child: AdminChildStatus, options: ActionOptions) => {
    if (!idToken) return;
    setAdminActioningKey(child.childKey);
    try {
      const isCheckingIn = child.status !== "checked-in";
      const action = isCheckingIn ? adminCheckInChild : adminCheckOutChild;
      const updated = await action(idToken, child.childKey, options);
      setAdminChildren((prev) =>
        prev.map((c) => (c.childKey === updated.childKey ? { ...c, ...updated } : c))
      );
      toast.success(`${updated.childName} is now ${updated.status.replace("-", " ")}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      throw err;
    } finally {
      setAdminActioningKey(null);
    }
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    const isCheckingIn = confirmTarget.child.status !== "checked-in";
    const options: ActionOptions = {
      note: confirmNote.trim(),
      eventTime,
      ...(isCheckingIn ? { pickupTime } : {}),
    };
    try {
      if (confirmTarget.role === "parent") {
        await handleAction(confirmTarget.child, options);
      } else {
        await handleAdminAction(confirmTarget.child, options);
      }
      setConfirmTarget(null);
    } catch {
      // Stay expanded on failure — handleAction/handleAdminAction already toasted the error.
    }
  };

  const handleEnrollSubmit = async (values: ChildFormValues) => {
    if (!idToken) return;
    try {
      await enrollChild(idToken, {
        childName: values.childName,
        guardians: values.guardians.map((g) => ({ email: g.email, phone: g.phone || undefined })),
        address: values.address,
        physicianInfo: values.physicianInfo,
        enrollDate: values.enrollDate || undefined,
      });
      toast.success(`${values.childName} enrolled.`);
      await loadAdmin(idToken);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      throw err;
    }
  };

  const handleEditSubmit = async (values: ChildFormValues) => {
    if (!idToken || !editingChild) return;
    try {
      await updateChild(idToken, editingChild.childKey, {
        childName: values.childName,
        guardians: values.guardians.map((g) => ({ email: g.email, phone: g.phone || undefined })),
        address: values.address,
        physicianInfo: values.physicianInfo,
        enrollDate: values.enrollDate || undefined,
        leftDate: values.leftDate || undefined,
      });
      toast.success(`${values.childName} updated.`);
      await loadAdmin(idToken);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      throw err;
    }
  };

  const handleDeactivate = async () => {
    if (!idToken || !deactivatingChild) return;
    try {
      await deactivateChild(idToken, deactivatingChild.childKey);
      toast.success(`${deactivatingChild.childName} un-enrolled.`);
      await loadAdmin(idToken);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDeactivatingChild(null);
    }
  };

  const handleDailyNoteSubmit = async (note: string) => {
    if (!idToken || !dailyNoteChild) return;
    try {
      await setDailyNote(idToken, dailyNoteChild.childKey, note);
      toast.success(`Today's note saved for ${dailyNoteChild.childName}.`);
      await loadAdmin(idToken);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      throw err;
    }
  };

  const hasChildren = children.length > 0;
  const defaultTab = hasChildren ? "checkin" : "admin";

  // Descending by expected pickup time; children with none (checked out, or
  // no pickup set) sort after those with one.
  const sortedAdminChildren = [...adminChildren].sort((a, b) => {
    const aTime = a.status === "checked-in" ? a.expectedPickupTime : null;
    const bTime = b.status === "checked-in" ? b.expectedPickupTime : null;
    if (aTime && bTime) return bTime.localeCompare(aTime);
    if (aTime) return -1;
    if (bTime) return 1;
    return 0;
  });

  const renderConfirmFields = (isCheckingIn: boolean, saving: boolean) => {
    const noteWords = countWords(confirmNote);
    const noteTooLong = noteWords > MAX_NOTE_WORDS;
    const hasNote = confirmNote.trim().length > 0;
    const actionLabel = isCheckingIn ? "Check In" : "Check Out";
    const pickupOptions = generatePickupTimeOptions(eventTime);

    return (
      <div className="space-y-3">
        <p className="font-medium text-sm">
          {actionLabel} {confirmTarget?.child.childName}?
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Time</label>
            <Input
              type="time"
              value={eventTime}
              onChange={(e) => {
                const next = e.target.value;
                setEventTime(next);
                if (isCheckingIn) {
                  const nextOptions = generatePickupTimeOptions(next);
                  setPickupTime((prev) => (nextOptions.includes(prev) ? prev : nextOptions[0]));
                }
              }}
              className="w-32"
            />
          </div>
          {isCheckingIn && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Expected pickup</label>
              <Select value={pickupTime} onValueChange={setPickupTime}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pickupOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {formatTimeLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Note (optional)</label>
          <Textarea
            value={confirmNote}
            onChange={(e) => setConfirmNote(e.target.value)}
            rows={2}
            placeholder={
              isCheckingIn
                ? "Write a note if you have — e.g. Grandma will pick up today"
                : "Write a note if you have — e.g. Next week we're on vacation"
            }
          />
          {hasNote && (
            <p
              className={`text-xs text-right ${noteTooLong ? "text-destructive" : "text-muted-foreground"}`}
            >
              {noteWords}/{MAX_NOTE_WORDS} words
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirmTarget(null)} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={saving || noteTooLong}>
            {saving ? "Saving..." : hasNote ? `Submit & ${actionLabel}` : actionLabel}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <header>
        <Header />
      </header>
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
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
                  {children.map((child) => {
                    const isExpanded =
                      confirmTarget?.role === "parent" && confirmTarget.child.childKey === child.childKey;
                    const isCheckingIn = child.status !== "checked-in";
                    return (
                      <Card key={child.childKey}>
                        <CardContent className="p-0">
                          <button
                            type="button"
                            disabled={actioningKey === child.childKey}
                            onClick={() =>
                              setConfirmTarget(isExpanded ? null : { child, role: "parent" })
                            }
                            className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                          >
                            <div>
                              <p className="font-semibold">{child.childName}</p>
                              <p className="text-sm text-muted-foreground">
                                {child.status === "checked-in" ? (
                                  child.lastEventAt ? (
                                    <>
                                      Last check-in: {formatEventTime(child.lastEventAt)}
                                      {child.expectedPickupTime && (
                                        <> · Expected pickup: {formatTimeLabel(child.expectedPickupTime)}</>
                                      )}
                                    </>
                                  ) : (
                                    "Checked in"
                                  )
                                ) : child.lastEventAt ? (
                                  <>Last check-out: {formatEventTime(child.lastEventAt)}</>
                                ) : (
                                  "Not checked in yet"
                                )}
                              </p>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shrink-0">
                              {isCheckingIn ? "Check In" : "Check Out"}
                            </span>
                          </button>

                          {child.dailyNote && (
                            <div className="px-4 pb-4">
                              <div className="flex gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
                                <StickyNote className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                <div>
                                  <p className="font-semibold text-foreground">
                                    Note{child.dailyNoteDate ? ` from ${formatNoteDate(child.dailyNoteDate)}` : ""}
                                  </p>
                                  <p className="text-muted-foreground">{child.dailyNote}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {isExpanded && (
                            <div className="border-t p-4 bg-muted/30">
                              {renderConfirmFields(isCheckingIn, actioningKey === child.childKey)}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>
              )}

              {isAdmin && (
                <TabsContent value="admin">
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <Button size="sm" onClick={() => setEnrollOpen(true)} className="gap-1.5">
                      <UserPlus className="h-4 w-4" />
                      Enroll Child
                    </Button>
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
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Child</TableHead>
                            <TableHead>Guardians</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last event</TableHead>
                            <TableHead>Last note</TableHead>
                            <TableHead>Daily note</TableHead>
                            <TableHead>Expected pickup</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedAdminChildren.map((child) => {
                            const isExpanded =
                              confirmTarget?.role === "admin" &&
                              confirmTarget.child.childKey === child.childKey;
                            const isCheckingIn = child.status !== "checked-in";
                            return (
                              <Fragment key={child.childKey}>
                                <TableRow>
                                  <TableCell className="font-medium">{child.childName}</TableCell>
                                  <TableCell className="text-sm">
                                    {child.guardians
                                      .map((g) => (g.phone ? `${g.email} (${g.phone})` : g.email))
                                      .join(", ")}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={child.status === "checked-in" ? "default" : "secondary"}>
                                      {child.status === "checked-in" ? "Checked in" : "Checked out"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {child.lastEventAt ? new Date(child.lastEventAt).toLocaleString() : "—"}
                                  </TableCell>
                                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                                    {child.lastNote || "—"}
                                  </TableCell>
                                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                                    {child.dailyNote || "—"}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {child.status === "checked-in" && child.expectedPickupTime
                                      ? formatTimeLabel(child.expectedPickupTime)
                                      : "—"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex justify-end gap-1.5 flex-wrap">
                                      <Button
                                        size="sm"
                                        variant={child.status === "checked-in" ? "outline" : "default"}
                                        disabled={adminActioningKey === child.childKey}
                                        onClick={() =>
                                          setConfirmTarget(isExpanded ? null : { child, role: "admin" })
                                        }
                                      >
                                        {adminActioningKey === child.childKey
                                          ? "Saving..."
                                          : child.status === "checked-in"
                                            ? "Check Out"
                                            : "Check In"}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setDailyNoteChild(child)}
                                        title="Today's note"
                                      >
                                        <NotebookPen className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingChild(child)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => setDeactivatingChild(child)}
                                      >
                                        <UserMinus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                {isExpanded && (
                                  <TableRow>
                                    <TableCell colSpan={8} className="bg-muted/30">
                                      {renderConfirmFields(isCheckingIn, adminActioningKey === child.childKey)}
                                    </TableCell>
                                  </TableRow>
                                )}
                              </Fragment>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <div className="mt-8">
                    <DoorSignQrCode />
                  </div>

                  <EnrollChildDialog
                    open={enrollOpen}
                    onOpenChange={setEnrollOpen}
                    onSubmit={handleEnrollSubmit}
                  />

                  <EnrollChildDialog
                    open={!!editingChild}
                    onOpenChange={(open) => !open && setEditingChild(null)}
                    initialValues={
                      editingChild
                        ? {
                            childName: editingChild.childName,
                            guardians: editingChild.guardians.map((g) => ({
                              email: g.email,
                              phone: g.phone ?? "",
                            })),
                            address: editingChild.address,
                            physicianInfo: editingChild.physicianInfo,
                            enrollDate: editingChild.enrollDate,
                            leftDate: editingChild.leftDate,
                          }
                        : undefined
                    }
                    onSubmit={handleEditSubmit}
                  />

                  <DailyNoteDialog
                    open={!!dailyNoteChild}
                    onOpenChange={(open) => !open && setDailyNoteChild(null)}
                    childName={dailyNoteChild?.childName}
                    initialNote={dailyNoteChild?.dailyNote ?? ""}
                    onSubmit={handleDailyNoteSubmit}
                  />

                  <AlertDialog
                    open={!!deactivatingChild}
                    onOpenChange={(open) => !open && setDeactivatingChild(null)}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Un-enroll {deactivatingChild?.childName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          They'll stop showing up in check-in/out and the admin dashboard. Their
                          enrollment history is kept, not deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeactivate}>Un-enroll</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
