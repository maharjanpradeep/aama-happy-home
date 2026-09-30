import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScheduledNoteInput, todayPacific } from "@/lib/checkin";

interface ScheduleNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childOptions: { childKey: string; childName: string }[];
  // Present when editing an existing note.
  initialValues?: ScheduledNoteInput;
  onSubmit: (input: ScheduledNoteInput) => Promise<void>;
}

const ScheduleNoteDialog = ({
  open,
  onOpenChange,
  childOptions,
  initialValues,
  onSubmit,
}: ScheduleNoteDialogProps) => {
  const [note, setNote] = useState("");
  const [startDate, setStartDate] = useState(todayPacific());
  const [endDate, setEndDate] = useState(todayPacific());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNote(initialValues?.note ?? "");
    setStartDate(initialValues?.startDate ?? todayPacific());
    setEndDate(initialValues?.endDate ?? todayPacific());
    setSelected(new Set(initialValues?.childKeys ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const allSelected = childOptions.length > 0 && childOptions.every((c) => selected.has(c.childKey));
  const datesInvalid = !startDate || !endDate || endDate < startDate;

  const toggle = (childKey: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(childKey);
      else next.delete(childKey);
      return next;
    });

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({ note: note.trim(), startDate, endDate, childKeys: [...selected] });
      onOpenChange(false);
    } catch {
      // Stay open on failure — the caller already toasted the error.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialValues ? "Edit scheduled note" : "Schedule a note"}</DialogTitle>
          <DialogDescription>
            Only the selected children's guardians see it, from now until the end date. If they
            haven't acknowledged it by the business day before it starts, check-in/out is locked
            until they do.
            {initialValues && " Saving changes asks parents to acknowledge again."}
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="e.g. We're closed Friday for staff training."
        />

        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <label htmlFor="schedule-note-start" className="text-xs text-muted-foreground">
              Start date
            </label>
            <Input
              id="schedule-note-start"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate < e.target.value) setEndDate(e.target.value);
              }}
              className="w-44"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="schedule-note-end" className="text-xs text-muted-foreground">
              End date
            </label>
            <Input
              id="schedule-note-end"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-44"
            />
          </div>
        </div>

        <div className="border-t pt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) =>
                setSelected(checked ? new Set(childOptions.map((c) => c.childKey)) : new Set())
              }
            />
            Select all
          </label>
          <div className="max-h-48 overflow-y-auto space-y-2 pl-1">
            {childOptions.map((child) => (
              <label key={child.childKey} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selected.has(child.childKey)}
                  onCheckedChange={(checked) => toggle(child.childKey, checked === true)}
                />
                {child.childName}
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !note.trim() || datesInvalid || selected.size === 0}>
            {saving
              ? "Saving..."
              : `${initialValues ? "Save" : "Schedule"} for ${selected.size} ${selected.size === 1 ? "child" : "children"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleNoteDialog;
