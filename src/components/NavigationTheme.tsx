"use client"

import { useEffect, useState } from "react"

export function NavigationTheme() {
  const [navColor, setNavColor] = useState<string>("")

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_color")
    if (saved) setNavColor(saved)

    const handleLocal = () => {
      const clr = localStorage.getItem("sidebar_color");
      if (clr) setNavColor(clr);
    }
    window.addEventListener("sidebar_color_changed", handleLocal)
    window.addEventListener("storage", (e) => {
      if (e.key === "sidebar_color") setNavColor(e.newValue || "")
    })

    return () => {
      window.removeEventListener("sidebar_color_changed", handleLocal)
    }
  }, [])

  if (!navColor) return null

  const getBrightness = (hex: string) => {
    if (!hex || !hex.startsWith('#')) return 'light'
    hex = hex.replace('#', '')
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
    if (hex.length !== 6) return 'light'
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return yiq >= 128 ? 'light' : 'dark'
  }

  const isDark = getBrightness(navColor) === 'dark'
  const fg = isDark ? '#ffffff' : '#000000'
  const mutedFg = isDark ? '#d1d5db' : '#4b5563'
  const border = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'

  return (
    <style dangerouslySetInnerHTML={{__html: `
      aside, header {
        background-color: ${navColor} !important;
        --foreground: ${fg} !important;
        --muted-foreground: ${mutedFg} !important;
        --border: ${border} !important;
        color: var(--foreground) !important;
        border-color: var(--border) !important;
      }
      header h1, header p, header span, header div {
         color: var(--foreground);
      }
      header svg {
         color: var(--foreground);
      }
      aside svg {
         color: var(--foreground);
      }
    `}} />
  )
}
