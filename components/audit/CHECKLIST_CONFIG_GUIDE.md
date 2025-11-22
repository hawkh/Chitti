# ISO Checklist Configuration System Guide

## Overview

The ISO Checklist Configuration System provides a comprehensive solution for managing ISO 9001:2015 audit checklists with weighted items, ISO clause mapping, and contextual help text. This system enables administrators to configure, customize, and maintain audit checklists while ensuring compliance with ISO standards.

## Components

### 1. ChecklistConfiguration Component

**Location:** `components/audit/ChecklistConfiguration.tsx`

**Purpose:** Admin interface for configuring ISO audit checklists

**Features:**
- Visual editor for sections and items
- Inline editing of checklist properties
- Weight management for scoring
- Corrective action template management
- ISO clause reference mapping
- Help text configuration
- Save/load from database or default configuration

**Usage:**
```tsx
import ChecklistConfiguration from '@/components/audit/ChecklistConfiguration';

<ChecklistConfiguration 
  onSave={async (checklist) => {
    // Custom save handler
  }}
  readOnly={false}
/>
```

**Props:**
- `onSave?: (checklist: ISOChecklistSection[]) => Promise<void>` - Custom save handler
- `readOnly?: boolean` - Disable editing (default: false)

### 2. ISOClauseHelp Component

**Location:** `components/audit/ISOClauseHelp.tsx`

**Purpose:** Display ISO clause guidance and help text in various formats

**Modes:**
- **tooltip**: Hover/click icon to show brief help
- **inline**: Embedded help panel with full guidance
- **modal**: Full-screen detailed guidance dialog

**Usage:**
```tsx
import ISOClauseHelp, { ISOClauseHelpCompact } from '@/components/audit/ISOClauseHelp';

// Tooltip mode (default)
<ISOClauseHelp clause="4.1" />

// Inline mode with full guidance
<ISOClauseHelp clause="4.1" mode="inline" showFullGuidance={true} />

// Modal mode
<ISOClauseHelp clause="4.1" mode="modal" />

// Compact version for forms
<ISOClauseHelpCompact clause="4.1" />
```

**Props:**
- `clause: string` - ISO clause reference (e.g., "4.1", "5.2")
- `mode?: 'tooltip' | 'inline' | 'modal'` - Display mode (default: 'tooltip')
- `showFullGuidance?: boolean` - Show complete guidance (default: false)

## Data Models

### ISOChecklistSection

```typescript
interface ISOChecklistSection {
  id: string;
  title: string;
  clauseRange: string;  // e.g., "4.1-4.4"
  items: ISOChecklistItem[];
}
```

### ISOChecklistItem

```typescript
interface ISOChecklistItem {
  id: string;
  clauseRef: string;  // e.g., "4.1"
  section: string;
  question: string;
  helpText: string;
  responseType: 'pass_fail_na' | 'numeric' | 'text';
  required: boolean;
  weight: number;
  correctiveActionTemplates: string[];
  evidenceRequired: boolean;
}
```

### ISOClauseReference

```typescript
interface ISOClauseReference {
  clause: string;
  title: string;
  description: string;
  requirements: string[];
  commonFindings: string[];
  evidenceExamples: string[];
  relatedClauses: string[];
}
```

## API Endpoints

### GET /api/audit/checklist

Retrieve checklist configuration

**Query Parameters:**
- `version` - Checklist version (default: "ISO_9001_2015")
- `source` - Data source: "default" or "database" (default: "default")

**Response:**
```json
{
  "version": "ISO_9001_2015",
  "title": "ISO 9001:2015 Quality Management System Audit",
  "sections": [...]
}
```

### POST /api/audit/checklist

Save new checklist configuration

**Request Body:**
```json
{
  "version": "ISO_9001_2015",
  "title": "Custom Audit Checklist",
  "sections": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checklist configuration saved successfully",
  "checklistId": "clxxx..."
}
```

### PUT /api/audit/checklist

Update existing checklist

**Request Body:**
```json
{
  "checklistId": "clxxx...",
  "sections": [...]
}
```

### DELETE /api/audit/checklist?id={checklistId}

Soft delete checklist (marks as inactive)

## ISO Clause Mapping System

### Location
`lib/audit/iso-clause-mapping.ts`

### Features

#### 1. Clause Reference Database

Comprehensive ISO 9001:2015 clause information including:
- Clause title and description
- Key requirements
- Common audit findings
- Evidence examples
- Related clauses

#### 2. Help Text System

Detailed guidance for auditors:
- Short help (quick reference)
- Detailed help (comprehensive explanation)
- Audit tips (what to look for)
- Pass examples (conformance indicators)
- Fail examples (nonconformance indicators)

#### 3. Helper Functions

```typescript
// Get clause reference
const reference = getClauseReference('4.1');

// Get help text
const helpText = getClauseHelpText('4.1');

// Search by keyword
const results = searchClausesByKeyword('risk');

// Get related clauses
const related = getRelatedClauses('4.1');

// Generate complete audit guidance
const guidance = generateAuditGuidance('4.1');

// Validate clause
const isValid = isValidClause('4.1');

// Get clauses by section
const section4Clauses = getClausesBySection(4);
```

