# Compliance Scoring and Benchmarking Guide

## Overview

The compliance scoring and benchmarking system provides comprehensive analytics for ISO audit performance tracking, site comparison, and trend forecasting.

## Features

### 1. Compliance Score Calculation

**Weighted Scoring Algorithm:**
- Each ISO checklist item has a weight (1-3) based on clause importance
- Pass responses contribute full weight to the score
- Fail responses contribute zero
- N/A responses are excluded from calculations
- Formula: `(Sum of passed item weights / Total applicable weight) × 100`

**Score Components:**
- Overall score (0-100%)
- Section-level scores
- Pass/Fail/N/A counts
- Critical failure count
- Severity breakdown (high/medium/low)
- Improvement areas (top 5)

**Grades:**
- A+ (95-100%): Excellent
- A (90-94%): Very Good
- B+ (85-89%): Good
- B (80-84%): Satisfactory
- C+ (75-79%): Acceptable
- C (70-74%): Needs Improvement
- D (60-69%): Poor
- F (<60%): Failing

### 2. Site Benchmarking

**Comparison Metrics:**
- Current score vs previous score
- Trend direction (improving/declining/stable)
- Delta (point change)
- Ranking among all sites
- Critical failures count
- Total audits completed

**Organization Metrics:**
- Organization average score
- Industry average (if available)
- Best performer identification
- Worst performer identification
- Performance distribution

**Improvement Recommendations:**
Priority-based recommendations including:
- Critical failure remediation (High)
- Below-average performance improvement (High/Medium)
- Declining trend investigation (High)
- Low score action plans (High)
- Best practice adoption (Medium)

### 3. Trend Analysis

**Statistical Methods:**
- Linear regression with R-squared
- Moving average smoothing
- Exponential smoothing
- Volatility calculation (standard deviation)

**Trend Indicators:**
- Direction: improving/declining/stable
- Strength: strong/moderate/weak
- Change rate: points per period
- Volatility: ± points

**Forecasting:**
Three methods available:
1. **Linear Regression**: Best for consistent trends
2. **Moving Average**: Good for stable patterns
3. **Exponential Smoothing**: Emphasizes recent data

Each forecast includes:
- Predicted score
- Confidence interval (lower/upper bounds)
- Confidence percentage
- Forecast date

**Performance Alerts:**
Automated detection of:
- Critical failures (Critical severity)
- Declining trends (Critical/Warning)
- Low scores (Critical/Warning)
- High volatility (Warning)

## Usage

### Calculate Compliance Score

```typescript
import { calculateComplianceScore } from '@/lib/audit/compliance-calculator';

const responses = {
  'ctx_001': { itemId: 'ctx_001', response: 'pass' },
  'ctx_002': { itemId: 'ctx_002', response: 'fail', severity: 'high' },
  // ... more responses
};

const score = calculateComplianceScore(responses);

console.log(`Overall Score: ${score.overallScore}%`);
console.log(`Critical Failures: ${score.criticalFailures}`);
console.log(`Improvement Areas:`, score.improvementAreas);
```

### Generate Benchmark Comparison

```typescript
import { generateBenchmarkComparison } from '@/lib/audit/benchmarking-service';

const sitesData = [
  {
    siteId: 'site1',
    siteName: 'Plant A',
    audits: [
      {
        id: 'audit1',
        auditDate: new Date('2024-10-15'),
        complianceScore: { /* score object */ }
      }
    ]
  },
  // ... more sites
];

const comparison = generateBenchmarkComparison(sitesData, 82.5);

console.log(`Best Performer: ${comparison.bestPerformer?.siteName}`);
console.log(`Organization Average: ${comparison.organizationAverage}%`);
console.log(`Recommendations:`, comparison.improvementOpportunities);
```

### Analyze Trends

```typescript
import { analyzeTrend, forecastScore } from '@/lib/audit/trend-analysis';

const dataPoints = [
  { date: new Date('2024-07-01'), score: 85, auditId: 'a1', siteId: 's1', siteName: 'Site 1' },
  { date: new Date('2024-08-01'), score: 87, auditId: 'a2', siteId: 's1', siteName: 'Site 1' },
  // ... more data points
];

const trend = analyzeTrend(dataPoints, 'monthly');
console.log(`Trend: ${trend.trend} (${trend.trendStrength})`);
console.log(`Change Rate: ${trend.changeRate} points/month`);
console.log(`Insights:`, trend.insights);

const forecast = forecastScore(dataPoints, 3, 'linear');
forecast.forEach((f, i) => {
  console.log(`Month ${i+1}: ${f.predictedScore}% (${f.confidence}% confidence)`);
});
```

