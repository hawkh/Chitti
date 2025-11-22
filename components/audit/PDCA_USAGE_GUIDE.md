# PDCA Stage Management System - Usage Guide

## Overview
The PDCA (Plan-Do-Check-Act) stage management system enables systematic tracking of continuous improvement cycles in ISO audit workflows.

## Quick Start

### 1. Creating an Audit with PDCA Stage

When creating a new audit, select the appropriate PDCA stage:

```tsx
import PDCAStageSelector from '@/components/audit/PDCAStageSelector';

function AuditCreationForm() {
  const [formData, setFormData] = useState({
    pdcaStage: undefined,
    // ... other fields
  });

  return (
    <PDCAStageSelector
      selectedStage={formData.pdcaStage}
      onStageSelect={(stage) => {
        setFormData({ ...formData, pdcaStage: stage });
      }}
      showGuidance={true}
    />
  );
}
```

### 2. Tracking PDCA Cycle Status

Display cycle progress for a site:

```tsx
import PDCACycleTracker from '@/components/audit/PDCACycleTracker';

function SiteDashboard({ siteId }) {
  const [cycleStatus, setCycleStatus] = useState(null);

  useEffect(() => {
    fetch(`/api/audit/pdca/cycle-status?siteId=${siteId}`)
      .then(res => res.json())
      .then(data => setCycleStatus(data));
  }, [siteId]);

  if (!cycleStatus) return <div>Loading...</div>;

  return (
    <PDCACycleTracker
      cycleStatus={cycleStatus}
      onCreateAudit={(stage) => {
        // Navigate to audit creation with pre-selected stage
        router.push(`/audit/create?siteId=${siteId}&pdcaStage=${stage}`);
      }}
      showDetails={true}
    />
  );
}
```

### 3. Viewing Organization-Wide PDCA Metrics

Navigate to `/audit/pdca` to view:
- Total cycles across all sites
- Completed vs in-progress cycles
- Average cycle duration
- Stage distribution
- Site-level cycle tracking

## PDCA Stages Explained

### Plan Stage
**When to use:**
- Starting a new improvement initiative
- Conducting initial assessments
- Setting quality objectives
- Planning corrective actions

**Example scenarios:**
- "We need to improve our welding process quality"
- "Let's assess our current compliance status"
- "Planning implementation of new ISO requirements"

### Do Stage
**When to use:**
- Implementing planned improvements
- Testing new procedures
- Training staff on changes
- Executing corrective actions

**Example scenarios:**
- "Implementing the new welding procedure we planned"
- "Training operators on updated quality standards"
- "Testing the improved inspection process"

### Check Stage
**When to use:**
- Routine compliance audits
- Verifying effectiveness of changes
- Measuring process performance
- Evaluating outcomes

**Example scenarios:**
- "Monthly compliance audit"
- "Checking if the new procedure is working"
- "Measuring improvement in defect rates"

### Act Stage
**When to use:**
- Standardizing successful improvements
- Adjusting processes based on findings
- Documenting lessons learned
- Planning next improvement cycle

**Example scenarios:**
- "Making the improved process our new standard"
- "Updating documentation based on audit findings"
- "Preparing for the next improvement cycle"

## API Usage

### Get Cycle Status
```typescript
const response = await fetch('/api/audit/pdca/cycle-status?siteId=site123');
const cycleStatus = await response.json();

// cycleStatus contains:
// - siteId, siteName
// - currentStage, completedStages
// - progress (0-100%)
// - isComplete
// - auditsInCycle
```

### Get Organization Metrics
```typescript
const response = await fetch('/api/audit/pdca/metrics');
const { metrics, siteStatuses } = await response.json();

// metrics contains:
// - totalCycles, completedCycles, inProgressCycles
// - averageCycleDuration
// - stageDistribution
// - completionRate
```

### Validate Cycle Completion
```typescript
const response = await fetch('/api/audit/pdca/validate-cycle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ siteId: 'site123' })
});
const validation = await response.json();

// validation contains:
// - isValid, isComplete
// - completedStages, missingStages
// - recommendations
// - nextSuggestedStage
```

## Workflow Functions

### Get Next Stage
```typescript
import { getNextPDCAStage } from '@/lib/audit/pdca-workflow';

const currentStage = 'plan';
const nextStage = getNextPDCAStage(currentStage); // Returns 'do'
```

