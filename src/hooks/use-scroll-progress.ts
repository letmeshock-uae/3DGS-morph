import { useEffect, useRef, useState } from "react";

export type ScrollProgressState = {
  scrollY: number;
  scrollProgress: number;
  isScrolling: boolean;
};

export function useScrollProgress(): ScrollProgressState {
  const [state, setState] = useState<ScrollProgressState>({
    scrollY: 0,
    scrollProgress: 0,
    isScrolling: false,
  });
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScrollY =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = maxScrollY > 0 ? scrollY / maxScrollY : 0;

      setState({
        scrollY,
        scrollProgress: Math.min(Math.max(scrollProgress, 0), 1),
        isScrolling: true,
      });

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isScrolling: false }));
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return state;
}
