"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const SIZE_MAP = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" } as const;

const renderStars = (
  count: number,
  value: number,
  sizeClass: string,
  onChange?: (v: number) => void
) =>
  Array.from({ length: count }, (_, i) => {
    const filled = i < Math.round(value);
    return (
      <button
        key={i}
        type="button"
        onClick={() => onChange?.(i + 1)}
        disabled={!onChange}
        className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
      >
        <Star
          className={`${sizeClass} ${
            filled ? "text-moto-gold fill-moto-gold" : "text-moto-muted"
          }`}
        />
      </button>
    );
  });

export default function StarRating({
  value,
  onChange,
  size = "md",
  readonly = false,
}: StarRatingProps) {
  const sizeClass = SIZE_MAP[size];

  return (
    <div className="flex items-center gap-0.5">
      {renderStars(5, value, sizeClass, readonly ? undefined : onChange)}
      {readonly && (
        <span className="ml-1 text-moto-muted text-sm">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
