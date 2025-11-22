# Profile Page Implementation

## Overview
This profile page implements the Figma design for the user profile screen in the Ronda app.

## Structure

### Main Component: `index.tsx`
- Fetches user data from auth context and Farcaster context
- Handles avatar URL formatting for both miniapp and standard users
- Displays user name and email
- Contains Settings button in the header
- Uses motion animations for page transitions

### Sub-components

#### `ProfileHeader`
- Displays user avatar (96px) with ring border
- Shows user name and email
- Displays reliability badge with shield icon (98%)

#### `ProfileStats`
- Grid layout (2x2) of stat cards
- Shows:
  - Circles Joined: 12
  - Total Saved: $8,450
  - Payouts Received: 8
  - Active Circles: 3

#### `StatCard`
- Reusable card component for statistics
- Features:
  - Icon with customizable background color
  - Label (uppercase, small text)
  - Value (large, bold text)
  - Rounded card with border

#### `SupportSection`
- Contains "What is a ROSCA?" button
- Opens modal when clicked
- Uses existing `WhatIsRoscaModal` component

## Design Features

### Colors & Styling
- Uses project's design tokens from globals.css
- Colors: `primary`, `success`, `warning`, `muted`, `muted-foreground`
- Consistent border radius: `rounded-3xl` for cards
- Drop shadow: `drop-shadow-xs`

### Interactions
- Framer Motion animations
- `whileTap` scale effects on buttons
- Smooth fade-in transitions

### Responsive
- Mobile-first design (430px width reference from Figma)
- Grid layout for stats
- Proper spacing with gap utilities

## Integration
- Connected to auth context for user data
- Connected to Farcaster context for miniapp users
- Uses existing navbar navigation
- Page switches handled by PageContent context

## Future Enhancements
- Make stats dynamic from API/database
- Add settings functionality
- Add profile editing capability
- Connect reliability score to real data

