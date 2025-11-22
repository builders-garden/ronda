# Circles Page

The Circles page displays all of a user's Ronda circles (both active and completed) with detailed information about each.

## Features

### Header
- Fixed header with back button and "Your Circles" title
- Clean, minimal design matching the app's aesthetic

### Tabs
- **Active Tab**: Shows circles with status "active" or "deposit_due"
- **Completed Tab**: Shows circles that have finished their cycles
- Animated underline indicator for active tab
- Custom styling to match Figma design

### Circle Cards
Each card displays:
- Circle name and status badge
- Member count and weekly contribution amount
- Alert section (for deposit due or completed circles)
- Progress bar showing current week vs total weeks
- Member avatars (showing first 4 + count of remaining)
- Current/Final pot amount
- Next/Last payout date

### Status Types

1. **Deposit Due (Active)**
   - Yellow alert background
   - "Deposit Due" message with warning icon
   - "Pay Now" button in yellow
   - Shows as active circle in active tab

2. **Active**
   - No special alert
   - Clean card display
   - Shows current pot and next payout

3. **Completed**
   - Purple/blue alert background
   - "Circle Complete!" message with checkmark icon
   - "View Summary" button in primary color
   - Shows final pot and last payout
   - Displayed in completed tab

## Layout

- Full-width responsive design
- Cards stacked vertically with consistent spacing
- Bottom padding to account for fixed navigation
- Sticky header that stays visible on scroll

## Design System

The page uses the app's existing design tokens:
- Colors: primary, muted, warning, zinc palette
- Typography: Matching font weights and sizes from Figma
- Spacing: Consistent with the rest of the app
- Border radius: Rounded cards with smooth corners

## Data Structure

Currently uses mock data. Future implementation will fetch from:
- Active circles API endpoint
- Completed circles API endpoint
- Real-time updates for deposit status and pot amounts

