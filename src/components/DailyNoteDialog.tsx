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

interface DailyNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childName?: string;
  initialNote?: string;
  onSubmit: (note: string) => Promise<void>;
}

const DailyNoteDialog = ({
  open,
  onOpenChange,
  childName,
  initialNote,
  onSubmit,
}: DailyNoteDialogProps) => {
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);

  const initialNoteRef = useRef(initialNote);
  initialNoteRef.current = initialNote;

  useEffect(() => {
    if (open) {
      setNote(initialNoteRef.current ?? "");
    }
  }, [open]);

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
