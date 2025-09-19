"use client";
import { useEffect, useState } from "react";

export function useBreakpoint(query = "(max-width: 768px)") {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches("matches" in e ? e.matches : (e as MediaQueryList).matches);
    };
    onChange(mql);
    mql.addEventListener?.("change", onChange as any);
    return () => mql.removeEventListener?.("change", onChange as any);
  }, [query]);
  return matches;
}
