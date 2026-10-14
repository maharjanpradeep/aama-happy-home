import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Copy, ExternalLink, MessageCircle, RefreshCw, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import AdminTabs from "@/components/AdminTabs";
import ReviewEditor from "@/components/ReviewEditor";
import SocialPostsCard from "@/components/SocialPostsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/auth-context";
import { usePageMeta } from "@/hooks/use-page-meta";
import {
  AdminReviewLink,
  createReviewLink,
  deleteReviewLink,
  fetchAdminStatus,
  fetchReviewDraft,
  fetchReviewTopics,
  listReviewLinks,
  refreshReviewTopics,
  setReviewLinkStatus,
} from "@/lib/checkin";
import { REVIEW_PLATFORMS, ReviewPlatformId, plainReview, reviewPageUrl, smsHref } from "@/lib/reviews";
import { SOCIAL_URLS } from "@/lib/social";

// Public profile, the email that owns it, and where that email signs in to manage it.
const ACCOUNTS = [
  { name: "Facebook", url: SOCIAL_URLS.facebook, email: "rasu.tuladhar@gmail.com", manage: "https://business.facebook.com/", autoPost: true },
  { name: "Instagram", url: SOCIAL_URLS.instagram, email: "rasu.tuladhar@gmail.com", manage: "https://business.facebook.com/", autoPost: true },
  { name: "Google", url: SOCIAL_URLS.google, email: "pradeep.maharjan@gmail.com", manage: "https://business.google.com/?authuser=pradeep.maharjan@gmail.com", autoPost: true },
  { name: "Yelp", url: SOCIAL_URLS.yelp, email: "rasu.tuladhar@gmail.com", manage: "https://biz.yelp.com/login", autoPost: false },
  { name: "Nextdoor", url: SOCIAL_URLS.nextdoor, email: "rasu.tuladhar@gmail.com", manage: "https://business.nextdoor.com/", autoPost: false },
  { name: "Care.com", url: SOCIAL_URLS.care, email: "aamadaycare@gmail.com", manage: "https://www.care.com/vis/auth/login", autoPost: false },
];

const MAX_TOPICS = 5;

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}

// Phone number (optional) + "Send in Messages" + "Copy". sms: opens Messages on
// iPhone and Mac with the text filled in; with no number you pick the contact there.
const SendRow = ({ message, disabled }: { message: string; disabled?: boolean }) => {
  const [phone, setPhone] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Copied. Paste it into Messages.");
    } catch {
      toast.error("Couldn't copy.");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        type="tel"
        inputMode="tel"
        placeholder="Phone (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full sm:w-44"
        disabled={disabled}
      />
      {disabled ? (
        <Button disabled>
          <MessageCircle className="h-4 w-4 mr-2" /> Send in Messages
        </Button>
      ) : (
        <Button asChild>
          <a href={smsHref(phone, message)}>
            <MessageCircle className="h-4 w-4 mr-2" /> Send in Messages
          </a>
        </Button>
      )}
      <Button variant="outline" onClick={copy} disabled={disabled}>
        <Copy className="h-4 w-4 mr-2" /> Copy
      </Button>
    </div>
  );
};

