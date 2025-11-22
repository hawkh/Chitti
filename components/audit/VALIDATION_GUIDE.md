# Audit Form Validation and Progress Tracking Guide

This guide explains the validation and progress tracking features implemented in the ISO Audit Form Engine.

## Overview

The audit form includes comprehensive validation and progress tracking to ensure data quality and guide users through the audit process.

## Features Implemented

### 1. Real-Time Form Validation

The form validates responses as users interact with it, providing immediate feedback.

#### Validation Rules

**Required Fields:**
- All items marked as "Required" must have a response before submission
- Error displayed: "Required: [Section Name] must be answered"

**Fail Responses:**
- Must include a severity level (Low, Medium, High, Critical)
- Error displayed: "Severity level is required for failed items"
- Recommended to include comments explaining the failure
- Warning displayed: "Comments are recommended to explain the failure"

**Evidence Requirements:**
- Items marked as requiring evidence show a warning if no evidence is attached
- Warning displayed: "Evidence is recommended for this item"

#### Validation Levels

**Errors (Red):**
- Block form submission
- Must be fixed before audit can be submitted
- Examples: Missing required fields, fail responses without severity

**Warnings (Yellow):**
- Do not block submission
- Recommendations to improve audit quality
- Examples: Missing comments on failures, missing evidence

### 2. Progress Tracking

#### Overall Progress Indicator

Located at the top of the form, shows:
- **Percentage Complete**: Visual progress bar (0-100%)
- **Items Answered**: "X of Y items" counter
- **Required Fields**: "X / Y required" with color coding
  - Green when all required fields complete
  - Orange when required fields remain

#### Section Progress

Each collapsible section displays:
- **Percentage badge**: Shows completion percentage for that section
- **Item counter**: "X/Y items" answered in section
- **Required counter**: "X/Y required" for required items in section
- **Visual indicator**: 
  - Green checkmark when section is 100% complete
  - Blue percentage badge when incomplete

### 3. Submission Validation

When clicking "Submit for Review":

1. **Full validation runs** on all form fields
2. **Validation summary appears** showing:
   - Total errors that must be fixed
   - List of missing required fields (up to 5 shown)
   - Warnings and recommendations
3. **Auto-scroll to first error** for easy correction
4. **Submission blocked** until all errors resolved

#### Validation Summary Messages

**Errors Present:**
```
Cannot submit - please fix the following errors:
X required field(s) need to be answered, Y failed item(s) need severity levels
• Context of the Organization (Clause 4.1)
• Leadership and Commitment (Clause 5.1)
... and X more
```

**Warnings Only:**
```
Recommendations to improve audit quality:
X item(s) could benefit from additional details
```

**Ready to Submit:**
```
Ready to submit!
All required fields are complete. Click Submit for Review to continue.
```

## Usage Examples

### Example 1: Starting a New Audit

```typescript
<AuditFormEngine
  onSave={(data) => saveDraft(data)}
  onSubmit={(data) => submitAudit(data)}
/>
```

**User Experience:**
1. Form loads with 0% progress
2. User expands first section
3. Answers questions - progress updates in real-time
4. Required field indicator shows "0/26 required"
5. As user answers, counter updates: "5/26 required"

### Example 2: Handling Validation Errors

```typescript
// User clicks Submit with incomplete form
// Validation runs automatically
// Error summary appears:
"Cannot submit - please fix the following errors:
21 required field(s) need to be answered"

// Form scrolls to first unanswered required field
// Field is highlighted with red background
// Error message shown: "Required: Understanding the Organization must be answered"
```

### Example 3: Completing a Section

```typescript
// User answers all items in "Context of the Organization" section
// Section header updates:
// - Badge changes from "50%" to green checkmark
// - Counter shows "4/4 items"
// - Required counter shows "4/4 required" in green
```

## API Reference

### Validation Functions

#### `validateAuditForm(formData: AuditFormData): DetailedValidationResult`

Validates the entire audit form.

**Returns:**
```typescript
{
  isValid: boolean;              // True if no errors
  errors: Record<string, string>; // Error messages by item ID
  warnings: Record<string, string>; // Warning messages by item ID
  detailedErrors: ValidationError[]; // Full error details
  missingRequired: string[];     // IDs of missing required fields
  incompleteFails: string[];     // IDs of fails without severity
  totalErrors: number;           // Count of errors
  totalWarnings: number;         // Count of warnings
}
```

#### `calculateOverallProgress(responses): ProgressStatus`

Calculates overall form completion.

**Returns:**
```typescript
{
  answered: number;          // Total items answered
  total: number;             // Total items in form
  percentage: number;        // Completion percentage (0-100)
  requiredAnswered: number;  // Required items answered
  requiredTotal: number;     // Total required items
}
```

#### `calculateSectionProgress(sectionId, responses): ProgressStatus`

Calculates progress for a specific section.

#### `canSubmitForm(formData): { canSubmit: boolean; reason?: string }`

Checks if form can be submitted.

**Returns:**
```typescript
{
  canSubmit: true  // If all validation passes
}
// OR
{
  canSubmit: false,
  reason: "21 required field(s) need to be answered"
}
```

### Component Props

#### `AuditFormEngine`

```typescript
interface AuditFormEngineProps {
  initialData?: AuditFormData;  // Pre-populate form
  onSave?: (data: AuditFormData) => void;  // Save draft callback
  onSubmit?: (data: AuditFormData) => void; // Submit callback
  readOnly?: boolean;  // Disable editing
}
```

## Visual Indicators

### Progress Bar Colors

- **Blue gradient**: Normal progress (0-99%)
- **Green**: Complete (100%)

### Badge Colors

- **Blue**: Section in progress
- **Green**: Section complete
- **Red**: Required field indicator
- **Orange**: Incomplete required fields

### Validation Colors

- **Red background**: Item with error
- **Red border**: Error message
- **Yellow border**: Warning message
- **Green badge**: Answered item

## Best Practices

### For Developers

1. **Always validate before submission**: Use `canSubmitForm()` to check
2. **Show validation early**: Enable validation summary on first submit attempt
3. **Provide clear feedback**: Use the built-in error messages
4. **Track progress**: Display overall and section progress prominently

### For Users

1. **Complete required fields first**: Focus on red "Required" badges
2. **Add severity to failures**: All fail responses need severity levels
3. **Include comments**: Explain failures and observations
4. **Attach evidence**: Upload photos/videos for documentation
5. **Review warnings**: Address recommendations before submitting

## Testing

Run validation tests:

```bash
npm test -- __tests__/lib/audit/form-validation.test.ts
```

Tests cover:
- Individual response validation
- Form-level validation
- Progress calculation
- Submission checks
- Error message generation

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 1.3**: Form validation before submission
- **Requirement 5.5**: Progress tracking and completion indicators
- Real-time validation with error messaging
- Required field validation
- Progress indicators showing completion percentage

## Future Enhancements

Potential improvements:
- Offline validation caching
- Custom validation rules per organization
- Validation history tracking
- Auto-save on validation pass
- Validation analytics and reporting
