# Create Ronda Modal - Component Structure

## Overview

The Create Ronda Modal has been refactored into multiple smaller, maintainable components while sharing state through a centralized context. This makes the code more organized and easier to maintain.

## File Structure

```
components/pages/home/components/
├── create-ronda-modal.tsx       # Main modal container
├── create-ronda-context.tsx     # Shared state management
├── step-1-basic-info.tsx        # Step 1: Basic Information
├── step-2-contribution.tsx      # Step 2: Contribution Setup
├── step-3-participants.tsx      # Step 3: Participants & Verification
└── step-4-review.tsx            # Step 4: Review & Confirm
```

## Component Descriptions

### 1. `create-ronda-context.tsx`
**Purpose**: Manages all shared state for the form

**Exports**:
- `CreateRondaProvider` - Context provider component
- `useCreateRonda()` - Hook to access form state and actions
- `Participant` type - Participant data structure

**State Managed**:
- Basic Details (rosca name, description)
- Contribution Setup (amount, frequency, start date)
- Participants list
- Verification Requirements (age, gender, nationality, proof of human)

**Key Functions**:
- `updateFormData()` - Update any form field
- `resetFormData()` - Reset to initial state
- `canProceedFromStep()` - Validation for each step
- `totalPot` - Calculated total pot amount

### 2. `create-ronda-modal.tsx`
**Purpose**: Main modal container with navigation

**Responsibilities**:
- Wraps content with `CreateRondaProvider`
- Manages current step navigation
- Renders step components based on current step
- Handles modal open/close state
- Contains the "Create ROSCA" submission handler

**Key Function**:
```typescript
const handleCreateRosca = () => {
  // TODO: Implement API call here
  console.log("Creating ROSCA with:", formData);
  // Example API call:
  // await fetch('/api/rondas', {
  //   method: 'POST',
  //   body: JSON.stringify(formData),
  // });
  handleClose();
};
```

### 3. `step-1-basic-info.tsx`
**Purpose**: Step 1 - Basic Information form

**Fields**:
- ROSCA Name (required)
- Description (optional)

### 4. `step-2-contribution.tsx`
**Purpose**: Step 2 - Contribution Setup form

**Fields**:
- Contribution Amount per Cycle (required)
- Frequency (weekly, biweekly, monthly, quarterly)
- Start Date (required)

**Features**:
- Auto-calculates total pot based on participants and amount
- Shows informational card about how ROSCA works

### 5. `step-3-participants.tsx`
**Purpose**: Step 3 - Participants & Verification Requirements

**Features**:
- Search and add participants
- Verification toggles:
  - Proof of Human
  - Age Verification (with min/max age inputs)
  - Gender Verification (with gender selection)
  - Nationality Verification (with multi-select countries)
- Shows current participants list
- Minimum 3 participants required

### 6. `step-4-review.tsx`
**Purpose**: Step 4 - Review & Confirm all details

**Features**:
- Displays summary of all form data
- "Edit" buttons to go back to specific steps
- Shows calculated schedule (first payout, duration, final payout)
- Ready-to-create confirmation message

**Props**:
- `onEditStep?: (step: number) => void` - Callback to navigate to a specific step

## How to Use

### Basic Usage

```tsx
import { CreateRondaModal } from './components/pages/home/components/create-ronda-modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CreateRondaModal
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  );
}
```

### Accessing Form Data in Context

All step components automatically have access to the shared state:

```tsx
import { useCreateRonda } from './create-ronda-context';

function MyStepComponent() {
  const { formData, updateFormData, totalPot } = useCreateRonda();

  // Read data
  console.log(formData.roscaName);

  // Update data
  updateFormData('roscaName', 'New Name');

  // Use calculated values
  console.log(`Total pot: $${totalPot}`);
}
```

## API Integration

To integrate with your backend API, update the `handleCreateRosca` function in `create-ronda-modal.tsx`:

```typescript
const handleCreateRosca = async () => {
  try {
    const response = await fetch('/api/rondas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to create ROSCA');
    }

    const result = await response.json();
    console.log('ROSCA created:', result);
    
    // Show success message (e.g., using toast)
    // toast.success('ROSCA created successfully!');
    
    handleClose();
  } catch (error) {
    console.error('Error creating ROSCA:', error);
    // Show error message
    // toast.error('Failed to create ROSCA');
  }
};
```

## Form Data Structure

When the form is submitted, the complete `formData` object contains:

```typescript
{
  // Basic Details
  roscaName: string,
  description: string,
  
  // Contribution Setup
  contributionAmount: string,
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly",
  startDate: string, // ISO date format
  
  // Participants
  participants: Array<{
    id: string,
    name: string,
    username: string,
    avatar?: string,
    status: "joined" | "pending",
    isHost?: boolean
  }>,
  searchQuery: string,
  
  // Verification Requirements
  proofOfHuman: boolean,
  ageVerification: boolean,
  minAge: string,
  maxAge: string,
  genderVerification: boolean,
  allowedGenders: string,
  nationalityVerification: boolean,
  allowedNationalities: string[]
}
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each step is isolated in its own component
2. **Shared State**: All components access the same data through context
3. **Easy to Test**: Individual components can be tested in isolation
4. **Maintainable**: Changes to one step don't affect others
5. **Reusable**: Step components could be reused in other flows
6. **Type Safety**: Full TypeScript support with proper types
7. **Clean API Integration**: Single point to collect all data for API submission

## Next Steps

1. Implement the actual API call in `handleCreateRosca()`
2. Add loading states during API calls
3. Add error handling and user feedback
4. Connect participant search to real user database
5. Add form validation messages
6. Consider adding animation transitions between steps

