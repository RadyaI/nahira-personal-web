"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FiArrowUpRight,
  FiEdit2,
  FiEdit3,
  FiGrid,
  FiKey,
  FiMoreHorizontal,
  FiRotateCcw,
  FiSquare,
  FiStar,
  FiTrash2,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";

type ToolType = "pen" | "highlighter" | "sparkle" | "stamp" | "eraser";
type BoardSurface = "grid" | "dots" | "clean";

type PlacedSticker = {
  id: number;
  x: number;
  y: number;
  symbol: string;
  bg: string;
  rotate: number;
};

const TARGET_URL = "https://nahiraa.vercel.app/";

const INK_PALETTE = [
  { id: "plum", hex: "#22183A" },
  { id: "pink", hex: "#FF66B2" },
  { id: "lilac", hex: "#8B5CF6" },
  { id: "mint", hex: "#10B981" },
  { id: "butter", hex: "#F59E0B" },
];

const STAMP_ITEMS = [
  { symbol: "✿", bg: "#FFD6EC" },
  { symbol: "✦", bg: "#E7DCFF" },
  { symbol: "♡", bg: "#CCF5E1" },
  { symbol: "★", bg: "#FFF0B8" },
];

const TITLE_CHARS = ["N", "A", "H", "I", "R", "A", "A"];
const NOTE_FREQS = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77];

