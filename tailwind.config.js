/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "iron-dark":       "#080808",
        "iron-dark2":      "#0d0d0d",
        "iron-card":       "#111111",
        "iron-card2":      "#161616",
        "iron-card3":      "#1a1a1a",
        "iron-border":     "#1e1e1e",
        "iron-border2":    "#2a2a2a",
        "iron-red":        "#e53935",
        "iron-red-dark":   "#b71c1c",
        "iron-gray":       "#666666",
        "iron-gray-light": "#999999",
        "iron-gray-mid":   "#444444",
        "iron-white":      "#f0f0f0",
      },
      fontFamily: {
        display: ["var(--font-barlow-condensed)", "Oswald", "sans-serif"],
        body:    ["var(--font-barlow)", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      animation: {
        "fade-in-up":      "fadeInUp 0.5s ease forwards",
        "fade-in":         "fadeIn 0.4s ease forwards",
        "spin-slow":       "spinSlow 3s linear infinite",
        "pulse-dot":       "pulseDot 2s ease-in-out infinite",
        "slide-in-right":  "slideInRight 0.35s ease forwards",
        shimmer:           "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeInUp:     { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn:       { from: { opacity: "0" },                                to: { opacity: "1" } },
        spinSlow:     { from: { transform: "rotate(0deg)" },                   to: { transform: "rotate(360deg)" } },
        pulseDot:     { "0%, 100%": { opacity: "1", transform: "scale(1)" },   "50%": { opacity: "0.3", transform: "scale(0.7)" } },
        slideInRight: { from: { opacity: "0", transform: "translateX(20px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        shimmer:      { from: { backgroundPosition: "-200% center" },          to: { backgroundPosition: "200% center" } },
      },
    },
  },
  plugins: [],
};
