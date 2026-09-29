# ResQearth — Design System

## 1. Brand Identity

**Project Name:** ResQearth  
**Tagline:** Protect Life  
**Purpose:** Disaster Management, Early Alerts, Community Support, Preparedness and Environmental Protection.

### Brand Feel

- Safe
- Trustworthy
- Environmental
- Modern
- Clean
- Human-centered
- Emergency-ready

---

# 2. Color Palette

The ResQearth interface uses **white as the primary background**, **green as the main brand color**, **Persian blue for information/environmental elements**, **yellow for attention/highlight states**, and **black/dark navy for text**.

## Primary Colors

| Color | Hex | Usage |
|---|---|---|
| White | `#FFFFFF` | Main background, cards, navbar |
| Deep Green | `#087F5B` | Primary buttons, branding, important actions |
| Forest Green | `#146B4A` | Headings, environmental sections |
| Leaf Green | `#2E8B57` | Nature/environment elements |
| Dark Text | `#10212B` | Main headings and text |
| Persian Blue | `#1261A0` | Information, location, weather, links |
| Yellow | `#F4C542` | Warnings, highlights, attention |
| Teal | `#0E9F88` | Secondary actions and accents |

---

# 3. Supporting Colors

```css
:root {
  /* Brand */
  --color-primary: #087F5B;
  --color-primary-dark: #146B4A;
  --color-primary-light: #DDF4EC;

  /* Environment */
  --color-leaf-green: #2E8B57;
  --color-forest-green: #146B4A;

  /* Information */
  --color-persian-blue: #1261A0;
  --color-blue-light: #EAF5FB;

  /* Warning / Highlight */
  --color-yellow: #F4C542;
  --color-yellow-light: #FFF7D6;

  /* Teal */
  --color-teal: #0E9F88;
  --color-teal-light: #DDF5F0;

  /* Text */
  --color-text: #10212B;
  --color-text-secondary: #53636B;
  --color-text-muted: #718087;

  /* Background */
  --color-white: #FFFFFF;
  --color-background: #F8FCFB;
  --color-card: #F0F7F6;

  /* Borders */
  --color-border: #D9E8E4;

  /* Emergency */
  --color-danger: #D93636;
  --color-danger-light: #FDECEC;
s
  /* Success */
  --color-success: #16835B;
}