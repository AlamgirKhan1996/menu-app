"use client";
import { useEffect, useRef } from "react";

export function useOrderSound() {
  const audioCtx = useRef(null);

  function playAlert() {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtx.current;

      // Beautiful 3-tone chime
      const tones = [523.25, 659.25, 783.99]; // C5, E5, G5
      tones.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.4, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
        osc.start(start);
        osc.stop(start + 0.5);
      });
    } catch (e) {
      console.log("Audio error:", e);
    }
  }

  return { playAlert };
}