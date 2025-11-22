# Audit Form Engine - Quick Reference Guide

## Component Overview

The `AuditFormEngine` is a production-ready component for conducting ISO 9001:2015 audits with a mobile-first, responsive design.

---

## Quick Start

```tsx
import AuditFormEngine from '@/components/audit/AuditFormEngine';

<AuditFormEngine
  onSave={(data) => console.log('Draft saved:', data)}
  onSubmit={(data) => console.log('Audit submitted:', data)}
/>
```

---

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  ISO 9001:2015 Audit                          85%       │
│  Complete all required fields                 17/20     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [✓] Context of the Organization        ▼               │
│      Clause 4.1-4.4 • 4/4 items                         │
├─────────────────────────────────────────────────────────┤
│  Clause 4.1  [Required]                                 │
│  Has the organization determined external and internal  │
│  issues relevant to its purpose?                        │
│                                                          │
│  Response:                                              │
│  [ Pass ]  [ Fail ]  [ N/A ]                           │
│                                                          │
│  💬 Add Comments                                        │
│  📷 Add Evidence (Photo/Video)                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [ ] Leadership                          ▶               │
│      Clause 5.1-5.3 • 2/3 items                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [Save Draft]                      [Submit for Review]  │
└─────────────────────────────────────────────────────────┘
```

---

## Response Options

### Pass Response
```
┌──────────────────┐
│ ✓ Pass           │  ← Green background when selected
└──────────────────┘
```

### Fail Response (with Severity)
```
┌──────────────────┐
│ ✗ Fail           │  ← Red background when selected
└──────────────────┘

Severity Level: *
┌─────┐ ┌────────┐ ┌──────┐ ┌──────────┐
│ Low │ │ Medium │ │ High │ │ Critical │
└─────┘ └────────┘ └──────┘ └──────────┘
 Yellow   Orange     Red      Purple
```

### N/A Response
```
┌──────────────────┐
│ ⊖ N/A            │  ← Gray background when selected
└──────────────────┘
```

---

## Features Matrix

| Feature | Status | Description |
|---------|--------|-------------|
| Collapsible Sections | ✅ | Click header to expand/collapse |
| Progress Tracking | ✅ | Real-time percentage and counts |
| Pass/Fail/N/A | ✅ | Three response options per item |
| Severity Levels | ✅ | 4 levels for failed items |
| Comments | ✅ | Optional text field per item |
| Help Text | ✅ | Toggle inline help and templates |
| Validation | ✅ | Required fields and severity |
| Evidence Upload | 🔄 | Placeholder ready for integration |
| Draft Saving | ✅ | Save without validation |
| Submit | ✅ | Full validation before submit |

---

## State Flow

```
┌─────────────┐
│   Initial   │
│   (Empty)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     Save Draft
│  Answering  │◄─────────────┐
│   Items     │              │
└──────┬──────┘              │
       │                     │
       │ Submit              │
       ▼                     │
┌─────────────┐              │
│  Validate   │──────────────┘
│             │   Errors
└──────┬──────┘
       │
       │ Valid
       ▼