export default function StudioWhiteboardPortal() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const portalBtnRef = useRef<HTMLAnchorElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isDrawingRef = useRef(false);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const lastSparkleRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);

  const [tool, setTool] = useState<ToolType>("pen");
  const [inkColor, setInkColor] = useState(INK_PALETTE[0].hex);
  const [stampIdx, setStampIdx] = useState(0);
  const [surface, setSurface] = useState<BoardSurface>("grid");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [isWiping, setIsWiping] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  const [keyOffset, setKeyOffset] = useState({ x: 0, y: 0 });
  const [isDraggingKey, setIsDraggingKey] = useState(false);
  const [isKeyOverPortal, setIsKeyOverPortal] = useState(false);
  const keyStartRef = useRef({ x: 0, y: 0 });

  const playTone = (freq: number, duration = 0.09, type: OscillatorType = "sine", gainVal = 0.05) => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      return;
    }
  };

  const drawDoodleGuide = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (w < 640) return;
    ctx.save();
    ctx.strokeStyle = "#C4B5FD";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const cx = w / 2;
    const cy = h / 2;

    ctx.beginPath();
    ctx.moveTo(cx - 260, cy - 30);
    ctx.bezierCurveTo(cx - 285, cy + 55, cx - 210, cy + 105, cx - 145, cy + 92);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 158, cy + 84);
    ctx.lineTo(cx - 142, cy + 92);
    ctx.lineTo(cx - 153, cy + 105);
    ctx.stroke();

    ctx.strokeStyle = "#F9A8D4";
    const rx = cx + 235;
    const ry = cy - 95;
    ctx.beginPath();
    ctx.moveTo(rx, ry - 14);
    ctx.lineTo(rx, ry + 14);
    ctx.moveTo(rx - 14, ry);
    ctx.lineTo(rx + 14, ry);
    ctx.moveTo(rx - 9, ry - 9);
    ctx.lineTo(rx + 9, ry + 9);
    ctx.moveTo(rx + 9, ry - 9);
    ctx.lineTo(rx - 9, ry + 9);
    ctx.stroke();

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initCanvas = (preserve: boolean) => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      let backup: HTMLCanvasElement | null = null;
      if (preserve && canvas.width > 0 && canvas.height > 0) {
        backup = document.createElement("canvas");
        backup.width = canvas.width;
        backup.height = canvas.height;
        backup.getContext("2d")?.drawImage(canvas, 0, 0);
      }

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (backup) {
        ctx.drawImage(backup, 0, 0, rect.width, rect.height);
      } else {
        drawDoodleGuide(ctx, rect.width, rect.height);
      }
    };

    initCanvas(false);
    const onResize = () => initCanvas(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const pushSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [...historyRef.current.slice(-15), snap];
    setCanUndo(true);
  };

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const drawSparkleMark = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "#22183A";
    ctx.lineWidth = 1.5;
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.6);

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? 9 : 3.5;
      const angle = (Math.PI * i) / 4;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = getPointerPos(e);

    if (tool === "stamp") {
      const chosen = STAMP_ITEMS[stampIdx];
      const next: PlacedSticker = {
        id: Date.now() + Math.random(),
        x: pos.x,
        y: pos.y,
        symbol: chosen.symbol,
        bg: chosen.bg,
        rotate: Math.floor(Math.random() * 28) - 14,
      };
      setStickers((prev) => [...prev.slice(-19), next]);
      setStampIdx((prev) => (prev + 1) % STAMP_ITEMS.length);
      playTone(680, 0.1, "triangle", 0.07);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    pushSnapshot();
    isDrawingRef.current = true;
    pointsRef.current = [pos];
    lastSparkleRef.current = pos;

    ctx.save();
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (tool === "sparkle") {
      drawSparkleMark(ctx, pos.x, pos.y, inkColor);
      playTone(840, 0.06, "sine", 0.03);
    } else if (tool === "highlighter") {
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = inkColor;
      ctx.fillRect(pos.x - 9, pos.y - 9, 18, 18);
    } else {
      ctx.fillStyle = inkColor;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPointerPos(e);
    const pts = pointsRef.current;
    pts.push(pos);

    if (tool === "sparkle") {
      if (lastSparkleRef.current) {
        const dist = Math.hypot(pos.x - lastSparkleRef.current.x, pos.y - lastSparkleRef.current.y);
        if (dist > 24) {
          drawSparkleMark(ctx, pos.x, pos.y, inkColor);
          lastSparkleRef.current = pos;
          playTone(760 + Math.random() * 240, 0.05, "sine", 0.02);
        }
      }
      return;
    }

    if (pts.length < 3) return;
    const p1 = pts[pts.length - 2];
    const p2 = pts[pts.length - 1];
    const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const prevMid =
      pts.length === 3
        ? pts[0]
        : { x: (pts[pts.length - 3].x + p1.x) / 2, y: (pts[pts.length - 3].y + p1.y) / 2 };

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 28;
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else if (tool === "highlighter") {
      ctx.globalAlpha = 0.28;
      ctx.lineCap = "square";
      ctx.lineWidth = 18;
      ctx.strokeStyle = inkColor;
    } else {
      ctx.lineWidth = 4.2;
      ctx.strokeStyle = inkColor;
    }

    ctx.beginPath();
    ctx.moveTo(prevMid.x, prevMid.y);
    ctx.quadraticCurveTo(p1.x, p1.y, mid.x, mid.y);
    ctx.stroke();
    ctx.restore();
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    pointsRef.current = [];
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const last = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    ctx.putImageData(last, 0, 0);
    setCanUndo(historyRef.current.length > 0);
    playTone(380, 0.08, "triangle", 0.05);
  };

  const handleWipeBoard = () => {
    if (isWiping) return;
    setIsWiping(true);
    playTone(300, 0.25, "sine", 0.06);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        ctx?.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
      historyRef.current = [];
      setCanUndo(false);
      setStickers([]);
    }, 260);

    setTimeout(() => {
      setIsWiping(false);
    }, 580);
  };

  const launchDestination = () => {
    playTone(587.33, 0.08, "triangle", 0.06);
    setTimeout(() => playTone(880, 0.14, "triangle", 0.06), 70);
    setTimeout(() => {
      window.open(TARGET_URL, "_blank", "noopener,noreferrer");
    }, 180);
  };

  const handleKeyPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingKey(true);
    keyStartRef.current = {
      x: e.clientX - keyOffset.x,
      y: e.clientY - keyOffset.y,
    };
    playTone(620, 0.06, "sine", 0.04);
  };

  const handleKeyPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingKey) return;
    const nextX = e.clientX - keyStartRef.current.x;
    const nextY = e.clientY - keyStartRef.current.y;
    setKeyOffset({ x: nextX, y: nextY });

    if (portalBtnRef.current) {
      const rect = portalBtnRef.current.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left - 24 &&
        e.clientX <= rect.right + 24 &&
        e.clientY >= rect.top - 24 &&
        e.clientY <= rect.bottom + 24;
      setIsKeyOverPortal(inside);
    }
  };

  const handleKeyPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingKey) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDraggingKey(false);

    if (isKeyOverPortal) {
      setIsKeyOverPortal(false);
      setKeyOffset({ x: 0, y: 0 });
      launchDestination();
      return;
    }

    setKeyOffset({ x: 0, y: 0 });
  };

  const surfaceClass =
    surface === "grid"
      ? "board-grid"
      : surface === "dots"
        ? "board-dots"
        : "board-clean";

  return (
    <main className="font-main relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#EDE5FC] p-2.5 text-[#22183A] select-none sm:p-5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Pixelify+Sans:wght@600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Space+Mono:wght@700&display=swap');
        .font-pixel { font-family: 'Pixelify Sans', monospace; }
        .font-serif-soft { font-family: 'Instrument Serif', serif; }
        .font-main { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-code { font-family: 'Space Mono', monospace; }
        .board-grid {
          background-color: #FAF8FF;
          background-image:
            linear-gradient(to right, #EAE2F8 1px, transparent 1px),
            linear-gradient(to bottom, #EAE2F8 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .board-dots {
          background-color: #FFFDF9;
          background-image: radial-gradient(#D7CCE8 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }
        .board-clean {
          background-color: #FAF8FF;
        }
        .ruler-ticks {
          background-image: repeating-linear-gradient(
            to right,
            #22183A 0px,
            #22183A 1px,
            transparent 1px,
            transparent 12px
          );
          background-position: bottom;
          background-size: 100% 6px;
          background-repeat: no-repeat;
        }
        .sticker-heading {
          text-shadow:
            -3px -3px 0 #FFFFFF,
             3px -3px 0 #FFFFFF,
            -3px  3px 0 #FFFFFF,
             3px  3px 0 #FFFFFF,
             0px -3px 0 #FFFFFF,
             0px  3px 0 #FFFFFF,
            -3px  0px 0 #FFFFFF,
             3px  0px 0 #FFFFFF,
             4px  5px 0 #22183A;
        }
        @keyframes stickerPop {
          0% { transform: translate(-50%, -50%) scale(0.3) rotate(0deg); }
          70% { transform: translate(-50%, -50%) scale(1.15) rotate(var(--rot)); }
          100% { transform: translate(-50%, -50%) scale(1) rotate(var(--rot)); }
        }
        @keyframes wipeSweep {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(110vw); }
        }
        .stamp-pop {
          animation: stickerPop 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .wiper-bar {
          animation: wipeSweep 0.56s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      <div
        className={`${surfaceClass} relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[28px] border-[3px] border-[#22183A] shadow-[8px_8px_0_#22183A] transition-colors duration-300`}
      >
        <span className="pointer-events-none absolute top-3 left-3 z-30 h-2.5 w-2.5 rounded-full border border-[#22183A] bg-[#E7DCFF]" />
        <span className="pointer-events-none absolute top-3 right-3 z-30 h-2.5 w-2.5 rounded-full border border-[#22183A] bg-[#FFD6EC]" />
        <span className="pointer-events-none absolute bottom-3 left-3 z-30 h-2.5 w-2.5 rounded-full border border-[#22183A] bg-[#CCF5E1]" />
        <span className="pointer-events-none absolute right-3 bottom-3 z-30 h-2.5 w-2.5 rounded-full border border-[#22183A] bg-[#FFF0B8]" />

        {isWiping && (
          <div className="wiper-bar pointer-events-none absolute inset-y-0 left-0 z-40 flex w-14 items-center justify-center border-x-2 border-[#22183A] bg-[#FFF0B8] shadow-[6px_0_0_#22183A]">
            <div className="h-24 w-2 rounded-full bg-[#22183A]/20" />
          </div>
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerCancel={handleCanvasPointerUp}
          className={`absolute inset-0 z-10 h-full w-full touch-none ${
            tool === "stamp" ? "cursor-cell" : "cursor-crosshair"
          }`}
        />

        {stickers.map((item) => (
          <div
            key={item.id}
            style={
              {
                left: item.x,
                top: item.y,
                backgroundColor: item.bg,
                "--rot": `${item.rotate}deg`,
              } as React.CSSProperties
            }
            className="stamp-pop pointer-events-none absolute z-15 flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#22183A] text-lg font-bold shadow-[3px_3px_0_#22183A]"
          >
            {item.symbol}
          </div>
        ))}

        <header className="pointer-events-none relative z-30 flex justify-center px-4 pt-4">
          <nav className="ruler-ticks pointer-events-auto flex items-center gap-2 rounded-2xl border-2 border-[#22183A] bg-[#FFFFFF]/90 px-3 pt-2 pb-3 shadow-[4px_4px_0_#22183A] backdrop-blur-xs sm:gap-4 sm:px-4">
            <a
              href={TARGET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-[#22183A] bg-[#FFF0B8] px-2.5 py-1 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
            >
              <span>✳</span>
              <span className="font-pixel text-sm">Naa</span>
            </a>

            <div className="flex items-center gap-1 rounded-xl border border-[#22183A]/15 bg-[#FAF8FF] p-1">
              <button
                type="button"
                aria-label="Grid board"
                onClick={() => {
                  setSurface("grid");
                  playTone(520, 0.05);
                }}
                className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                  surface === "grid" ? "bg-[#E7DCFF] text-[#22183A]" : "text-[#22183A]/50 hover:text-[#22183A]"
                }`}
              >
                <FiGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Dotted board"
                onClick={() => {
                  setSurface("dots");
                  playTone(580, 0.05);
                }}
                className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                  surface === "dots" ? "bg-[#FFD6EC] text-[#22183A]" : "text-[#22183A]/50 hover:text-[#22183A]"
                }`}
              >
                <FiMoreHorizontal className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Clean board"
                onClick={() => {
                  setSurface("clean");
                  playTone(640, 0.05);
                }}
                className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                  surface === "clean" ? "bg-[#CCF5E1] text-[#22183A]" : "text-[#22183A]/50 hover:text-[#22183A]"
                }`}
              >
                <FiSquare className="h-3 w-3" />
              </button>
            </div>

            <button
              type="button"
              aria-label="Toggle sound"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl border border-[#22183A]/20 bg-[#FAF8FF] text-[#22183A] transition-colors hover:bg-[#E7DCFF]"
            >
              {soundEnabled ? <FiVolume2 className="h-3.5 w-3.5" /> : <FiVolumeX className="h-3.5 w-3.5 opacity-50" />}
            </button>

            <a
              href={TARGET_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                launchDestination();
              }}
              className="group flex items-center gap-1 rounded-xl border border-[#22183A] bg-[#22183A] px-3 py-1 text-xs font-bold text-[#FFFFFF] transition-colors hover:bg-[#3A2861]"
            >
              <span>Go</span>
              <FiArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </nav>
        </header>

        <section className="pointer-events-none relative z-20 flex flex-col items-center px-4 text-center">
          <p className="font-serif-soft mb-1 text-xl italic text-[#22183A]/70 sm:text-2xl">
            sketch freely, or
          </p>

          <h1 className="font-pixel sticker-heading pointer-events-auto flex text-6xl font-bold tracking-wider uppercase sm:text-8xl">
            {TITLE_CHARS.map((char, idx) => (
              <span
                key={idx}
                onMouseEnter={() => playTone(NOTE_FREQS[idx], 0.12, "triangle", 0.04)}
                style={{ color: idx >= 5 ? "#FF66B2" : "#22183A" }}
                className="inline-block cursor-default transition-transform duration-150 hover:-translate-y-2.5 hover:rotate-6"
              >
                {char}
              </span>
            ))}
          </h1>

          <div className="pointer-events-auto mt-7 flex items-center gap-3">
            <div
              onPointerDown={handleKeyPointerDown}
              onPointerMove={handleKeyPointerMove}
              onPointerUp={handleKeyPointerUp}
              style={{
                transform: `translate(${keyOffset.x}px, ${keyOffset.y}px) ${
                  isDraggingKey ? "scale(1.12) rotate(-12deg)" : "rotate(-8deg)"
                }`,
              }}
              title="Drag to Enter"
              className="z-30 flex h-12 w-12 cursor-grab touch-none items-center justify-center rounded-2xl border-2 border-[#22183A] bg-[#FFF0B8] shadow-[3px_3px_0_#22183A] transition-shadow hover:bg-[#FFD6EC] active:cursor-grabbing"
            >
              <FiKey className="h-5 w-5" />
            </div>

            <a
              ref={portalBtnRef}
              href={TARGET_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                launchDestination();
              }}
              className={`group inline-flex items-center gap-3 rounded-full border-2 border-[#22183A] px-8 py-3.5 text-base font-extrabold shadow-[0_5px_0_#22183A] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_0_#22183A] active:translate-y-1 active:shadow-[0_1px_0_#22183A] sm:px-9 sm:py-4 sm:text-lg ${
                isKeyOverPortal
                  ? "scale-110 bg-[#FFF0B8] ring-4 ring-[#FF66B2]/40"
                  : "bg-[#CCF5E1] hover:bg-[#E7DCFF]"
              }`}
            >
              <span>{isKeyOverPortal ? "Unlock!" : "Enter"}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#22183A] bg-[#FFFFFF] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <FiArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          </div>
        </section>

        <footer className="pointer-events-none relative z-30 flex justify-center px-3 pb-4">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-[#22183A] bg-[#FFFFFF] px-3 py-2 shadow-[4px_4px_0_#22183A] sm:gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-[#22183A]/15 bg-[#FAF8FF] p-1">
              <button
                type="button"
                aria-label="Marker"
                onClick={() => {
                  setTool("pen");
                  playTone(500, 0.05);
                }}
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                  tool === "pen" ? "bg-[#E7DCFF] text-[#22183A]" : "text-[#22183A]/55 hover:text-[#22183A]"
                }`}
              >
                <FiEdit2 className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                aria-label="Highlighter"
                onClick={() => {
                  setTool("highlighter");
                  playTone(540, 0.05);
                }}
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                  tool === "highlighter" ? "bg-[#FFF0B8] text-[#22183A]" : "text-[#22183A]/55 hover:text-[#22183A]"
                }`}
              >
                <FiEdit3 className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                aria-label="Sparkle brush"
                onClick={() => {
                  setTool("sparkle");
                  playTone(720, 0.06);
                }}
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                  tool === "sparkle" ? "bg-[#FFD6EC] text-[#22183A]" : "text-[#22183A]/55 hover:text-[#22183A]"
                }`}
              >
                <FiStar className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                aria-label="Sticker stamp"
                onClick={() => {
                  setTool("stamp");
                  playTone(660, 0.06);
                }}
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  tool === "stamp" ? "bg-[#CCF5E1] text-[#22183A]" : "text-[#22183A]/55 hover:text-[#22183A]"
                }`}
              >
                {STAMP_ITEMS[stampIdx].symbol}
              </button>

              <button
                type="button"
                aria-label="Eraser"
                onClick={() => {
                  setTool("eraser");
                  playTone(400, 0.05);
                }}
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-xs font-extrabold transition-colors ${
                  tool === "eraser" ? "bg-[#22183A] text-[#FFFFFF]" : "text-[#22183A]/55 hover:text-[#22183A]"
                }`}
              >
                ⌫
              </button>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-[#22183A]/15 bg-[#FAF8FF] px-2.5 py-1.5">
              {INK_PALETTE.map((swatch) => {
                const selected = inkColor === swatch.hex && tool !== "eraser";
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    aria-label={swatch.id}
                    onClick={() => {
                      setInkColor(swatch.hex);
                      if (tool === "eraser" || tool === "stamp") setTool("pen");
                      playTone(580, 0.05);
                    }}
                    style={{ backgroundColor: swatch.hex }}
                    className={`h-4 w-4 cursor-pointer rounded-full border border-[#22183A] transition-transform ${
                      selected ? "scale-125 ring-2 ring-[#22183A]/25" : "opacity-75 hover:opacity-100"
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Undo"
                onClick={handleUndo}
                disabled={!canUndo}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#22183A] bg-[#FAF8FF] transition-colors hover:bg-[#E7DCFF] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <FiRotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                aria-label="Wipe board"
                onClick={handleWipeBoard}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#22183A] bg-[#FFD6EC] transition-colors hover:bg-[#FFF0B8]"
              >
                <FiTrash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}