# Task 7.1 Implementation: Compliance Calculation Engine

## Overview
Implemented a comprehensive compliance calculation engine with weighted scoring algorithm, section-level scoring, and critical failure detection system.

## Implementation Details

### 1. Weighted Scoring Algorithm
**File:** `lib/audit/compliance-calculator.ts`

The weighted scoring algorithm calculates compliance scores based on item weights:

```typescript
// Each checklist item has a weight (1-5)
// Score = (Sum of passed item weights) / (Sum of applicable item weights) * 100

// Example:
// Item A: weight 2, pass → contributes 2 to numerator
// Item B: weight 3, fail → contributes 0 to numerator
// Item C: weight 2, N/A → excluded from calculation
// Score = 2 / (2+3) * 100 = 40%
```

**Key Features:**
- Items with higher weights have greater impact on overall score
- N/A responses are excluded from both numerator and denominator
- Scores are rounded to one decimal place for consistency
- Handles empty or partial responses gracefully

### 2. Section-Level Scoring
**Function:** `calculateSectionScore()`

Calculates compliance scores for individual ISO 9001 sections:

```typescript
interface SectionScore {
  sectionId: string;
  sectionTitle: string;
  score: number;              // 0-100%
  passedItems: number;
  failedItems: number;
  naItems: number;
  totalItems: number;
  weight: number;             // Total weight of applicable items
  criticalFailures: number;   // Count of critical failures in section
}
```

**Features:**
- Independent scoring for each ISO section (Context, Leadership, Planning, etc.)
- Tracks pass/fail/N/A counts per section
- Identifies sections with critical failures
- Provides granular visibility into compliance by area

### 3. Overall Compliance Scoring
**Function:** `calculateComplianceScore()`

Calculates comprehensive compliance metrics:

```typescript
interface ComplianceScore {
  overallScore: number;                    // 0-100%
  sectionScores: Record<string, number>;   // Score per section
  passedItems: number;
  failedItems: number;
  naItems: number;
  totalItems: number;
  criticalFailures: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  improvementAreas: string[];              // Top 5 areas needing attention
  calculatedAt: Date;
}
```

**Features:**
- Aggregates all section scores into overall compliance percentage
- Tracks severity distribution (critical, high, medium, low)
- Automatically identifies top 5 improvement areas
- Prioritizes critical failures in improvement recommendations

### 4. Critical Failure Detection
**Function:** `detectCriticalFailures()`

Identifies and flags critical compliance failures:

```typescript
interface CriticalFailure {
  itemId: string;
  clauseRef: string;          // ISO clause reference (e.g., "4.1")
  question: string;           // Full question text
  severity: string;           // "critical"
  comments?: string;          // Inspector's comments
}
```

**Features:**
- Automatically detects all items marked as "fail" with "critical" severity
- Provides complete context for each critical failure
- Includes ISO clause references for compliance tracking
- Surfaces critical failures at top of improvement areas list

### 5. Additional Features

#### Compliance Grading System
**Function:** `getComplianceGrade()`

Assigns letter grades based on compliance scores:
- A+ (95-100%): Excellent - Green
- A (90-94%): Very Good - Green
- B+ (85-89%): Good - Blue
- B (80-84%): Satisfactory - Blue
- C+ (75-79%): Acceptable - Yellow
- C (70-74%): Needs Improvement - Yellow
- D (60-69%): Poor - Orange
- F (<60%): Failing - Red

#### Trend Analysis
**Function:** `calculateScoreTrend()`

Compares current score with previous audit:
- **Improving:** Score increased by >2%
- **Declining:** Score decreased by >2%
- **Stable:** Score changed by ≤2%

Provides delta and percentage change for tracking progress.

## API Integration

### Endpoint: POST /api/audit/compliance/score
**File:** `app/api/audit/compliance/score/route.ts`

Calculates compliance score for audit responses:

```typescript
// Request
POST /api/audit/compliance/score
{
  "responses": {
    "ctx_001": { "itemId": "ctx_001", "response": "pass" },
    "ctx_002": { "itemId": "ctx_002", "response": "fail", "severity": "critical" }
  }
}

// Response
{
  "success": true,
  "complianceScore": {
    "overallScore": 85.5,
    "sectionScores": { "context": 75.0, "leadership": 90.0 },
    "criticalFailures": 1,
    "improvementAreas": [...]
  },
  "criticalFailures": [
    {
      "itemId": "ctx_002",
      "clauseRef": "4.2",
      "question": "Are interested parties identified?",
      "severity": "critical"
    }
  ]
}
```

## Testing

### Test Coverage
**File:** `__tests__/lib/audit/compliance-calculator.test.ts`

Comprehensive test suite with 19 tests covering:

