import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Copy, ExternalLink, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import ReviewEditor from "@/components/ReviewEditor";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/use-page-meta";
import { fetchReviewLink, redraftReviewLink } from "@/lib/checkin";
import { REVIEW_PLATFORMS, plainReview } from "@/lib/reviews";

// Without a token (the homepage's "Leave us a review") there's no sample, just these.
const DEFAULT_PLATFORMS = ["google", "facebook"];

type LinkState = "loading" | "ready" | "expired" | "invalid";

const Review = () => {
  usePageMeta({
    title: "Leave a review | Aama Day Care Center",
    description: "Share your experience with Aama Day Care Center.",
    path: "/review",
  });

  // Only reached through a link; keep it out of search results.
  useEffect(() => {
    const meta = document.head.querySelector('meta[name="robots"]');
    const previous = meta?.getAttribute("content");
    meta?.setAttribute("content", "noindex");
    return () => {
      if (previous) meta?.setAttribute("content", previous);
    };
  }, []);

  const { token } = useParams();
  const [state, setState] = useState<LinkState>(token ? "loading" : "ready");
  const [platformIds, setPlatformIds] = useState<string[]>(DEFAULT_PLATFORMS);
  const [draft, setDraft] = useState("");
  const [redrafting, setRedrafting] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchReviewLink(token)
      .then((link) => {
        setPlatformIds(link.platforms);
        if ("expired" in link) return setState("expired");
        setDraft(link.draft);
        setState("ready");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  // An expired link keeps its platforms but drops the sample; an invalid one gets the defaults.
  const platforms = REVIEW_PLATFORMS.filter((p) => (state === "invalid" ? DEFAULT_PLATFORMS : platformIds).includes(p.id));

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(plainReview(draft));
      toast.success("Copied! Now paste it into the review.");
    } catch {
      toast.error("Couldn't copy. Press and hold the text to copy it.");
    }
  };

  const newSample = async () => {
    if (!token) return;
    setRedrafting(true);
    try {
      const res = await redraftReviewLink(token);
      setDraft(res.draft);
      setRemaining(res.remaining);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't get a new sample.");
      setRemaining(0);
    } finally {
      setRedrafting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <article className="max-w-xl mx-auto px-4 space-y-8">
          <header className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">Thanks for leaving us a review 💛</h1>
            <p className="text-muted-foreground">A few words from you help other families find a daycare they can trust.</p>
          </header>

          {state === "loading" && <p className="text-center text-muted-foreground">Loading...</p>}

          {state === "ready" && draft && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">1. Make this sample your own</h2>
              <p className="text-sm text-muted-foreground">
                Please check the <mark className="bg-amber-100 text-amber-900 rounded px-0.5">highlighted</mark> parts
                and change them as needed, for example to your child's name.
              </p>
              <ReviewEditor value={draft} onChange={setDraft} className="text-base" />
              <div className="flex gap-2">
                <Button size="lg" className="flex-1" onClick={copyDraft}>
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
                {remaining !== 0 && (
                  <Button size="lg" variant="outline" onClick={newSample} disabled={redrafting}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${redrafting ? "animate-spin" : ""}`} />
                    {redrafting ? "Writing..." : "Try another"}
                  </Button>
                )}
              </div>
            </section>
          )}

          {state !== "loading" && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">{state === "ready" && draft ? "2. Paste it here" : "Leave a review"}</h2>
              {platforms.map((p) => (
                <Button key={p.id} asChild size="lg" variant="outline" className="w-full h-auto py-3 flex-col">
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    <span className="flex items-center gap-2 font-semibold">
                      Review on {p.name} <ExternalLink className="h-4 w-4" />
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">{p.hint}</span>
                  </a>
                </Button>
              ))}
            </section>
          )}
        </article>
      </main>
    </div>
  );
};

export default Review;
