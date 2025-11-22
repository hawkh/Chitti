# Guided Audit Assistance - Usage Guide

## Overview

The guided audit assistance system provides inspectors with contextual help, corrective action suggestions, and smart validation to complete high-quality audits without extensive ISO knowledge.

## Features

### 1. Inline Help Text & Tooltips

Every audit item includes comprehensive help:

**Tooltip Help (Quick Reference)**
- Hover over the "?" icon next to any item
- See ISO clause reference, title, and short description
- View audit tips and evidence examples
- No need to leave the form

**Inline Help Panel (Detailed Guidance)**
- Click the help icon to expand full guidance
- See detailed requirements and audit tips
- View pass/fail examples
- See evidence suggestions and related clauses

**Usage Example:**
```tsx
// Automatically integrated in AuditFormEngine
<ISOClauseHelp 
  clause="4.1" 
  mode="tooltip" 
  showFullGuidance={true} 
/>
```

### 2. Corrective Action Template Suggestions

When an audit item fails, get instant corrective action suggestions:

**Automatic Display**
- Suggestions appear when "Fail" is selected
- Filtered by severity level (if selected)
- Ranked by relevance to the clause

**Template Details Include:**
- Title and description
- Severity level
- Timeframe for completion
- Responsible role
- Step-by-step action plan
- Verification method
- Related documents

**One-Click Application**
- Click "Use This Template" to auto-fill comments
- Includes full action plan with steps
- Can be edited after application

**Usage Example:**
```tsx
<CorrectiveActionSuggestions
  clause="5.1"
  severity="high"
  onSelect={(template) => {
    // Auto-fill comments with template
    setComments(formatTemplateAsText(template));
  }}
/>
```

### 3. Smart Validation with Contextual Messages

Get helpful validation feedback as you complete the audit:

**Three Severity Levels:**

**🔴 Errors (Must Fix)**
- Required fields not answered
- Fail responses without severity
- Blocks submission until resolved

**🟡 Warnings (Recommended)**
- Missing evidence on required items
- Fail responses without comments
- High/critical severity without detailed explanation
- Can submit but quality may be affected

**🔵 Info (Best Practice)**
- Pass responses could benefit from evidence
- N/A responses could use justification
- Suggestions to improve audit quality

**Contextual Help Includes:**
- Clear error message
- 💡 Actionable suggestion
- Expandable detailed help text
- Specific guidance for the situation

**Example Validation Messages:**

```
🔴 ERROR: Severity level is required for failed items
💡 Select Low, Medium, High, or Critical based on the impact of this finding
ℹ️ [Expandable] Severity helps prioritize corrective actions...

🟡 WARNING: Comments are strongly recommended to explain the failure
💡 Describe what was observed, why it failed, and what corrective action is needed
ℹ️ [Expandable] Clear comments help reviewers understand the issue...

🔵 INFO: Consider adding evidence to support this pass result
💡 Evidence of conformance strengthens audit quality
ℹ️ [Expandable] Photos or documents showing compliance provide valuable proof...
```

## User Workflows

### Workflow 1: Completing a Pass Item

1. Read the audit question
2. Click tooltip help for quick reference
3. Select "Pass"
4. (Optional) Add evidence to strengthen audit
5. (Optional) Add comments with observations
6. Move to next item

### Workflow 2: Completing a Fail Item

1. Read the audit question
2. Click help icon for detailed guidance
3. Select "Fail"
4. **Corrective action suggestions appear automatically**
5. Select severity level (Low/Medium/High/Critical)
6. **Suggestions filter by severity**
7. Browse suggested corrective actions
8. Click "Use This Template" on preferred action
9. **Comments auto-filled with action plan**
10. Edit/customize the action plan as needed
11. Add evidence (photos of the issue)
12. Move to next item

### Workflow 3: Handling Validation Errors

1. Click "Submit for Review"
2. **Validation summary appears**
3. See count of errors, warnings, and info messages
4. Click on first error to scroll to item
5. **See contextual error message with suggestion**
6. Click "Show more details" for help text
7. Fix the issue based on suggestion
8. **Validation updates in real-time**
9. Repeat for remaining errors
10. Submit when all errors resolved

## API Reference

### Corrective Action Templates

```typescript
// Get templates for a specific clause
const templates = getTemplatesForClause('5.1');

// Get smart suggestions with relevance scoring
const suggestions = suggestCorrectiveActions(
  '5.1',           // clause
  'high',          // severity (optional)
  ['leadership']   // keywords (optional)
);

// Get top 3 quick suggestions
const quick = getQuickSuggestions('5.1', 'high');

// Search templates by keyword
const results = searchTemplates('training');

// Format template as text
const text = formatTemplateAsText(template);
```