1. **Weighted Scoring Algorithm (3 tests)**
   - All pass responses → 100% score
   - Mixed responses with correct weight application
   - N/A exclusion from calculations

2. **Section-Level Scoring (3 tests)**
   - Accurate section score calculation
   - All N/A responses handling
   - Critical failure tracking per section

3. **Critical Failure Detection (3 tests)**
   - Correct identification of critical failures
   - Empty array when no critical failures
   - Integration with improvement areas

4. **Severity Tracking (1 test)**
   - Accurate counting of all severity levels

5. **Grade System (2 tests)**
   - Correct grade assignment
   - Appropriate labels and colors

6. **Trend Analysis (4 tests)**
   - Improving trend detection
   - Declining trend detection
   - Stable trend for small changes
   - Null previous score handling

7. **Edge Cases (3 tests)**
   - Empty responses
   - Partial responses
   - Decimal rounding

**Test Results:** ✅ All 19 tests passing

## Usage Examples

### Example 1: Calculate Audit Score
```typescript
import { calculateComplianceScore } from '@/lib/audit/compliance-calculator';

const responses = {
  'ctx_001': { itemId: 'ctx_001', response: 'pass' },
  'ctx_002': { itemId: 'ctx_002', response: 'fail', severity: 'high' },
  'ctx_003': { itemId: 'ctx_003', response: 'pass' },
  'ctx_004': { itemId: 'ctx_004', response: 'na' }
};

const score = calculateComplianceScore(responses);
console.log(`Overall Score: ${score.overallScore}%`);
console.log(`Critical Failures: ${score.criticalFailures}`);
```

### Example 2: Detect Critical Issues
```typescript
import { detectCriticalFailures } from '@/lib/audit/compliance-calculator';

const criticalIssues = detectCriticalFailures(responses);
criticalIssues.forEach(issue => {
  console.log(`Critical: ${issue.clauseRef} - ${issue.question}`);
});
```

### Example 3: Track Progress
```typescript
import { calculateScoreTrend, getComplianceGrade } from '@/lib/audit/compliance-calculator';

const currentScore = 85;
const previousScore = 78;

const trend = calculateScoreTrend(currentScore, previousScore);
const grade = getComplianceGrade(currentScore);

console.log(`Grade: ${grade.grade} (${grade.label})`);
console.log(`Trend: ${trend.trend} (${trend.delta > 0 ? '+' : ''}${trend.delta}%)`);
```

## Requirements Mapping

### Requirement 4.1 ✅
**"WHEN calculating scores, THE Audit_System SHALL compute compliance percentages based on weighted checklist items"**

Implemented in `calculateComplianceScore()`:
- Uses item weights from ISO checklist configuration
- Calculates weighted average: (sum of passed weights) / (sum of applicable weights)
- Returns percentage score (0-100%)

### Requirement 4.2 ✅
**"WHEN displaying benchmarks, THE Audit_System SHALL show site-level comparisons in table format with sparklines"**

Foundation implemented:
- `calculateComplianceScore()` provides scores for comparison
- `calculateScoreTrend()` enables trend visualization
- Section scores enable granular comparison
- Integration with benchmarking service (Task 7.2)

## Performance Considerations

1. **Efficient Calculation:** O(n) complexity where n = number of checklist items
2. **Caching:** Scores include `calculatedAt` timestamp for cache validation
3. **Lazy Loading:** Only calculates requested metrics
4. **Memory Efficient:** Uses Record types instead of arrays where possible

## Future Enhancements

1. **Historical Trending:** Track scores over multiple audit cycles
2. **Predictive Analytics:** Forecast future compliance based on trends
3. **Custom Weighting:** Allow organizations to customize item weights
4. **Benchmark Integration:** Compare against industry standards
5. **Real-time Calculation:** Update scores as inspector completes form

## Related Tasks

- ✅ Task 7.1: Compliance calculation engine (COMPLETED)
- ✅ Task 7.2: Benchmarking and comparison system (COMPLETED)
- ✅ Task 7.3: Trend analysis and forecasting (COMPLETED)
- 🔄 Task 6.3: Compliance analytics dashboard (Uses this engine)
- 🔄 Task 8.1: ISO report generation (Includes compliance scores)

## Conclusion

The compliance calculation engine is fully implemented and tested, providing:
- ✅ Weighted scoring algorithm with configurable item weights
- ✅ Section-level scoring for granular compliance visibility
- ✅ Overall compliance scoring with comprehensive metrics
- ✅ Critical failure detection and flagging system
- ✅ Severity tracking (critical, high, medium, low)
- ✅ Improvement area identification
- ✅ Grade assignment and trend analysis
- ✅ Comprehensive test coverage (19 tests, all passing)

The engine forms the foundation for compliance analytics, benchmarking, and reporting features throughout the ISO Audit Dashboard system.
