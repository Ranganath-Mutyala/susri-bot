"use client";
import { useEffect } from "react";

/**
 * Injects an admin-provided tracking snippet (e.g. the BeMob Landing Page
 * pixel) into <head> or <body>. Using createContextualFragment makes any
 * <script> tags in the snippet execute, which plain innerHTML would not do.
 */
export function PixelInjector({ html, placement = "head", id }: { html: string; placement?: string; id: string }) {
  useEffect(() => {
    if (!html?.trim()) return;
    const marker = `pixel-${id}`;
    if (document.querySelector(`[data-pixel="${marker}"]`)) return; // avoid double-inject (StrictMode / re-render)
    const target = placement === "body" ? document.body : document.head;
    const fragment = document.createRange().createContextualFragment(html);
    const nodes = Array.from(fragment.childNodes);
    nodes.forEach((n) => {
      if (n instanceof Element) n.setAttribute("data-pixel", marker);
      target.appendChild(n);
    });
  }, [html, placement, id]);
  return null;
}
