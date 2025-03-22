"use client";
import { useEffect, useState } from "react";

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const moveCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 w-20 h-20 rounded-full opacity-50 blur-xl transition-all duration-300 ease-out bg-gradient-to-r from-blue-400 to-pink-500"
      style={{
        transform: `translate(${position.x - 40}px, ${position.y - 40}px)`,
      }}
    />
  );
}