### Calculate Progress
```typescript
import { calculateCycleProgress } from '@/lib/audit/pdca-workflow';

const completedStages = ['plan', 'do'];
const progress = calculateCycleProgress(completedStages); // Returns 50
```

### Get Stage Guidance
```typescript
import { getPDCAStageGuidance } from '@/lib/audit/pdca-workflow';

const guidance = getPDCAStageGuidance('plan');
// Returns: { title, description, objectives, keyActivities, deliverables }
```

### Suggest Next Audit
```typescript
import { suggestNextAudit } from '@/lib/audit/pdca-workflow';

const suggestion = suggestNextAudit(cycleStatus);
// Returns: { suggestedStage, reason, priority }
```

## Best Practices

### 1. Stage Selection
- **Plan**: Use when starting new initiatives or identifying problems
- **Do**: Use when implementing planned changes
- **Check**: Use for routine audits and verification
- **Act**: Use when standardizing improvements or closing cycles

### 2. Cycle Completion
- Aim to complete all four stages for each improvement initiative
- Track cycle duration to identify bottlenecks
- Use recommendations to guide next audit creation

### 3. Progress Monitoring
- Review cycle status regularly in manager dashboard
- Address incomplete cycles that have been open too long
- Celebrate completed cycles to encourage continuous improvement

### 4. Documentation
- Use comments in audits to document stage-specific findings
- Link related audits within the same cycle
- Document lessons learned in Act stage audits

## Integration Points

### Audit Form
- PDCA stage selector appears at top of audit form
- Stage selection is required before submission
- Stage-specific guidance helps users understand context

### Manager Dashboard
- View PDCA cycle status for assigned sites
- See next recommended actions
- Filter audits by PDCA stage

### Analytics
- Track cycle completion rates
- Analyze stage distribution
- Monitor average cycle duration

### Reports
- Include PDCA stage in audit reports
- Show cycle progress in site reports
- Track improvement initiatives over time

## Troubleshooting

### Issue: Cycle not progressing
**Solution:** Ensure audits are being approved. Only approved audits count toward cycle completion.

### Issue: Wrong stage suggested
**Solution:** The system suggests the next logical stage. You can override and select any stage if needed.

### Issue: Cycle metrics not updating
**Solution:** Metrics are calculated from approved audits. Check that recent audits have been approved.

### Issue: Missing stage guidance
**Solution:** Guidance is built-in for all four stages. If not displaying, check component props.

## Examples

### Example 1: Starting a New Improvement Initiative
```typescript
// 1. Create Plan stage audit
const planAudit = {
  siteId: 'site123',
  pdcaStage: 'plan',
  auditType: 'routine',
  // ... identify improvement opportunities
};

// 2. After approval, create Do stage audit
const doAudit = {
  siteId: 'site123',
  pdcaStage: 'do',
  auditType: 'follow_up',
  // ... document implementation
};

// 3. Continue with Check and Act stages
```

### Example 2: Routine Compliance Audit
```typescript
// Most routine audits use Check stage
const checkAudit = {
  siteId: 'site123',
  pdcaStage: 'check',
  auditType: 'routine',
  // ... verify compliance
};
```

### Example 3: Closing an Improvement Cycle
```typescript
// Use Act stage to standardize and close cycle
const actAudit = {
  siteId: 'site123',
  pdcaStage: 'act',
  auditType: 'follow_up',
  // ... document standardization and lessons learned
};

// After approval, cycle is complete
// System will suggest starting new Plan stage
```

## Component Props Reference

### PDCAStageSelector
```typescript
interface PDCAStageSelectorProps {
  selectedStage?: PDCAStage;
  onStageSelect: (stage: PDCAStage) => void;
  disabled?: boolean;
  showGuidance?: boolean;
}
```

### PDCACycleTracker
```typescript
interface PDCACycleTrackerProps {
  cycleStatus: PDCACycleStatus;
  onCreateAudit?: (stage: PDCAStage) => void;
  showDetails?: boolean;
}
```

## Related Documentation
- [ISO Audit Dashboard Requirements](../../.kiro/specs/iso-audit-dashboard/requirements.md)
- [PDCA Implementation Summary](../../.kiro/specs/iso-audit-dashboard/TASK_9.1_IMPLEMENTATION.md)
- [Audit Form Engine Guide](./FORM_ENGINE_GUIDE.md)
