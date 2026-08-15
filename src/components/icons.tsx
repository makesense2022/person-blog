/** 栖简风格的内联 SVG 图标(1.8 细描边,避免引入图标库) */
type IconProps = { size?: number; strokeWidth?: number; className?: string };

function base(size: number, strokeWidth: number) {
  return { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
}

export function ArrowDownRight({ size = 20, strokeWidth = 1.8 }: IconProps) {
  return <svg {...base(size, strokeWidth)}><path d="M7 7 17 17M17 7v10H7" /></svg>;
}

export function ArrowUpRight({ size = 18, strokeWidth = 1.8 }: IconProps) {
  return <svg {...base(size, strokeWidth)}><path d="M7 17 17 7M7 7h10v10" /></svg>;
}

export function ArrowRight({ size = 18, strokeWidth = 1.8 }: IconProps) {
  return <svg {...base(size, strokeWidth)}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
}

export function ChevronDown({ size = 16, strokeWidth = 1.8 }: IconProps) {
  return <svg {...base(size, strokeWidth)}><path d="m6 9 6 6 6-6" /></svg>;
}

export function Menu({ size = 23, strokeWidth = 1.8 }: IconProps) {
  return <svg {...base(size, strokeWidth)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export function Close({ size = 23, strokeWidth = 1.8 }: IconProps) {
  return <svg {...base(size, strokeWidth)}><path d="M6 6l12 12M18 6 6 18" /></svg>;
}

export function AtSign({ size = 17, strokeWidth = 1.8 }: IconProps) {
  return <svg {...base(size, strokeWidth)}><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></svg>;
}

export function SearchGlyph({ size = 25, strokeWidth = 1.8 }: IconProps) {
  return <svg {...base(size, strokeWidth)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>;
}
