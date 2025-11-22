# Audit Form Engine

## Overview

The Audit Form Engine is a dynamic, responsive component for conducting ISO 9001:2015 audits. It provides a mobile-first interface with collapsible sections, validation, and progress tracking.

## Features

### ✅ Implemented (Task 2.2)

1. **Responsive Audit Form Component**
   - Mobile-first design with touch-friendly controls
   - Collapsible sections for easy navigation
   - Progress tracking at section and overall levels
   - Visual indicators for completion status

2. **Pass/Fail/N/A Response Handling**
   - Three response options for each checklist item
   - Visual feedback with color-coded buttons
   - Automatic validation of required fields
   - State management for all responses

3. **Comment Fields**
   - Optional comment section for each item
   - Expandable/collapsible interface
   - Support for detailed observations and notes
   - Placeholder text for guidance

4. **Severity Selection**
   - Four severity levels: Low, Medium, High, Critical
   - Automatically shown for "Fail" responses
   - Required field validation for failed items
   - Color-coded severity indicators

### Additional Features

- **Help System**: Inline help text and corrective action templates
- **Validation**: Real-time validation with error messages
- **Draft Saving**: Save progress without submitting
- **Progress Tracking**: Visual progress bars and percentages
- **Evidence Placeholders**: Ready for photo/video upload integration

## Usage

### Basic Implementation

```tsx
import AuditFormEngine from '@/components/audit/AuditFormEngine';

function MyAuditPage() {
  const handleSave = (data: AuditFormData) => {
    // Save draft to database or local storage
    console.log('Saving draft:', data);
  };

  const handleSubmit = (data: AuditFormData) => {
    // Submit audit for review
    console.log('Submitting audit:', data);
  };

  return (
    <AuditFormEngine
      onSave={handleSave}
      onSubmit={handleSubmit}
    />
  );
}
```

### With Initial Data

```tsx
const existingAudit = {
  auditDate: new Date(),
  siteId: 'site-123',
  responses: {
    'ctx_001': {
      itemId: 'ctx_001',
      response: 'pass',
      comments: 'All documentation in order'
    }
  }
};

<AuditFormEngine
  initialData={existingAudit}
  onSave={handleSave}
  onSubmit={handleSubmit}
/>
```

### Read-Only Mode

```tsx
<AuditFormEngine
  initialData={completedAudit}
  readOnly={true}
/>
```

## Component Props

### AuditFormEngine

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `initialData` | `AuditFormData` | No | Pre-populate form with existing data |
| `onSave` | `(data: AuditFormData) => void` | No | Callback when draft is saved |
| `onSubmit` | `(data: AuditFormData) => void` | No | Callback when form is submitted |
| `readOnly` | `boolean` | No | Disable editing (default: false) |

## Data Structure

### AuditFormData

```typescript
interface AuditFormData {
  siteId?: string;
  auditDate: Date;
  responses: Record<string, AuditResponse>;
}
```

### AuditResponse

```typescript
interface AuditResponse {
  itemId: string;
  response: 'pass' | 'fail' | 'na' | null;
  comments?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical' | null;
  evidenceIds?: string[];
}
```

## Validation Rules

1. **Required Fields**: All items marked as `required` must have a response
2. **Severity for Failures**: Failed items must have a severity level selected
3. **Complete Submission**: Form validates all rules before allowing submission
4. **Draft Saving**: No validation required for saving drafts

## Styling

The component uses Tailwind CSS with a consistent design system:

- **Primary Colors**: Blue/Indigo gradient
- **Success**: Green tones
- **Error**: Red tones
- **Warning**: Yellow/Orange tones
- **Neutral**: Gray scale

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- High contrast mode compatible
- Touch-friendly tap targets (minimum 44x44px)
- Clear visual feedback for all interactions

## Performance

- Efficient state management with React hooks
- Lazy rendering of collapsed sections
- Optimized re-renders with proper memoization
- Smooth animations with CSS transitions

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Demo

Visit `/audit/form-demo` to see the component in action with all features enabled.

## Integration Points

### Pending Integrations (Future Tasks)

1. **Evidence Upload** (Task 3.x)
   - Camera integration
   - File upload handling
   - Image compression
   - Thumbnail generation

2. **Offline Support** (Task 4.2)
   - Local storage for drafts
   - Background sync
   - Conflict resolution

3. **API Integration** (Task 5.x)
   - Submit to backend
   - Load existing audits
   - Real-time validation

## Requirements Mapping

This component satisfies the following requirements:

- **Requirement 1.1**: ISO 9001 checklist with 25 standardized fields ✓
- **Requirement 1.2**: Pass/Fail/N/A responses with comment fields ✓
- **Requirement 5.3**: Response validation and criteria explanation ✓

## Related Files

- `lib/audit/iso-checklist.ts` - ISO 9001 checklist configuration
- `types/audit-form.types.ts` - TypeScript type definitions
- `app/audit/form-demo/page.tsx` - Demo page implementation

## Testing

To test the component:

1. Navigate to `/audit/form-demo`
2. Expand different sections
3. Try Pass/Fail/N/A responses
4. Test severity selection for failed items
5. Add comments to items
6. View help text and templates
7. Test validation by submitting incomplete form
8. Save draft and verify data persistence

## Future Enhancements

- [ ] Auto-save functionality
- [ ] Offline queue management
- [ ] Evidence upload integration
- [ ] Real-time collaboration
- [ ] Voice-to-text for comments
- [ ] Smart suggestions based on history
- [ ] Export to PDF preview