const AskForReviewCard = ({ idToken, onCreated }: { idToken: string; onCreated: () => void }) => {
  const [platforms, setPlatforms] = useState<ReviewPlatformId[]>(REVIEW_PLATFORMS.map((p) => p.id));
  const [draft, setDraft] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const notes = picked.join("; ");

  const [topicsState, setTopicsState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    fetchReviewTopics(idToken)
      .then((res) => {
        setTopics(res.topics);
        setTopicsState("ready");
      })
      .catch(() => setTopicsState("failed"));
  }, [idToken]);

  const [refreshingTopics, setRefreshingTopics] = useState(false);
  const newIdeas = async () => {
    setRefreshingTopics(true);
    try {
      setTopics((await refreshReviewTopics(idToken)).topics);
      setTopicsState("ready");
      setPicked([]);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRefreshingTopics(false);
    }
  };

  const toggleTopic = (topic: string) =>
    setPicked((cur) =>
      cur.includes(topic) ? cur.filter((t) => t !== topic) : cur.length < MAX_TOPICS ? [...cur, topic] : cur
    );
  const [drafting, setDrafting] = useState(false);
  const [creating, setCreating] = useState(false);
  // The link carries the platforms and draft, so any change means a new link.
  const [link, setLink] = useState<{ url: string; expiresAt: string } | null>(null);

  const newDraft = async () => {
    setDrafting(true);
    try {
      setDraft((await fetchReviewDraft(idToken, notes)).draft);
      setLink(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDrafting(false);
    }
  };

  const toggle = (id: ReviewPlatformId) => {
    setPlatforms((cur) => (cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id]));
    setLink(null);
  };

  const createLink = async () => {
    setCreating(true);
    try {
      const res = await createReviewLink(idToken, platforms, draft, notes);
      setLink({ url: reviewPageUrl(res.id), expiresAt: res.expiresAt });
      onCreated();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const message = link
    ? "Hi! Would you mind leaving Aama Daycare a quick review? It would mean a lot to us. " +
      `I put a sample here you can change and copy: ${link.url}`
    : "";

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-bold">Ask for a review</h3>
          <p className="text-sm text-muted-foreground">
            Each link has its own sample and works for 7 days. They can edit it or ask for a new one, then copy and
            post. Send only to people who know the daycare.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">1. Where should they post?</p>
          <div className="flex flex-wrap gap-2">
            {REVIEW_PLATFORMS.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant="outline"
                // Selected chips are tinted, so they don't look like the action buttons.
                className={platforms.includes(p.id) ? "border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : ""}
                aria-pressed={platforms.includes(p.id)}
                onClick={() => toggle(p.id)}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">2. Sample review</p>
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Things to mention (optional, up to {MAX_TOPICS}): points your current reviews don't cover yet. Tick
                only what's true, then tap {draft ? "New draft" : "Write a draft"}.
              </p>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs shrink-0" onClick={newIdeas} disabled={refreshingTopics}>
                <RefreshCw className={`h-3 w-3 mr-1 ${refreshingTopics ? "animate-spin" : ""}`} />
                {refreshingTopics ? "Thinking..." : "New ideas"}
              </Button>
            </div>
            {topicsState === "loading" && <p className="text-xs text-muted-foreground">Loading ideas...</p>}
            {topicsState === "failed" && (
              <p className="text-xs text-destructive">Couldn't load ideas. Tap New ideas to try again.</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {topics.map((topic) => {
                const on = picked.includes(topic);
                return (
                  <Button
                    key={topic}
                    size="sm"
                    variant="outline"
                    className={`h-auto py-1 text-xs font-normal ${on ? "border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : ""}`}
                    aria-pressed={on}
                    disabled={!on && picked.length >= MAX_TOPICS}
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </Button>
                );
              })}
            </div>
          </div>
          <Button onClick={newDraft} disabled={drafting}>
            <RefreshCw className={`h-4 w-4 mr-2 ${drafting ? "animate-spin" : ""}`} />
            {drafting ? "Writing..." : draft ? "New draft" : "Write a draft"}
          </Button>
          <ReviewEditor
            value={draft}
            onChange={(v) => {
              setDraft(v);
              setLink(null);
            }}
            placeholder='Tap "Write a draft" for a fresh sample review.'
          />
          <p className="text-xs text-muted-foreground">Highlighted parts are the ones they'll check and change, like swapping in their child's name.</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">3. Send</p>
          {link ? (
            <>
              <p className="text-xs text-muted-foreground break-all">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Preview the page
                </a>{" "}
                · expires {new Date(link.expiresAt).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
              <SendRow message={message} />
            </>
          ) : (
            <Button onClick={createLink} disabled={creating || !platforms.length || !draft.trim()}>
              {creating ? "Creating..." : "Create link"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function validity(link: AdminReviewLink): { label: string; className: string } {
  if (link.status === "disabled") return { label: "Disabled", className: "text-muted-foreground" };
  const left = Date.parse(link.expiresAt) - Date.now();
  if (left <= 0) return { label: "Expired", className: "text-muted-foreground" };
  const totalHours = Math.ceil(left / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const parts = [days && `${days}d`, hours && `${hours}h`].filter(Boolean).join(" ");
  return { label: `Active · ${parts} left`, className: "text-green-700" };
}

const platformNames = (ids: string[]) =>
  REVIEW_PLATFORMS.filter((p) => ids.includes(p.id)).map((p) => p.name).join(", ");

const ReviewLinksCard = ({ idToken, links, reload }: { idToken: string; links: AdminReviewLink[]; reload: () => void }) => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const act = async (id: string, action: () => Promise<void>, done: string) => {
    setBusyId(id);
    try {
      await action();
      toast.success(done);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const copy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(reviewPageUrl(id));
      toast.success("Link copied.");
    } catch {
      toast.error("Couldn't copy.");
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold">Review links</h3>
          <p className="text-sm text-muted-foreground">
            Every link you've created. Each works for 7 days; disable one to stop it early, or delete it.
          </p>
        </div>
        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">No links yet.</p>
        ) : (
          <div className="divide-y">
            {links.map((link) => {
              const v = validity(link);
              const busy = busyId === link.id;
              const expired = Date.parse(link.expiresAt) <= Date.now();
              return (
                <div key={link.id} className="py-3 space-y-1.5 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {new Date(link.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      <span className="text-muted-foreground font-normal"> · {platformNames(link.platforms)}</span>
                    </span>
                    <span className={`text-xs font-semibold ${v.className}`}>{v.label}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{plainReview(link.draft)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(link.id)}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy link
                    </Button>
                    {!expired && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          act(
                            link.id,
                            () => setReviewLinkStatus(idToken, link.id, link.status === "active" ? "disabled" : "active"),
                            link.status === "active" ? "Link disabled." : "Link enabled."
                          )
                        }
                      >
                        {link.status === "active" ? "Disable" : "Enable"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm("Delete this link? Anyone who opens it will see that it isn't valid.")) {
                          act(link.id, () => deleteReviewLink(idToken, link.id), "Link deleted.");
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SHARE_MESSAGE =
  "Hi! We'd love for you to follow Aama Daycare. We post photos of the kids' days every week. " +
  `Instagram: ${SOCIAL_URLS.instagram}\nFacebook: ${SOCIAL_URLS.facebook}\n` +
  "And if you know a family looking for daycare, please share!";

const SharePagesCard = () => {
  const [message, setMessage] = useState(SHARE_MESSAGE);
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold">Share our pages</h3>
          <p className="text-sm text-muted-foreground">Ask someone to follow and share Instagram and Facebook.</p>
        </div>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
        <SendRow message={message} disabled={!message.trim()} />
      </CardContent>
    </Card>
  );
};

const AccountsCard = () => (
  <Card>
    <CardContent className="p-4 space-y-3">
      <h3 className="text-lg font-bold">Accounts</h3>
      <p className="text-sm text-muted-foreground">Click an email to sign in and manage that account.</p>
      <div className="divide-y">
        {ACCOUNTS.map((a) => (
          <div key={a.name} className="py-2 grid grid-cols-[7rem_1fr] sm:grid-cols-[8rem_1fr_auto] items-center gap-x-4 gap-y-1 text-sm">
            <a href={a.url} target="_blank" rel="noopener noreferrer" className="font-semibold inline-flex items-center gap-1 hover:underline">
              {a.name} <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a href={a.manage} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
              {a.email}
            </a>
            <span className={`text-xs col-start-2 sm:col-start-auto sm:text-right ${a.autoPost ? "text-green-700" : "text-muted-foreground"}`}>
              {a.autoPost ? "Auto-posting on" : "Manual"}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const AdminSocial = () => {
  usePageMeta({ title: "Social media | Aama Day Care Center", description: "Admin: social accounts and reviews.", path: "/admin/social" });
  const { idToken } = useAuth();
  // null = still checking.
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [links, setLinks] = useState<AdminReviewLink[]>([]);

  const loadLinks = useCallback(() => {
    if (!idToken) return;
    listReviewLinks(idToken)
      .then((res) => setLinks(res.links))
      .catch((err) => toast.error(errorMessage(err)));
  }, [idToken]);

  useEffect(() => {
    if (!idToken) return;
    fetchAdminStatus(idToken)
      .then(() => {
        setIsAdmin(true);
        loadLinks();
      })
      .catch(() => setIsAdmin(false));
  }, [idToken, loadLinks]);

  if (!idToken || isAdmin === false) return <Navigate to="/checkin" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>
          <AdminTabs />
          {isAdmin === null ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <>
              <AskForReviewCard idToken={idToken} onCreated={loadLinks} />
              <ReviewLinksCard idToken={idToken} links={links} reload={loadLinks} />
              <SharePagesCard />
              <AccountsCard />
              <SocialPostsCard idToken={idToken} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSocial;