### Enhanced Validation

```typescript
// Validate entire form with contextual messages
const validation = validateAuditForm(formData);
// Returns: {
//   isValid: boolean,
//   errors: Record<string, string>,
//   warnings: Record<string, string>,
//   detailedErrors: ValidationError[],
//   totalErrors: number,
//   totalWarnings: number,
//   totalInfo: number
// }

// Validate single response
const errors = validateResponse(item, response);
// Returns: ValidationError[] with suggestions and help text

// Get validation summary
const summary = getValidationSummary(validation);
// Returns: Human-readable summary string

// Check if can submit
const { canSubmit, reason } = canSubmitForm(formData);
```

### ISO Clause Help

```typescript
// Get clause reference data
const reference = getClauseReference('4.1');

// Get help text for clause
const helpText = getClauseHelpText('4.1');

// Generate audit guidance
const guidance = generateAuditGuidance('4.1');

// Search clauses by keyword
const clauses = searchClausesByKeyword('risk');
```

## Customization

### Adding Custom Templates

To add organization-specific corrective action templates:

```typescript
// In lib/audit/corrective-action-templates.ts
export const CORRECTIVE_ACTION_TEMPLATES: CorrectiveActionTemplate[] = [
  // ... existing templates ...
  {
    id: 'ca-custom-001',
    clause: '8.1',
    title: 'Your custom corrective action',
    description: 'Description of the action',
    severity: 'medium',
    actionSteps: [
      'Step 1',
      'Step 2',
      'Step 3'
    ],
    timeframe: '30 days',
    responsibleRole: 'Quality Manager',
    verificationMethod: 'Review documentation',
    relatedDocuments: ['Document 1', 'Document 2']
  }
];
```

### Customizing Validation Rules

To add custom validation rules:

```typescript
// In lib/audit/form-validation.ts
export function validateResponse(
  item: ISOChecklistItem,
  response?: AuditResponse
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Add your custom validation
  if (yourCondition) {
    errors.push({
      itemId: item.id,
      field: 'yourField',
      message: 'Your error message',
      severity: 'error',
      suggestion: 'Your actionable suggestion',
      helpText: 'Your detailed help text'
    });
  }
  
  return errors;
}
```

## Best Practices

### For Inspectors

1. **Always read the help text** before answering unfamiliar items
2. **Use corrective action templates** as a starting point, then customize
3. **Add evidence** for both pass and fail items when possible
4. **Write clear comments** explaining your observations
5. **Address all errors** before submitting (warnings are optional but recommended)

### For Quality Managers

1. **Review validation warnings** even if audit is submittable
2. **Check that corrective actions** are specific and actionable
3. **Ensure evidence** supports the findings
4. **Verify severity levels** match the actual impact
5. **Use audit data** to identify training needs

### For System Administrators

1. **Add custom templates** for organization-specific issues
2. **Monitor which templates** are most used
3. **Update help text** based on user feedback
4. **Customize validation rules** for your requirements
5. **Train users** on the guided assistance features

## Troubleshooting

### Help Text Not Showing
- Check that ISO clause reference is valid
- Verify clause exists in `iso-clause-mapping.ts`
- Check browser console for errors

### Corrective Actions Not Appearing
- Ensure "Fail" response is selected
- Check that clause has templates defined
- Verify component is not in readOnly mode

### Validation Not Working
- Check that validation is enabled (showValidationSummary)
- Verify form data structure is correct
- Check browser console for validation errors

### Templates Not Auto-Filling
- Ensure onSelect callback is defined
- Check that comments field is not readOnly
- Verify template formatting is correct

## Performance Tips

1. **Lazy load help panels** - Only render when expanded
2. **Debounce validation** - Avoid excessive re-renders
3. **Memoize suggestions** - Cache corrective action suggestions
4. **Optimize re-renders** - Use React.memo for static components

## Accessibility

- All help buttons have ARIA labels
- Keyboard navigation fully supported
- Screen reader friendly validation messages
- High contrast colors for visibility
- Focus indicators on all interactive elements

## Future Enhancements

- AI-powered corrective action generation
- Multi-language support for templates
- Custom template library per organization
- Learning system to suggest most relevant templates
- Integration with document management system
- Mobile-optimized help panels
- Voice-to-text for comments
- Offline template caching

## Support

For questions or issues with the guided assistance system:
- Check this documentation first
- Review implementation docs in `.kiro/specs/iso-audit-dashboard/TASK_4.3_IMPLEMENTATION.md`
- Check component source code for inline comments
- Contact your system administrator

---

**Last Updated**: November 17, 2025
**Version**: 1.0.0
**Status**: Production Ready
