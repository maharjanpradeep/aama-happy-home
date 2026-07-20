import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { fetchDailyNoteHistory, DailyNoteHistoryEntry } from "@/lib/checkin";

interface DailyNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childKey?: string;
  childName?: string;
  initialNote?: string;
  idToken: string | null;
  onSubmit: (note: string) => Promise<void>;
}

function formatHistoryDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const DailyNoteDialog = ({
  open,
  onOpenChange,
  childKey,
  childName,
  initialNote,
  idToken,
  onSubmit,
}: DailyNoteDialogProps) => {
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<DailyNoteHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const initialNoteRef = useRef(initialNote);
  initialNoteRef.current = initialNote;

  useEffect(() => {
    if (!open) return;
    setNote(initialNoteRef.current ?? "");
    setHistory([]);
    if (idToken && childKey) {
      setHistoryLoading(true);
      fetchDailyNoteHistory(idToken, childKey)
        .then((res) => setHistory(res.notes))
        .catch(() => setHistory([]))
        .finally(() => setHistoryLoading(false));
    }
  }, [open, idToken, childKey]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit(note.trim());
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Today's note{childName ? ` for ${childName}` : ""}</DialogTitle>
          <DialogDescription>
            Visible to all of this child's guardians on their check-in/out page today.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          placeholder="e.g. Napped 1hr, ate all of lunch, painted a picture today!"
        />

        <div className="border-t pt-3">
          <p className="text-sm font-semibold text-foreground mb-2">Past notes</p>
          {historyLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No past notes yet.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
              {history.map((entry) => (
                <div key={entry.date} className="text-sm">
                  <p className="font-medium text-foreground">{formatHistoryDate(entry.date)}</p>
                  <p className="text-muted-foreground whitespace-pre-line">{entry.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DailyNoteDialog;
