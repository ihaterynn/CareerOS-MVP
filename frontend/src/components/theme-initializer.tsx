"use client";

import { useEffect } from "react";

export function ThemeInitializer() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", localStorage.getItem("cos_theme") || "light");
    root.setAttribute("data-accent", localStorage.getItem("cos_accent") || "gold");
    root.setAttribute("data-headingfont", localStorage.getItem("cos_headingfont") || "source");
  }, []);

  return null;
}
