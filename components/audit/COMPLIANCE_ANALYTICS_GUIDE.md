# Compliance Analytics Dashboard Guide

## Overview

The Compliance Analytics Dashboard provides comprehensive visualization and analysis of audit compliance data across multiple sites. It enables managers to track performance, identify trends, and make data-driven decisions for continuous improvement.

## Features

### 1. Score Visualization Charts

#### Distribution Chart (Pie/Donut)
- **Purpose**: Shows the distribution of sites across performance categories
- **Categories**:
  - Excellent (90-100%): Sites exceeding standards
  - Good (80-89%): Sites meeting standards
  - Acceptable (70-79%): Sites at minimum compliance
  - Needs Improvement (<70%): Sites requiring attention
- **Insights**: Automatically highlights key patterns and concerns

#### Ranking Bar Chart
- **Purpose**: Compares all sites side-by-side with visual indicators
- **Features**:
  - Color-coded performance levels (green/yellow/red)
  - Organization average reference line
  - Industry average benchmark (if available)
  - Critical failure indicators
  - Medal rankings for top 3 performers

#### Trends Visualization
- **Purpose**: Identifies performance momentum across sites
- **Metrics**:
  - Improving sites count and percentage
  - Stable sites count and percentage
  - Declining sites count and percentage
- **Lists**:
  - Top improvers with delta scores
  - Sites needing attention with decline amounts

### 2. Site Comparison Table

Comprehensive table showing:
- Site ranking with medal indicators
- Current compliance scores with progress bars
- Trend indicators (improving/declining/stable)
- Total audits conducted
- Critical issues count
- Last audit date

### 3. Compliance Trend Over Time

Line chart displaying:
- Organization average score over time
- Industry benchmark comparison
- Data points with audit counts
- Gradient fill for visual appeal
- Interactive tooltips with details

### 4. Top Performers Section

Highlights the best-performing sites with:
- Medal-style ranking cards
- Current scores and trends
- Total audits completed
- Visual distinction for top 3

## API Endpoints

### GET /api/audit/manager/analytics

Fetches comprehensive analytics data for the manager dashboard.

**Query Parameters**:
- `timeframe`: 'week' | 'month' | 'quarter' (default: 'month')
- `siteId`: Filter by specific site or 'all' for organization-wide

**Response**:
```json
{
  "siteBenchmarks": [
    {
      "siteId": "string",
      "siteName": "string",
      "location": "string",
      "currentScore": 85.5,
      "previousScore": 82.0,
      "trend": "improving",
      "totalAudits": 12,
      "lastAuditDate": "2024-01-15T10:00:00Z",
      "criticalIssues": 0,
      "ranking": 1
    }
  ],
  "overallTrend": [
    {
      "date": "2024-01-01",
      "score": 83.5,
      "auditsCount": 5
    }
  ],
  "industryAverage": 78,
  "topPerformers": [...],
  "needsAttention": [...],
  "distribution": {
    "excellent": 3,
    "good": 5,
    "acceptable": 2,
    "needsImprovement": 1
  }
}
```

### GET /api/audit/analytics/comparison

Provides detailed benchmarking and comparison analytics.

**Query Parameters**:
- `timeframe`: 'week' | 'month' | 'quarter' | 'year'
- `organizationId`: Filter by organization (optional)

**Response**:
```json
{
  "sites": [...],
  "organizationAverage": 82.5,
  "industryAverage": 78,
  "bestPerformer": {...},
  "worstPerformer": {...},
  "improvementOpportunities": [
    {
      "siteId": "string",
      "siteName": "string",
      "priority": "high",
      "category": "Critical Failures",
      "recommendation": "Address 2 critical failures immediately",
      "expectedImpact": "High - Immediate compliance improvement",
      "benchmarkReference": "Best Site has zero critical failures"
    }
  ],
  "distribution": {...},
  "bestPractices": [
    "Maintain consistent audit scores above 90%",
    "Implement continuous improvement programs"
  ],
  "metrics": {
    "totalSites": 11,
    "totalAudits": 45,
    "avgAuditsPerSite": 4.1,
    "timeframe": "month"
  }
}
```