### Use React Components

```tsx
import ComplianceBenchmarking from '@/components/audit/ComplianceBenchmarking';
import TrendAnalysis from '@/components/audit/TrendAnalysis';

// Benchmarking view
<ComplianceBenchmarking organizationId="org1" />

// Trend analysis view
<TrendAnalysis 
  siteId="site1" 
  siteName="Manufacturing Plant A"
  period="monthly"
/>
```

## API Endpoints

### POST /api/audit/compliance/score

Calculate compliance score from audit responses.

**Request:**
```json
{
  "responses": {
    "ctx_001": { "itemId": "ctx_001", "response": "pass" },
    "ctx_002": { "itemId": "ctx_002", "response": "fail", "severity": "high" }
  }
}
```

**Response:**
```json
{
  "success": true,
  "complianceScore": {
    "overallScore": 85.5,
    "sectionScores": { "context": 90, "leadership": 85 },
    "passedItems": 20,
    "failedItems": 5,
    "criticalFailures": 0
  },
  "criticalFailures": []
}
```

### POST /api/audit/benchmarking/compare

Generate benchmark comparison across sites.

**Request:**
```json
{
  "sitesData": [
    {
      "siteId": "site1",
      "siteName": "Plant A",
      "audits": [...]
    }
  ],
  "industryAverage": 82.5
}
```

**Response:**
```json
{
  "success": true,
  "benchmarkComparison": {
    "sites": [...],
    "organizationAverage": 85.2,
    "bestPerformer": {...},
    "improvementOpportunities": [...]
  },
  "distribution": {...},
  "bestPractices": [...]
}
```

### POST /api/audit/trends/analyze

Analyze trends and generate forecasts.

**Request:**
```json
{
  "dataPoints": [...],
  "period": "monthly",
  "forecastPeriods": 3,
  "forecastMethod": "linear",
  "siteId": "site1",
  "siteName": "Plant A",
  "latestScore": {...}
}
```

**Response:**
```json
{
  "success": true,
  "trendAnalysis": {
    "trend": "improving",
    "trendStrength": "strong",
    "changeRate": 2.5,
    "insights": [...]
  },
  "forecast": [...],
  "alerts": [...]
}
```

## Best Practices

### Data Collection
- Maintain consistent audit frequency for accurate trends
- Ensure complete audit responses for reliable scoring
- Document severity levels for all failures
- Track evidence for critical failures

### Benchmarking
- Compare sites with similar characteristics
- Use industry averages when available
- Review recommendations quarterly
- Track improvement action implementation

### Trend Analysis
- Analyze at least 6 data points for reliable trends
- Use appropriate forecast method for your data pattern
- Review forecasts monthly and adjust strategies
- Act on performance alerts promptly

### Performance Optimization
- Cache benchmark comparisons (15-minute TTL)
- Paginate large site lists
- Load trend data on-demand
- Use database indexes on date and score fields

## Troubleshooting

### Low Confidence Forecasts
- Increase historical data points
- Reduce forecast horizon
- Try different forecast methods
- Check for data quality issues

### Inconsistent Benchmarks
- Verify audit completion consistency
- Check for data entry errors
- Ensure similar audit scope across sites
- Review N/A response patterns

### Missing Alerts
- Verify alert thresholds are appropriate
- Check latest score data availability
- Ensure trend analysis is running
- Review alert severity settings

## Integration with Existing Features

The compliance scoring system integrates with:
- **Audit Form Engine**: Automatic score calculation on submission
- **Manager Dashboard**: Real-time score display
- **Notification Service**: Alerts for critical failures
- **Report Generation**: Score inclusion in PDF reports
- **Analytics Dashboard**: Historical trend visualization

## Future Enhancements

Planned improvements:
- Machine learning-based predictions
- Anomaly detection algorithms
- Interactive chart visualizations
- Automated report scheduling
- External benchmark data integration
- Mobile-optimized trend views
