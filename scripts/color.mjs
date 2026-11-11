// Just enough color math for the build and tests: parse the formats tokens.json uses
// (hex, hsl/hsla, oklch) into sRGB, then derive hex fallbacks and WCAG contrast.

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function parseHex(str) {
	let h = str.slice(1);
	if (h.length === 3) h = [...h].map((c) => c + c).join("");
	if (h.length !== 6) return null;
	return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

function parseHsl(str) {
	const m = str.match(/^hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%[\s,]+([\d.]+)%/);
	if (!m) return null;
	const [h, s, l] = [Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100];
	const k = (n) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	return [0, 8, 4].map((n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
}

function parseOklch(str) {
	const m = str.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/);
	if (!m) return null;
	const L = m[2] ? Number(m[1]) / 100 : Number(m[1]);
	const C = Number(m[3]);
	const hr = (Number(m[4]) * Math.PI) / 180;
	const a = C * Math.cos(hr);
	const b = C * Math.sin(hr);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const lin = [
		4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
	];
	// Out-of-gamut values (the dark-mode greens and pinks) are clipped to the sRGB cube.
	return lin.map((c) => toGamma(clamp01(c)));
}

/** Parse a color literal into sRGB channels 0–1, or null if it isn't a plain literal. */
export function parseColor(str) {
	const s = str.trim().toLowerCase();
	if (s.startsWith("#")) return parseHex(s);
	if (s.startsWith("hsl")) return parseHsl(s);
	if (s.startsWith("oklch")) return parseOklch(s);
	return null;
}

export function toHex(rgb) {
	return `#${rgb
		.map((c) => Math.round(clamp01(c) * 255).toString(16).padStart(2, "0"))
		.join("")}`;
}

export function luminance(rgb) {
	const [r, g, b] = rgb.map((c) => toLinear(clamp01(c)));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}
