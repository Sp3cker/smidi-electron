/// <reference types="vite/client" />
declare global {
  interface Window {
    clamp: (value: number, min: number, max: number) => number;
  }
}
window.clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));
