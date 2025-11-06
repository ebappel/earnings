# Design Guidelines: Revenue Growth Calculator

## Design Approach

**Selected Approach:** Design System + Reference-Based Hybrid
- **System Foundation:** Material Design for clean, data-focused interface
- **Reference Inspiration:** Google Sheets, Airtable for familiar spreadsheet-like experience
- **Rationale:** This is a utility-focused calculation tool where efficiency and data clarity are paramount. Users familiar with spreadsheets need immediate recognition of patterns and functionality.

## Core Design Principles

1. **Data-First Layout:** Interface removes all visual noise to spotlight the data table
2. **Instant Recognition:** Spreadsheet-familiar aesthetics for zero learning curve
3. **Calculation Clarity:** Clear visual distinction between input and calculated values
4. **Single-Purpose Focus:** Every element serves the core function of paste-calculate-view

## Typography

**Font Family:** Inter (via Google Fonts CDN)
- Primary UI Text: Inter Regular (400)
- Table Headers: Inter Medium (500)
- Data Values: Inter Regular (400) with tabular numbers
- Helper Text: Inter Regular (400)

**Type Scale:**
- Page Title: text-2xl (24px)
- Section Headers: text-lg (18px)
- Table Headers: text-sm (14px) uppercase
- Table Data: text-base (16px)
- Helper Text: text-sm (14px)

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8
- Component padding: p-4, p-6
- Section spacing: mb-6, mb-8
- Table cell padding: p-4
- Input fields: p-3

**Container Strategy:**
- Max width: max-w-6xl centered
- Horizontal padding: px-6 on mobile, px-8 on desktop
- Vertical spacing: py-8 for main content area

## Component Library

### Input Section
**Paste Area Container:**
- Two-column grid on desktop (grid-cols-2 gap-6)
- Single column on mobile
- Each column: Date input and Revenue input
- Textareas for multi-line paste (rows="12")
- Label above each textarea with clear instructions
- Placeholder text: "Paste dates here..." / "Paste revenue values here..."

### Data Table
**Structure:**
- Three columns: Date | Revenue | YoY Growth %
- Fixed header row with medium weight text
- Alternating row treatment for readability
- Right-aligned numeric values (text-right)
- Date column left-aligned

**Calculated Cell Treatment:**
- YoY Growth % column cells receive blue background highlight (functional requirement)
- Maintain text contrast for readability
- Use monospace-style number formatting for precision

**Table Styling:**
- Border on outer table container
- Horizontal dividers between rows
- Generous cell padding (p-4) for data scanning
- Sticky header on scroll

### Action Buttons
**Clear Data Button:**
- Secondary button style
- Positioned above input textareas
- Icon from Heroicons (trash or x-circle)

**Calculate Button:**
- Primary button style (if needed for manual trigger)
- Positioned between input and results sections

## Icons
**Library:** Heroicons (via CDN)
- Clear/Delete: trash icon
- Paste hint: clipboard icon
- Calculation indicator: calculator icon

## Layout Structure

**Main Container:**
1. **Header Section** (py-6):
   - App title
   - Brief instruction text
   
2. **Input Section** (mb-8):
   - Grid layout with Date and Revenue paste areas
   - Clear button above each textarea
   
3. **Results Section**:
   - Data table with calculated YoY growth
   - Auto-updates as data is pasted

**Responsive Behavior:**
- Desktop: Side-by-side input areas, full table width
- Mobile: Stacked input areas, horizontally scrollable table

## Accessibility
- Proper label associations for textareas
- ARIA labels for calculated cells indicating they're computed values
- Keyboard navigation through table rows
- Clear focus states on inputs
- Sufficient contrast ratios throughout

## Visual Hierarchy
1. Primary focus: Data table with results
2. Secondary: Input textareas for data entry
3. Tertiary: Helper text and instructions
4. Minimal: Header and controls

## Interaction States
**Input Textareas:**
- Default: Neutral border
- Focus: Accent border
- Filled: Subtle background change

**Table:**
- No hover states needed (data-focused, not interactive)
- Calculated cells: Persistent blue background highlight

## Special Considerations
- No hero section needed (utility app)
- No images required (data-focused interface)
- Minimal animations (utility focus)
- Monospace numbers for financial data alignment
- Blue highlighting for calculated cells (user requirement)