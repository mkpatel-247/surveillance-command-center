import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const SCANLINE_COLOR = 'rgba(0, 212, 255, 0.03)';
const NOISE_ALPHA = 0.012;

function drawFrame(ctx: CanvasRenderingContext2D, width: number, height: number, cameraId: number, tick: number) {
  // Base dark background with slight color variation per camera
  const baseColors: [number, number, number][] = [
    [8, 14, 30],
    [10, 16, 12],
    [14, 10, 22],
    [14, 12, 8],
  ];
  const [r, g, b] = baseColors[(cameraId - 1) % baseColors.length];
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, width, height);

  // Film grain / noise
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.8));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 1.2));
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);

  // Scanlines
  ctx.fillStyle = SCANLINE_COLOR;
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }

  // Moving scanline sweep
  const sweepY = (tick * 1.5) % (height + 40) - 20;
  const sweepGrad = ctx.createLinearGradient(0, sweepY - 10, 0, sweepY + 10);
  sweepGrad.addColorStop(0, 'transparent');
  sweepGrad.addColorStop(0.5, 'rgba(0, 212, 255, 0.06)');
  sweepGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sweepGrad;
  ctx.fillRect(0, sweepY - 10, width, 20);

  // Corner vignette
  const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, height * 0.8);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // Random static glitch strip (rare)
  if (Math.random() < NOISE_ALPHA) {
    const glitchY = Math.random() * height;
    const glitchH = Math.random() * 4 + 1;
    ctx.fillStyle = `rgba(0, 212, 255, ${Math.random() * 0.15})`;
    ctx.fillRect(0, glitchY, width, glitchH);
  }
}

export function useCamera(canvasRef: RefObject<HTMLCanvasElement | null>, cameraId: number) {
  const tickRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    const animate = () => {
      tickRef.current += 1;
      drawFrame(ctx, width, height, cameraId, tickRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasRef, cameraId]);
}
