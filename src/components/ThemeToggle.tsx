"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="text-xl hover:opacity-70 transition cursor-pointer"
      aria-label={dark ? "Светлая тема" : "Тёмная тема"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