## Usage Examples

### Basic Implementation

```tsx
import ComplianceAnalyticsDashboard from '@/components/audit/ComplianceAnalyticsDashboard';

export default function AnalyticsPage() {
  const user = {
    id: 'user-123',
    name: 'John Manager',
    email: 'john@example.com',
    role: 'MANAGER'
  };

  return <ComplianceAnalyticsDashboard user={user} />;
}
```

### Using Individual Chart Components

```tsx
import ComplianceChartsPanel from '@/components/audit/ComplianceChartsPanel';

export default function CustomDashboard() {
  const sites = [...]; // Your site benchmark data
  const distribution = {...}; // Performance distribution
  
  return (
    <ComplianceChartsPanel
      sites={sites}
      distribution={distribution}
      organizationAverage={82.5}
      industryAverage={78}
    />
  );
}
```

## Key Metrics Explained

### Compliance Score
- Calculated using weighted scoring algorithm
- Range: 0-100%
- Based on pass/fail/N/A responses to checklist items
- Critical failures heavily impact score

### Trend Calculation
- Compares current period vs previous period
- Delta threshold: ±2% for "stable" classification
- Improving: Current > Previous + 2%
- Declining: Current < Previous - 2%
- Stable: Within ±2% range

### Rankings
- Sorted by current compliance score (descending)
- Top 3 receive medal indicators
- Ties resolved by total audits count

### Distribution Categories
- **Excellent (90-100%)**: Exceeding ISO standards
- **Good (80-89%)**: Meeting ISO standards
- **Acceptable (70-79%)**: Minimum compliance
- **Needs Improvement (<70%)**: Below standards

## Best Practices

### For Managers

1. **Regular Monitoring**: Review analytics weekly to catch declining trends early
2. **Benchmark Comparison**: Use industry average to set realistic targets
3. **Focus on Trends**: Pay attention to momentum, not just current scores
4. **Address Critical Issues**: Prioritize sites with critical failures
5. **Learn from Top Performers**: Identify and replicate best practices

### For Administrators

1. **Data Quality**: Ensure regular audit submissions for accurate trends
2. **Timeframe Selection**: Use appropriate timeframes for meaningful analysis
3. **Export Reports**: Regularly export data for executive reporting
4. **Set Targets**: Establish organization-wide compliance goals
5. **Track Progress**: Monitor improvement recommendations implementation

## Troubleshooting

### No Data Displayed
- Verify audits have been submitted and approved
- Check timeframe selection (may be too narrow)
- Ensure user has proper role permissions (MANAGER or ADMIN)

### Inaccurate Trends
- Requires at least 2 audits per site for trend calculation
- Previous period may have insufficient data
- Check audit submission dates

### Missing Industry Average
- Industry average is optional and may not be configured
- Can be set in organization settings
- Defaults to null if not available

## Performance Considerations

- Charts render using SVG for scalability
- Large datasets (>50 sites) may impact rendering
- Consider pagination for very large organizations
- Trend data is limited to 10-12 data points for performance

## Accessibility

- All charts include descriptive titles
- Color-blind friendly color schemes
- Keyboard navigation support
- Screen reader compatible labels
- High contrast mode available

## Future Enhancements

- Export charts as images
- Custom date range selection
- Drill-down into specific sites
- Predictive analytics
- Automated alerts for declining trends
- Comparison with historical periods
- Custom benchmark groups

## Related Components

- `ComplianceBenchmarking`: Detailed site-to-site comparison
- `TrendAnalysis`: Individual site trend analysis
- `ManagerDashboard`: Main manager interface
- `AuditReviewInterface`: Audit approval workflow

## Support

For issues or questions:
1. Check the API response format
2. Verify authentication tokens
3. Review browser console for errors
4. Ensure Prisma schema is up to date
5. Check database connectivity
