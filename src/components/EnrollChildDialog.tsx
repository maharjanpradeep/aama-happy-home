import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface GuardianFormValue {
  name: string;
  email: string;
  phone: string;
}

export interface ChildFormValues {
  childName: string;
  dob: string;
  guardians: GuardianFormValue[];
  address: string;
  physicianInfo: string;
  enrollDate: string;
  leftDate: string;
}

const EMPTY_VALUES: ChildFormValues = {
  childName: "",
  dob: "",
  guardians: [{ name: "", email: "", phone: "" }],
  address: "",
  physicianInfo: "",
  enrollDate: "",
  leftDate: "",
};

interface EnrollChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: ChildFormValues;
  onSubmit: (values: ChildFormValues) => Promise<void>;
}

function todayDateInputValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const EnrollChildDialog = ({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
}: EnrollChildDialogProps) => {
  const [values, setValues] = useState<ChildFormValues>(initialValues ?? EMPTY_VALUES);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initialValues;

  // initialValues is often a fresh object literal from the caller on every
  // render — read it via a ref so the reset only fires on the open/close
  // transition, not on every parent re-render while the dialog is open
  // (which would otherwise wipe whatever the admin was mid-typing).
  const initialValuesRef = useRef(initialValues);
  initialValuesRef.current = initialValues;

  useEffect(() => {
    if (open) {
      const next = initialValuesRef.current ?? EMPTY_VALUES;
      setValues(
        isEdit || initialValuesRef.current
          ? next
          : { ...next, enrollDate: todayDateInputValue() }
      );
    }
  }, [open, isEdit]);

  const updateGuardian = (index: number, field: keyof GuardianFormValue, value: string) => {
    setValues((v) => ({
      ...v,
      guardians: v.guardians.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    }));
  };

  const addGuardian = () => {
    setValues((v) => ({ ...v, guardians: [...v.guardians, { name: "", email: "", phone: "" }] }));
  };

  const removeGuardian = (index: number) => {
    setValues((v) => ({
      ...v,
      guardians: v.guardians.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({
        ...values,
        childName: values.childName.trim(),
        dob: values.dob.trim(),
        guardians: values.guardians
          .map((g) => ({ name: g.name.trim(), email: g.email.trim(), phone: g.phone.trim() }))
          .filter((g) => g.email && g.name),
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const canSubmit =
    values.childName.trim().length > 0 &&
    values.dob.trim().length > 0 &&
    values.guardians.some((g) => g.email.trim().length > 0 && g.name.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Child" : "Enroll Child"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this child's info or guardian list."
              : "Add a new child and at least one authorized guardian."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="childName">Child's name</Label>
            <Input
              id="childName"
              value={values.childName}
              onChange={(e) => setValues((v) => ({ ...v, childName: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              type="date"
              required
              value={values.dob}
              onChange={(e) => setValues((v) => ({ ...v, dob: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Guardians</Label>
            <p className="text-xs text-muted-foreground">
              Any of these can check this child in or out.
            </p>
            <div className="space-y-2">
              {values.guardians.map((guardian, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Name"
                    value={guardian.name}
                    onChange={(e) => updateGuardian(i, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="email"
                    placeholder="parent@example.com"
                    value={guardian.email}
                    onChange={(e) => updateGuardian(i, "email", e.target.value)}
                    className="flex-[2]"
                  />
                  <Input
                    type="tel"
                    placeholder="Phone"
                    value={guardian.phone}
                    onChange={(e) => updateGuardian(i, "phone", e.target.value)}
                    className="flex-1"
                  />
                  {values.guardians.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGuardian(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addGuardian}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add another guardian
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={values.address}
              onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="physicianInfo">Physician name &amp; phone</Label>
            <Input
              id="physicianInfo"
              value={values.physicianInfo}
              onChange={(e) => setValues((v) => ({ ...v, physicianInfo: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="enrollDate">Enroll date</Label>
              <Input
                id="enrollDate"
                type="date"
                value={values.enrollDate}
                onChange={(e) => setValues((v) => ({ ...v, enrollDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="leftDate">Left date</Label>
              <Input
                id="leftDate"
                type="date"
                value={values.leftDate}
                onChange={(e) => setValues((v) => ({ ...v, leftDate: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Enroll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollChildDialog;
