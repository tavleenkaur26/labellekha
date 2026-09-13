Redesign the existing MetriCheck prototype visually.
Do not change the current features, page structure, user flows, or core functionality.
Keep:
- Consumer flow
- Producer flow
- Inspector flow
- AI Assistant
- Scan workflow
- Processing flow
- Inspection result
- Reports
- Product/history
- Settings
The main task is to completely upgrade the UI, color palette, visual hierarchy, glassmorphism, spacing, depth, and overall aesthetic.
The current color combination feels flat and visually weak. Replace it with a sophisticated dark-glass premium interface.
1. New Visual Direction
The product should feel:
Dark glassmorphism × premium AI product × elegant enterprise software × soft futuristic interface

It should be:
- dark, but not black
- visually rich, but not distracting
- futuristic, but not cyberpunk
- elegant, not flashy
- high contrast and highly readable
- modern and trendy
- immersive without sacrificing usability
Think of a luxury digital product, not a hacker dashboard.
2. Primary Color Palette
Use this palette consistently.
Main Background — Midnight Navy
#0B1118
Use for:
- page background
- dashboard background
- main app canvas
Secondary Background — Deep Slate
#111A24
Use for:
- side sections
- large panels
- secondary areas
Elevated Surface
#17222D
Use for:
- cards
- tables
- form panels
- report sections
Glass Surface
rgba(23, 34, 45, 0.62)
with:
- backdrop blur: 18–24px
- thin border: rgba(255,255,255,0.08)
- soft shadow
- subtle inner highlight
3. Text Colors
Primary Text
#F4F7FA
Secondary Text
#A7B4C0
Muted Text
#70808E
Disabled Text
#53616D
Do not use pure white everywhere.
Use slightly softened whites to reduce eye strain.
4. Accent Colors
Use accents selectively.
Primary Accent — Ice Cyan
#72D8F4
Use for:
- main buttons
- active navigation
- scanning
- progress
- interactive highlights
Secondary Accent — Soft Violet
#9C8CFF
Use for:
- AI Assistant
- secondary CTAs
- special highlights
Aqua Mint
#64D6C4
Use for:
- success-related accents
- secondary graphs
Warm Gold
#E6B96A
Use for:
- WARNING
- Needs Review
Soft Coral
#EF737A
Use for:
- FAIL
- critical issues
Success
#59C99D
Use for:
- PASS
- compliant results
Do not use bright saturated neon versions of these colors.
5. Gradient System
Use elegant dark gradients, not rainbow gradients.
Primary background gradient:
#0B1118 → #101B26 → #151E2A
Accent gradient:
#72D8F4 → #9C8CFF
Optional soft glow gradient:
rgba(114,216,244,0.18) → rgba(156,140,255,0.08)
Use gradients only for:
- primary CTA
- hero highlights
- selected states
- AI elements
- charts
- visual backgrounds
Do not place gradients on every card.
6. Glassmorphism Style
This is one of the most important visual directions.
Use glass carefully.
Glass panels should have:
- dark translucent surface
- 18–24px backdrop blur
- 1px subtle border
- faint top-left light reflection
- gentle shadow
- slightly lighter hover state
Example:
background:
rgba(20, 30, 40, 0.58)
border:
1px solid rgba(255,255,255,0.08)
box-shadow:
0 12px 40px rgba(0,0,0,0.28)
Do not make cards overly transparent.
Text must remain easy to read.
7. Lighting and Depth
Use soft lighting to create depth.
Add subtle:
- cyan ambient glow
- violet edge glow
- radial gradients
- blurred light blobs
- low-opacity grid texture
Do not add obvious neon beams.
Background should feel dimensional, not flat.
8. Landing Page Redesign
Keep the current landing-page structure but make it more cinematic.
Use:
- midnight navy background
- soft cyan/violet ambient glow
- glass navbar
- large premium headline
- 3D product package
- floating glass declaration chips
Hero headline:
Every label tells a story.
Subline:
Scan. Understand. Validate. Explain. Fix.
Primary CTA:
gradient cyan → violet
Secondary CTA:
dark glass outline
3D package should have:
- soft studio lighting
- subtle reflection
- floating scan indicators
- faint translucent rings
- gentle parallax
Do not make the page too dark.
Use enough bright glass and illuminated surfaces to balance the dark background.
9. Navbar
Make navbar floating and glass-based.
Use:
- dark transparent surface
- 18px blur
- rounded pill-like container
- thin border
- subtle shadow
Active navigation:
- cyan text
- very soft cyan pill background
Primary action button:
cyan-to-violet gradient
10. Sidebar
Use a vertical dark-glass sidebar.
Background:
rgba(13, 22, 31, 0.82)
Active item:
- lighter glass tile
- cyan icon
- cyan label
- subtle edge glow
Inactive items:
- grey text
- soft hover background
Keep sidebar compact and elegant.
11. Dashboard
Redesign dashboard so it does not look like a generic grid.
Use:
- mixed-size glass panels
- one larger compliance overview panel
- compact KPI blocks
- elegant trend chart
- recent activity panel
- latest reports panel
KPI cards:
dark glass surface with a small icon and strong number.
Do not use brightly colored card backgrounds.
Use colored status only in:
- icons
- badges
- small graph highlights
- numbers where useful
12. Charts
Charts should match the premium dark theme.
Use:
- dark transparent plot backgrounds
- thin grid lines
- cyan
- violet
- mint
- amber
Avoid huge labels.
Add soft graph glow only to primary data lines.
13. Upload Page
Use a large centered glass drop-zone.
The drop-zone should have:
- dark translucent surface
- dotted cyan border
- soft hover glow
- large upload icon
- clear instructions
Uploaded images should appear as premium thumbnail cards.
Progress stepper:
Upload → Analyze → Review → Report
Use a thin glowing cyan progress line.
14. Processing Page
Make this visually impressive.
Use:
- centered product image
- subtle animated scan line
- OCR boxes appearing gradually
- floating declaration labels
- dark glass progress panel
Show:
- Preparing image
- Extracting text
- Identifying declarations
- Validating rules
- Reviewing readability
- Checking placement
- Generating result
Active step:
cyan
Completed:
mint
Pending:
muted slate
15. Inspection Result Page
Keep the two-column layout.
Left
Large evidence image inside a dark glass viewer.
Viewer controls:
- zoom
- image tabs
- front/back/side
- evidence overlays
Detected regions:
PASS = mint outline
WARNING = amber outline
FAIL = coral outline
Use subtle glow around selected areas only.
Right
Glass result panel.
Tabs:
- All
- Passed
- Review
- Failed
Each finding should be a compact expandable row.
Do not use a large card for every finding.
Expanded item shows:
- detected OCR text
- result
- explanation
- evidence
- Ask AI
16. Status System
Use highly consistent status styling.
PASS
Mint:
#59C99D
WARNING / REVIEW
Gold:
#E6B96A
FAIL
Coral:
#EF737A
Each badge should have:
- soft tinted background
- thin border
- status icon
- text label
Never rely only on color.
17. Consumer Side
Consumer pages should be simpler and lighter visually.
Use:
- fewer data panels
- larger result summary
- less technical information
- stronger visual hierarchy
Consumer dashboard:
- New Scan
- Recent Scans
- Saved Results
- AI Explain
Keep it clean and approachable.
18. Producer Side
Producer interface can be more detailed.
Use:
- pre-check progress
- issue breakdown
- packaging versions
- reports
- history
Producer dashboard should feel more professional and data-rich than Consumer dashboard.
Do not make Consumer and Producer dashboards visually identical.
19. AI Assistant
Use a dedicated glass panel.
AI accent:
soft violet + cyan.
AI messages:
dark translucent bubbles.
User messages:
slightly brighter glass bubbles.
Use:
- icon
- title
- small context label
Example:
Analyzing: Consumer Care Details
Responses should be clean and structured.
Do not make it resemble a social messaging app.
20. Reports
Reports page should feel premium and official.
Use:
- light-dark contrast inside a report preview
- clear typography
- glass frame around report preview
- restrained status colors
Actions:
- Download PDF
- Download Editable Report
Make action buttons elegant and minimal.
21. Forms
Inputs should be dark glass fields.
Default:
deep slate background
Focus:
cyan border + soft glow
Use clear labels above inputs.
Avoid excessively rounded pill inputs.
Use 10–14px corner radius.
22. Buttons
Primary
cyan → violet gradient
Secondary
dark glass with thin border
Tertiary
text button
Destructive
soft coral outline
Buttons should have:
- subtle elevation
- soft hover glow
- 150–200ms transitions
Avoid exaggerated scale animations.
23. Border Radius
Use consistent radius:
- large containers: 20–24px
- cards: 16–18px
- inputs: 10–14px
- buttons: 10–14px
- chips: 999px
Do not make every component pill-shaped.
24. Shadows
Use soft deep shadows:
0 16px 50px rgba(0,0,0,0.30)
For small cards:
0 8px 24px rgba(0,0,0,0.20)
Do not use harsh black shadows.
25. Background Texture
Add subtle premium texture:
- extremely low-opacity grain
- faint geometric grid
- blurred radial light sources
- very subtle depth gradient
Do not use visible patterns everywhere.
26. Motion
Use:
- gentle parallax
- smooth fade-in
- card hover lift
- scan-line animation
- progressive OCR reveal
- chart draw animation
- sidebar transitions
- glass hover highlight
Keep animations between 150–500ms.
Do not use bouncing animations.
27. Important UX Rule
Dark design must never harm visibility.
Every screen should maintain:
- strong readable contrast
- clear hierarchy
- obvious primary actions
- visible status states
- generous spacing
If a decorative effect reduces readability, remove it.
28. Final Design Feeling
The finished product should feel like:
A premium midnight-glass AI compliance platform.

Not:
- hacker software
- government portal
- generic blue dashboard
- oversaturated neon UI
- completely black website
Think:
Dark navy + glass + icy cyan + soft violet + restrained status colors

The UI should look impressive during a hackathon demo while still feeling realistic enough to become a real product.
Final Figma Make Instruction
Redesign the existing prototype visually without changing its functionality or user flow. Replace the current teal/cream palette with a premium midnight-glass system using deep navy-charcoal backgrounds, translucent slate glass panels, icy cyan and soft violet accents, and restrained mint/gold/coral status colors. Increase visual depth through blur, layered surfaces, subtle lighting and smooth animation while maintaining excellent readability. Consumer and Producer experiences must remain clearly differentiated. Avoid generic SaaS layouts, repetitive bright cards, cyberpunk neon, and overly dark surfaces.