## Configuration Workflow

### 1. Initial Setup

1. Navigate to `/audit/checklist-config`
2. Default ISO 9001:2015 checklist loads automatically
3. Review sections and items

### 2. Customization

**Add Section:**
1. Click "Add Section"
2. Edit title and clause range
3. Click "Done"

**Add Item:**
1. Click "Add Item" in section
2. Configure:
   - ISO clause reference
   - Question text
   - Help text
   - Response type
   - Weight (for scoring)
   - Required flag
   - Evidence required flag
3. Add corrective action templates
4. Click "Done"

**Edit Section/Item:**
1. Click "Edit" button
2. Modify fields
3. Click "Done"

**Delete Section/Item:**
1. Click "Delete" button
2. Confirm deletion

### 3. Save Configuration

1. Click "Save Configuration"
2. Configuration saved to database
3. Previous version marked inactive
4. New version becomes active

## Integration with Audit Forms

The checklist configuration integrates with the audit form engine:

```typescript
// Load checklist in audit form
const response = await fetch('/api/audit/checklist?source=database');
const { sections } = await response.json();

// Use in form
<AuditFormEngine checklist={sections} />
```

## Weighting System

### Purpose
Weights determine the relative importance of checklist items in compliance scoring.

### Configuration
- Default weight: 1.0
- Range: 0.1 to 10.0
- Higher weight = more impact on score

### Calculation
```typescript
// Total weighted score
const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

// Item contribution
const itemScore = (item.weight / totalWeight) * 100;

// Compliance score
const complianceScore = passedItems.reduce((sum, item) => 
  sum + (item.weight / totalWeight) * 100, 0
);
```

## Corrective Action Templates

### Purpose
Pre-defined corrective action suggestions for common nonconformances.

### Configuration
Each checklist item can have multiple templates:

```typescript
correctiveActionTemplates: [
  'Conduct SWOT analysis to identify internal and external factors',
  'Document organizational context in quality manual',
  'Review and update context analysis quarterly'
]
```

### Usage in Audits
When an item fails, inspectors can:
1. Select from template suggestions
2. Customize the template
3. Add custom corrective action

## Best Practices

### 1. Checklist Design

- **Keep questions clear and specific**
- **Use consistent terminology**
- **Align with ISO clause structure**
- **Include comprehensive help text**
- **Provide actionable corrective action templates**

### 2. Weight Assignment

- **Critical requirements: 3.0**
- **Important requirements: 2.0**
- **Standard requirements: 1.0**
- **Optional/informational: 0.5**

### 3. Help Text

- **Short help**: One sentence, actionable
- **Detailed help**: Comprehensive explanation
- **Audit tips**: Specific things to check
- **Examples**: Clear pass/fail scenarios

### 4. Maintenance

- **Review quarterly**: Update based on audit feedback
- **Version control**: Keep history of changes
- **Test changes**: Validate with pilot audits
- **Document rationale**: Explain customizations

## Database Schema

### ISOChecklist Table
```prisma
model ISOChecklist {
  id          String   @id @default(cuid())
  version     String
  title       String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  sections    ChecklistSection[]
}
```

### ChecklistSection Table
```prisma
model ChecklistSection {
  id          String   @id @default(cuid())
  checklistId String
  title       String
  isoClause   String
  weight      Float    @default(1.0)
  order       Int
  checklist   ISOChecklist @relation(fields: [checklistId], references: [id])
  items       ChecklistItem[]
}
```

### ChecklistItem Table
```prisma
model ChecklistItem {
  id                        String   @id @default(cuid())
  sectionId                 String
  question                  String
  isoReference              String
  responseType              ResponseType
  required                  Boolean
  helpText                  String?
  correctiveActionTemplates Json?
  weight                    Float
  order                     Int
  section                   ChecklistSection @relation(fields: [sectionId], references: [id])
}
```

## Troubleshooting

### Issue: Checklist not loading

**Solution:**
1. Check API endpoint: `/api/audit/checklist`
2. Verify database connection
3. Check browser console for errors
4. Ensure default checklist exists

### Issue: Changes not saving

**Solution:**
1. Check network tab for API errors
2. Verify authentication/authorization
3. Check database write permissions
4. Review server logs

### Issue: Help text not displaying

**Solution:**
1. Verify clause reference is valid
2. Check ISO_CLAUSE_REFERENCES in `iso-clause-mapping.ts`
3. Ensure component is imported correctly
4. Check browser console for errors

## Requirements Mapping

This implementation satisfies the following requirements:

- **Requirement 1.1**: ISO 9001 checklist with 25 standardized fields
- **Requirement 5.1**: Inline help text for each ISO clause
- **Requirement 5.2**: Common corrective action templates

## Next Steps

1. **Integrate with audit form engine** (Task 2.2 - Already completed)
2. **Add form validation** (Task 2.3)
3. **Implement evidence upload** (Task 3.x)
4. **Build mobile interface** (Task 4.x)

## Support

For issues or questions:
1. Review this guide
2. Check component documentation
3. Review API endpoint responses
4. Check database schema
5. Review requirements and design documents
