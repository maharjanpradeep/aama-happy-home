import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SocialOverview, SocialPlatformResult, fetchSocialOverview, scanSocialPhotos } from "@/lib/checkin";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}

function PlatformBadge({ label, result }: { label: string; result: SocialPlatformResult | null }) {
  const text = result === "ok" ? "✓" : result === "error" ? "✗" : result === "dry-run" ? "test" : "off";
  const color =
    result === "ok" ? "text-green-700" : result === "error" ? "text-destructive" : "text-muted-foreground";
  return (
    <span className={`text-xs ${color}`}>
      {label} {text}
    </span>
  );
}

const SocialPostsCard = ({ idToken }: { idToken: string }) => {
  const [overview, setOverview] = useState<SocialOverview | null>(null);
  const [scanning, setScanning] = useState(false);

  const load = useCallback(() => {
    fetchSocialOverview(idToken)
      .then(setOverview)
      .catch((err) => toast.error(errorMessage(err)));
  }, [idToken]);

  useEffect(load, [load]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await scanSocialPhotos(idToken);
      setOverview(res);
      toast.success(res.posted ? `${res.posted} new photo${res.posted === 1 ? "" : "s"} processed.` : "No new photos.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setScanning(false);
    }
  };

  if (!overview?.enabled) return null;

  return (
    <Card className="mt-8">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">Social posts</h3>
          <Button size="sm" variant="outline" onClick={handleScan} disabled={scanning}>
            {scanning ? "Posting..." : "Check Drive now"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Photos uploaded to the Drive folder get an AI caption and are posted to Facebook, Instagram and Google every
          hour, or right away with "Check Drive now". Admins get an email with a link to each post.
        </p>
        {overview.waiting > 0 && (
          <p className="text-sm">{overview.waiting} new photo(s) in Drive will be posted within the hour, or click "Check Drive now".</p>
        )}
        {overview.unsupported.length > 0 && (
          <p className="text-sm text-destructive">
            Can't read {overview.unsupported.join(", ")}. Re-upload as JPEG (iPhone: Settings → Camera → Formats →
            Most Compatible).
          </p>
        )}

        {overview.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing posted yet.</p>
        ) : (
          <div className="space-y-2 border-t pt-3">
            <p className="text-sm font-semibold">Recent</p>
            {overview.recent.map((photo) => (
              <div key={photo.id} className="text-sm space-y-0.5">
                <div className="flex flex-wrap items-center gap-x-3">
                  <span className="font-medium">{photo.name}</span>
                  <PlatformBadge label="Facebook" result={photo.facebook} />
                  <PlatformBadge label="Instagram" result={photo.instagram} />
                  <PlatformBadge label="Google" result={photo.google} />
                  {photo.status === "failed" && (
                    <span className="text-xs text-destructive">not posted — re-upload to retry</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{photo.caption}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialPostsCard;
