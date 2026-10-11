"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
}

/** Search input that waits briefly after typing before updating the search. */
export function SearchBar({ value, onSearch }: SearchBarProps) {
  const [text, setText] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(value);
  }

  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => onSearch(text), 350);
    return () => clearTimeout(timer);
  }, [text, value, onSearch]);

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search by name…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="field pl-9"
        aria-label="Search alumni by name"
      />
    </div>
  );
}
