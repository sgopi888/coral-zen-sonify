import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        meditation: {
          DEFAULT: "hsl(var(--meditation))",
          foreground: "hsl(var(--meditation-foreground))",
        },
        studio: {
          DEFAULT: "hsl(var(--studio-primary))",
          secondary: "hsl(var(--studio-secondary))",
          accent: "hsl(var(--studio-accent))",
          neutral: "hsl(var(--studio-neutral))",
        },
        "music-wave": "hsl(var(--music-wave))",
        "music-beat": "hsl(var(--music-beat))",
        "audio-glow": "hsl(var(--audio-glow))",
        zen: {
          DEFAULT: "hsl(var(--zen))",
          foreground: "hsl(var(--zen-foreground))",
        },
        peaceful: {
          DEFAULT: "hsl(var(--peaceful))",
          foreground: "hsl(var(--peaceful-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-studio": "var(--gradient-studio)",
        "gradient-waveform": "var(--gradient-waveform)",
        "gradient-audio": "var(--gradient-audio)",
        "gradient-meditation": "var(--gradient-meditation)",
        "gradient-zen": "var(--gradient-zen)",
        "gradient-peaceful": "var(--gradient-peaceful)",
      },
      boxShadow: {
        "studio": "var(--shadow-studio)",
        "waveform": "var(--shadow-waveform)",
        "glow": "var(--shadow-glow)",
        "soft": "var(--shadow-soft)",
        "meditation": "var(--shadow-meditation)",
      },
      transitionTimingFunction: {
        "studio": "var(--transition-studio)",
        "zen": "var(--transition-zen)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
