import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Drafts mark the phrases a person would make their own as {{like this}}. This
// editor shows them highlighted and keeps the markers in `value`; use
// plainReview() (lib/reviews) for what gets copied or posted.
const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const MARK_CLASS = "bg-amber-100 text-amber-900 rounded px-0.5";

function toHtml(value: string): string {
  return escapeHtml(value)
    .replace(/\{\{(.*?)\}\}/g, `<mark class="${MARK_CLASS}">$1</mark>`)
    .replace(/\n/g, "<br>");
}

// Reads the edited DOM back into text with {{ }} around highlighted parts.
function fromDom(node: Node): string {
  let out = "";
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) out += child.textContent ?? "";
    else if (child.nodeName === "BR") out += "\n";
    else if (child.nodeName === "MARK") out += child.textContent ? `{{${child.textContent}}}` : "";
    // Browsers wrap new lines typed with Enter in a <div>.
    else if (child.nodeName === "DIV") out += (out && !out.endsWith("\n") ? "\n" : "") + fromDom(child);
    else out += fromDom(child);
  });
  return out;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const ReviewEditor = ({ value, onChange, placeholder, className }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  // Only rewrite the DOM for outside changes (a new draft), never while typing,
  // so the cursor doesn't jump.
  const lastEmitted = useRef<string | null>(null);

  useEffect(() => {
    if (ref.current && value !== lastEmitted.current) {
      ref.current.innerHTML = toHtml(value);
      lastEmitted.current = value;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      data-placeholder={placeholder}
      onInput={(e) => {
        const next = fromDom(e.currentTarget);
        lastEmitted.current = next;
        onChange(next);
      }}
      className={cn(
        "min-h-[8rem] w-full rounded-md border border-input bg-background px-3 py-2 leading-relaxed whitespace-pre-wrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground",
        className
      )}
    />
  );
};

export default ReviewEditor;
