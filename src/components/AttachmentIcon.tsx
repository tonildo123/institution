import React from 'react';
import { SvgXml } from 'react-native-svg';

// Geometría y colores de los SVG originales en assets/icons/attachments.
const icons = {
  "audio": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#5B21B6\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" xmlns:c2pa=\"http://c2pa.org/manifest\">\n  <rect x=\"9\" y=\"2\" width=\"6\" height=\"12\" rx=\"3\"/>\n  <path d=\"M5 10a7 7 0 0014 0\"/>\n  <path d=\"M12 17v4\"/>\n  <path d=\"M8 21h8\"/>\n</svg>\n",
  "camara": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#3CAA5C\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" xmlns:c2pa=\"http://c2pa.org/manifest\">\n  <path d=\"M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z\"/>\n  <circle cx=\"12\" cy=\"13\" r=\"3.3\"/>\n</svg>\n",
  "documento": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#C62828\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" xmlns:c2pa=\"http://c2pa.org/manifest\">\n  <path d=\"M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8z\"/>\n  <path d=\"M14 2v6h6\"/>\n</svg>\n",
  "enlace": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#3B6FC4\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" xmlns:c2pa=\"http://c2pa.org/manifest\">\n  <path d=\"M9 15l6-6\"/>\n  <path d=\"M8 13l-2 2a3.5 3.5 0 105 5l3-3\"/>\n  <path d=\"M16 11l2-2a3.5 3.5 0 10-5-5l-3 3\"/>\n</svg>\n",
  "galeria": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#F0A93B\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" xmlns:c2pa=\"http://c2pa.org/manifest\">\n  <rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/>\n  <circle cx=\"8.5\" cy=\"9.5\" r=\"1.5\"/>\n  <path d=\"M21 16l-5-5-4 4-3-3-5 5\"/>\n</svg>\n"
} as const;

export type AttachmentIconName = keyof typeof icons;
export const AttachmentIcon = ({ name }: { name: AttachmentIconName }) => (
  <SvgXml xml={icons[name]} width={28} height={28} />
);
