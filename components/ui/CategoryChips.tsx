import React from "react";

export function CategoryChip({
  active,
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...props}
      className={[
        "h-9 px-3 rounded-full text-sm border transition whitespace-nowrap",
        active
          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function CategoryChips({
  items,
  activeIndex = 0,
  onChange,
}: {
  items: string[];
  activeIndex?: number;
  onChange?: (index: number) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pt-1">
      {items.map((c, idx) => (
        <CategoryChip key={c} active={activeIndex === idx} onClick={() => onChange?.(idx)}>
          {c}
        </CategoryChip>
      ))}
    </div>
  );
}
