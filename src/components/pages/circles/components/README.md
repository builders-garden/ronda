# Circles Page Components

This directory contains components specific to the Circles page.

## Components

### CircleCard

The main card component that displays information about a circle (Ronda).

**Props:**
- `name`: string - Name of the circle
- `memberCount`: number - Number of members in the circle
- `weeklyAmount`: string - Weekly contribution amount
- `currentWeek`: number - Current week in the cycle
- `totalWeeks`: number - Total weeks in the cycle
- `currentPot`: string - Current or final pot amount
- `nextPayout?`: string - Date of next payout (for active circles)
- `lastPayout?`: string - Date of last payout (for completed circles)
- `status`: "active" | "deposit_due" | "completed" - Circle status
- `avatars`: string[] - Array of avatar URLs for members
- `groupId?`: string - Backend group ID for fetching participants
- `contractAddress`: Address - Smart contract address

**Status Variants:**
1. **deposit_due**: Yellow alert, shows "Deposit Due" with "Pay Now" button
2. **active**: No alert, clean display with current progress
3. **completed**: Blue/purple alert, shows "Circle Complete!" with "View Summary" button

**Interactions:**
- Clicking on the card opens the RondaDrawer with full circle details
- Action buttons ("Pay Now", "View Summary") stop event propagation to prevent drawer opening
- Each card maintains its own drawer state independently
- The RondaDrawer fetches and displays real participant data from the backend

### InvitationCardWithData

A wrapper component that fetches on-chain and backend data for invitation cards.

**Props:**
- `group`: Group - Backend group object

**Features:**
- Fetches group info from smart contract
- Fetches participants from backend API
- Calculates pot amount, weekly amount, and progress
- Passes all data to InvitationCard component
- Uses RondaDrawer to display full group details with participant list

## Future Improvements

- Add real data fetching
- Implement button action handlers (pay now, view summary)
- Add animations for progress bars
- Add skeleton loading states
- Connect to actual circle data API
- Pass circle data to RondaDrawer for detailed view