┌─────────────┐
│  Submitted  │
│  (Success)  │
└─────────────┘
```

---

## Validation Rules

### Required Fields
```typescript
✓ All items marked "Required" must have a response
✗ Cannot submit without required responses
```

### Severity for Failures
```typescript
✓ Failed items must have severity level
✗ Cannot submit failed item without severity
```

### Comments (Optional)
```typescript
✓ Comments are optional for all items
✓ Can be added to any response type
```

---

## Data Structure

### Input (initialData)
```typescript
{
  auditDate: Date,
  siteId?: string,
  responses: {
    'ctx_001': {
      itemId: 'ctx_001',
      response: 'pass',
      comments: 'All good',
      severity: null,
      evidenceIds: []
    }
  }
}
```

### Output (onSave/onSubmit)
```typescript
{
  auditDate: Date,
  siteId?: string,
  responses: {
    [itemId: string]: {
      itemId: string,
      response: 'pass' | 'fail' | 'na',
      comments?: string,
      severity?: 'low' | 'medium' | 'high' | 'critical',
      evidenceIds?: string[]
    }
  }
}
```

---

## Keyboard Shortcuts (Future)

| Key | Action |
|-----|--------|
| `Space` | Toggle section |
| `1` | Select Pass |
| `2` | Select Fail |
| `3` | Select N/A |
| `C` | Toggle comments |
| `H` | Toggle help |
| `S` | Save draft |
| `Enter` | Submit (when valid) |

---

## Mobile Optimizations

### Touch Targets
- Minimum 44x44px for all buttons
- Large tap areas for responses
- Swipe to collapse sections (future)

### Performance
- Lazy rendering of collapsed sections
- Optimized re-renders
- Smooth animations (60fps)

### Offline Support (Future)
- Local storage for drafts
- Background sync
- Offline indicator

---

## Color Scheme

### Primary Actions
- Blue/Indigo gradient: `from-blue-600 to-indigo-600`

### Response States
- Pass: Green `bg-green-100 border-green-500`
- Fail: Red `bg-red-100 border-red-500`
- N/A: Gray `bg-gray-100 border-gray-500`

### Severity Levels
- Low: Yellow `bg-yellow-100 border-yellow-500`
- Medium: Orange `bg-orange-100 border-orange-500`
- High: Red `bg-red-100 border-red-500`
- Critical: Purple `bg-purple-100 border-purple-500`

### Status Indicators
- Complete: Green `text-green-600`
- In Progress: Blue `text-blue-600`
- Error: Red `text-red-600`

---

## Common Use Cases

### 1. New Audit
```tsx
<AuditFormEngine
  onSave={saveDraft}
  onSubmit={submitAudit}
/>
```

### 2. Edit Draft
```tsx
<AuditFormEngine
  initialData={draftData}
  onSave={updateDraft}
  onSubmit={submitAudit}
/>
```

### 3. View Completed
```tsx
<AuditFormEngine
  initialData={completedAudit}
  readOnly={true}
/>
```

### 4. Review Mode
```tsx
<AuditFormEngine
  initialData={submittedAudit}
  readOnly={true}
  // Add review controls separately
/>
```

---

## Troubleshooting

### Issue: Validation errors not clearing
**Solution**: Ensure you're updating the response correctly
```tsx
onUpdate('response', 'pass') // ✓ Correct
onUpdate('response', null)   // ✗ Won't clear error
```

### Issue: Progress not updating
**Solution**: Check that responses have the correct itemId
```tsx
{
  itemId: 'ctx_001',  // ✓ Must match checklist item
  response: 'pass'
}
```

### Issue: Severity not showing
**Solution**: Severity only shows for 'fail' responses
```tsx
response: 'fail'  // ✓ Severity will appear
response: 'pass'  // ✗ Severity hidden
```

---

## Performance Tips

1. **Use initialData for large forms**
   - Pre-populate responses to avoid re-renders

2. **Debounce save operations**
   - Don't save on every keystroke

3. **Lazy load evidence**
   - Load thumbnails on demand

4. **Optimize images**
   - Compress before upload
   - Use thumbnails in form

---

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Full |
| Firefox | Latest | ✅ Full |
| Safari | Latest | ✅ Full |
| Edge | Latest | ✅ Full |
| iOS Safari | 14+ | ✅ Full |
| Chrome Mobile | Latest | ✅ Full |

---

## Accessibility Checklist

- [ ] Keyboard navigation
- [ ] Screen reader labels
- [ ] High contrast mode
- [ ] Focus indicators
- [ ] Error announcements
- [ ] Touch target sizes
- [ ] Color contrast ratios

---

## Testing Checklist

- [x] Section expand/collapse
- [x] Response selection
- [x] Severity selection
- [x] Comment input
- [x] Progress tracking
- [x] Validation display
- [x] Save draft
- [x] Submit validation
- [x] Read-only mode
- [x] Mobile responsive
- [ ] Offline support
- [ ] Evidence upload
- [ ] Auto-save

---

## Related Documentation

- [Full README](./README.md) - Complete documentation
- [Type Definitions](../../types/audit-form.types.ts) - TypeScript types
- [ISO Checklist](../../lib/audit/iso-checklist.ts) - Checklist data
- [Demo Page](../../app/audit/form-demo/page.tsx) - Live example

---

## Support

For issues or questions:
1. Check the [Full README](./README.md)
2. Review [Implementation Summary](../../.kiro/specs/iso-audit-dashboard/TASK_2.2_IMPLEMENTATION.md)
3. Test with [Demo Page](/audit/form-demo)
