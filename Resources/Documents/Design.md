Rescue Earth should visually communicate:

- Environmental responsibility
- Sustainability
- Community participation
- Hope
- Transparency
- Scientific credibility
- Positive environmental action

Avoid overly corporate, futuristic, dark, or aggressive visual styles.

---

# 3. Color System

## Primary Green

```css
--green-primary: #0B8F2F;

Usage:
- Primary CTA buttons
- Active navigation indicators
- Important links
- Brand highlights
- Icons
- Interactive arrows
- Selected states
Dark Green
--green-dark: #08752A;

Usage:
- Hover states
- Dark environmental sections
- Strong emphasis
- Large statistics
- Secondary brand elements
Brand Green
--green-brand: #137D43;

Usage:
- Logo text
- Highlighted headings
- Environmental labels
- Supporting branding
Light Green
--green-light: #BDF58E;

Usage:
- Icon backgrounds
- Circular feature containers
- Badges
- Soft highlights
- Secondary environmental accents
Pale Green
--green-pale: #E8FAD9;

Usage:
- Decorative backgrounds
- Hero shapes
- Subtle highlighted areas
- Hover backgrounds
White
--white: #FFFFFF;

Primary page background and card surface.
Off White
--off-white: #FAFBFA;

Used to distinguish large sections without introducing strong visual separation.
Primary Text
--text-primary: #0A0A0A;

Used for:
- Headings
- Navigation
- Important statistics
- Strong labels
Secondary Text
--text-secondary: #4D514F;

Used for:
- Paragraphs
- Supporting descriptions
- Metadata
- Secondary labels
Border
--border: #E7EAE7;

Use extremely subtle borders.
4. Color Usage Rule
The website should follow approximately:
- 70% White / Off-white
- 20% Green
- 10% Light/Pale Green
Green should remain meaningful rather than covering the entire interface.
Do not reintroduce the original yellow CTA system.
All primary actions should use green.
5. Typography
Use a modern geometric sans-serif.
Recommended fonts:
1. Poppins
2. Inter
3. Manrope
Preferred implementation:
font-family: "Poppins", "Inter", sans-serif;

Display Heading
Example:
Rescue Earth
Protect Life

Style:
font-size: clamp(3rem, 5vw, 5.5rem);
font-weight: 700;
line-height: 0.98;
letter-spacing: -0.035em;

Use black for the primary phrase and green for environmental/action emphasis.
Section Heading
Example:
We're on a mission
to protect our planet.

font-size: clamp(2rem, 3vw, 3rem);
font-weight: 700;
line-height: 1.1;

Card Heading
font-size: 1rem;
font-weight: 600;

Body Text
font-size: 1rem;
font-weight: 400;
line-height: 1.6;
color: var(--text-secondary);

Eyebrow / Section Label
Example:
ABOUT US

font-size: 0.75rem;
font-weight: 600;
letter-spacing: 0.08em;
text-transform: uppercase;

Add a short green horizontal line before the label where appropriate.
6. Layout System
Use a centered maximum-width container.
.container {
  width: min(90%, 1400px);
  margin-inline: auto;
}

Desktop layout should feel wide and spacious.
Recommended breakpoints:
Mobile       < 640px
Tablet       640–1024px
Desktop      1024–1440px
Large        > 1440px

Recommended section spacing:
padding-block: 72px;

Major hero areas can use approximately:
padding-block: 80px;

Maintain generous whitespace.
7. Header / Navigation
The header should remain minimal.
Structure
Left:
- Rescue Earth logo
- Brand tagline underneath
Center:
- Home
- About
- Initiatives
- Get Involved
- Resources
- Contact
Right:
- Search
- Donate button
Active Navigation
The active page should use a small green underline.
Example:
.nav-link.active::after {
  height: 3px;
  background: var(--green-primary);
  border-radius: 10px;
}

Avoid heavy navigation backgrounds.
8. Buttons
Primary Button
Examples:
- Take Action
- Donate
- Learn More
Style:
background: var(--green-primary);
color: white;
border-radius: 999px;
padding: 14px 26px;
font-weight: 600;
border: none;

Hover:
background: var(--green-dark);
transform: translateY(-1px);

Buttons should normally include a relevant icon or arrow.
Secondary Button
Example:
Watch Our Story

Style:
background: white;
color: black;
border: 1.5px solid #111;
border-radius: 999px;

Do not fill secondary actions with green unless necessary.
Outline Button
For dark/image backgrounds:
background: transparent;
color: white;
border: 1px solid white;
border-radius: 999px;

9. Hero Section
The hero is the strongest visual section.
Desktop Structure
Use approximately:
45% Content
55% Visual

Left Side
Include:
- Eyebrow
- Main headline
- Supporting paragraph
- Primary CTA
- Secondary CTA
Example:
SMALL ACTIONS 🌿 BIG IMPACT

Rescue Earth
Protect Life

Supporting text should remain around 2–3 lines on desktop.
Right Side
Use:
- High-quality Earth/globe imagery
- Green leaves
- Moss/vegetation
- Soft pale-green organic background shape
- Environmental handwritten statement
Example:
A Greener
Tomorrow
Starts
Today

The image should naturally fade/blend into the white background.
Avoid rectangular stock-photo appearance.
10. Hero Decorative Graphics
Organic shapes should use:
background: var(--green-pale);
border-radius: 50%;

Decorative graphics must remain subtle and should never compete with the globe.
Use green hand-drawn lines around the environmental statement.
11. Impact Feature Strip
Immediately below the hero, display four value propositions.
Example:
Cleaner Environment
Less pollution, healthier lives.

Stronger Communities
People + Nature = Progress.

Sustainable Future
Reduce. Reuse. Recycle.

Global Impact
Local actions, worldwide change.

Each item contains:
- Circular light-green icon container
- Black heading
- Muted description
Desktop:
4 columns

Mobile:
1–2 columns

Use subtle vertical dividers on desktop.
12. Icon System
Use simple outline icons.
Recommended:
- Lucide Icons
- Heroicons
Icons should use:
color: #0A0A0A;
stroke-width: 2;

Place important feature icons inside light-green circular containers.
Typical icons:
- Leaf
- Users
- Recycle
- Globe
- Tree
- Sun
- Droplet
- Heart
- ArrowRight
Avoid mixing multiple icon styles.
13. About Section
Use a two-part layout.
Left
- Small ABOUT US label
- Large mission statement
- Short description
- Learn More CTA
Right
Display initiatives and impact content.
Maintain strong whitespace around the heading.
14. Initiative Cards
Examples:
Reforestation
Planting trees for a greener tomorrow.
Waste Management
Reduce. Reuse. Recycle.
Clean Energy
Powering a sustainable future.
Clean Water
Every drop counts.
Desktop:
2 × 2 grid

Cards should use:
background: #FFFFFF;
border-radius: 12px;
border: 1px solid #F0F2F0;

Each card contains:
[Icon] Heading
       Description                   →

Use pale-green icon circles.
The arrow should use the primary green.
Cards should feel lightweight rather than heavily elevated.
15. Impact Statistics Card
Use a large environmental photograph with a dark green overlay.
Example content:
OUR IMPACT

1.2M+
Trees Planted
500+
Communities Supported
50+
Countries Reached
CTA:
Get Involved →

Overlay:
background:
  linear-gradient(
    90deg,
    rgba(4, 65, 31, 0.88),
    rgba(4, 65, 31, 0.25)
  );

Text should remain white.
The photograph should remain visible while maintaining sufficient contrast.
16. Image Direction
Images should emphasize:
- Healthy forests
- Earth
- Trees
- Water
- Mountains
- Sustainable cities
- Clean communities
- Renewable energy
- Conservation
- Environmental restoration
Avoid:
- Generic corporate stock imagery
- Artificial-looking CGI
- Excessively saturated imagery
- Unrelated lifestyle photography
Photography should feel realistic, bright, natural, and hopeful.
17. Card Design
Use subtle cards.
.card {
  background: #FFFFFF;
  border: 1px solid #EEF1EE;
  border-radius: 14px;
}

Avoid strong shadows.
If shadow is required:
box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);

18. Border Radius
Maintain consistent geometry.
Small UI       8px
Cards          12–16px
Large panels   16–20px
Buttons        999px
Icon circles   50%

19. Spacing System
Use an 8px-based spacing system.
4px
8px
12px
16px
24px
32px
48px
64px
80px
96px

Common usage:
Icon → text           16px
Heading → paragraph   16px
Paragraph → CTA       24px
Cards                 16–24px
Section content       48–64px
Major sections        72–96px

20. Interaction & Motion
Animations should remain subtle.
Recommended duration:
transition: all 180ms ease;

Buttons:
Hover → slight lift

Cards:
Hover → subtle elevation

Links:
Hover → green

Arrows:
Hover → translateX(3px)

Do not use excessive animations.
21. Responsive Behaviour
Desktop
- Full navigation
- Two-column hero
- Four-column feature strip
- Multi-column initiative layout
Tablet
- Reduce heading sizes
- Compress navigation
- Maintain two-column layouts where practical
Mobile
Convert hero to:
Headline
Description
CTAs
Earth Visual

Navigation should collapse into a mobile menu.
Feature strip:
1 column or 2 columns

Initiatives:
1 column

Impact card:
Full width

Buttons should remain easily tappable.
Minimum touch target:
44 × 44px

22. Accessibility
Maintain WCAG-friendly contrast.
Requirements:
- All images require alt text
- Buttons require accessible labels
- Keyboard navigation must work
- Focus states must be visible
- Do not communicate information through color alone
- Respect prefers-reduced-motion
- Avoid very light green text on white
- Body text should generally remain ≥16px
23. Footer Style
Keep the footer clean and minimal.
Decorative botanical line illustrations may appear near the left and right edges.
Central tagline:
CLEANER EARTH • HEALTHIER LIVES • SUSTAINABLE FUTURE

Use:
- Muted gray typography
- Green botanical illustrations
- Generous whitespace
24. Visual Hierarchy
Every page should follow:
1. Strong page/section headline
2. Supporting explanation
3. Main visual/content
4. Primary action
5. Secondary information

Never allow multiple elements to compete equally for attention.
25. Design Consistency Rules
Across the entire Rescue Earth website:
1. Primary CTA = green pill button.
2. Green represents action and environmental emphasis.
3. Light green represents supportive/decorative information.
4. Black is used for important typography.
5. Gray is used for secondary information.
6. White remains the dominant background.
7. Icons follow one consistent outline style.
8. Cards use subtle borders rather than heavy shadows.
9. Maintain generous whitespace.
10. Use consistent rounded geometry.
11. Environmental imagery must feel realistic.
12. Avoid unnecessary gradients.
13. Avoid glassmorphism.
14. Avoid neon colors.
15. Avoid excessive animation.
26. Core Design Tokens
:root {
  /* Brand */
  --green-primary: #0B8F2F;
  --green-dark: #08752A;
  --green-brand: #137D43;
  --green-light: #BDF58E;
  --green-pale: #E8FAD9;

  /* Neutral */
  --white: #FFFFFF;
  --off-white: #FAFBFA;
  --text-primary: #0A0A0A;
  --text-secondary: #4D514F;
  --border: #E7EAE7;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-pill: 999px;

  /* Spacing */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 48px;
  --space-xl: 72px;
  --space-2xl: 96px;

  /* Motion */
  --transition-fast: 180ms ease;
}

27. Final Design Principle
Every screen should answer one question:
Does this make environmental information easier to understand and environmental action easier to take?

The Rescue Earth interface should never feel cluttered or overly decorative.
The final visual identity should be:
Clean • Green • Human • Trustworthy • Hopeful • Action-Oriented
```