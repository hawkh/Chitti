# PDF Export Flow Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                  (BatchResultsVisualization)                    │
│                                                                 │
│  [PDF Button] [CSV Button] [JSON Button]                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ onClick (async)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Integrated Detection Page                    │
│                   (handleExportResults)                         │
│                                                                 │
│  1. Set loading state                                          │
│  2. Get component profile                                      │
│  3. Call ReportGenerator                                       │
│  4. Call ReportExporter                                        │
│  5. Handle errors                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ generateInspectionReport()
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Report Generator                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1. Filter results by date range                          │ │
│  │ 2. Generate summary statistics                           │ │
│  │ 3. Calculate detailed statistics                         │ │
│  │ 4. Generate recommendations                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 5. Generate Charts (if enabled)                          │ │
│  │    ├─ Defect Distribution Chart                          │ │
│  │    ├─ Severity Distribution Chart                        │ │
│  │    ├─ Confidence Distribution Chart                      │ │
│  │    └─ Processing Time Chart                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 6. Process Each Detection Result                         │ │
│  │    ├─ Load original image                                │ │
│  │    ├─ Generate GradCAM heatmap (if enabled)              │ │
│  │    └─ Map to report format                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  7. Return complete InspectionReport object                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ InspectionReport
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Report Exporter                            │
│                      (exportToPDF)                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Page 1: Title & Summary                                  │ │
│  │  ├─ Report metadata                                      │ │
│  │  ├─ Summary statistics table                             │ │
│  │  └─ Component profile table                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Page 2: Statistics                                       │ │
│  │  ├─ Defect distribution table                            │ │
│  │  ├─ Severity distribution table                          │ │
│  │  └─ Recommendations list                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Page 3: Charts (2x2 Grid)                                │ │
│  │  ┌──────────────┬──────────────┐                         │ │
│  │  │   Defect     │   Severity   │                         │ │
│  │  │ Distribution │ Distribution │                         │ │
│  │  ├──────────────┼──────────────┤                         │ │
│  │  │  Confidence  │  Processing  │                         │ │
│  │  │ Distribution │     Time     │                         │ │
│  │  └──────────────┴──────────────┘                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Page 4+: Detailed Results (One per result)               │ │
│  │  ├─ Result header (filename, status)                     │ │
│  │  ├─ Original Image (left)                                │ │
│  │  ├─ GradCAM Heatmap (right)                              │ │
│  │  └─ Defect details table                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  8. Generate PDF blob                                          │
│  9. Create download link                                       │
│  10. Trigger download                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Detection Results
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
Component Profile                    Chart Generator
       │                                     │
       │                              ┌──────┴──────┐
       │                              │             │
       │                              ▼             ▼
       │                        Pie Charts    Bar Charts
       │                              │             │
       │                              └──────┬──────┘
       │                                     │
       ▼                                     ▼
Report Generator ◄────────────────── Chart Data URLs
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
Image Processor                      GradCAM Generator
       │                                     │
       ├─ Load Images                        ├─ Create Heatmaps
       ├─ Convert to Base64                  ├─ Apply Gradients
       └─ Resize if needed                   └─ Overlay on Images
       │                                     │
       └──────────────┬──────────────────────┘
                      │
                      ▼
              InspectionReport
              (Complete Object)
                      │
                      ▼
              Report Exporter
                      │
                      ├─ Create PDF Document
                      ├─ Add Pages
                      ├─ Embed Images
                      ├─ Add Tables
                      └─ Format Layout
                      │
                      ▼
                  PDF Blob
                      │
                      ▼
              Browser Download
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  User Action: Click "PDF" Button                               │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  BatchResultsVisualization    │
         │  - Shows loading state        │
         │  - Disables buttons           │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │  IntegratedDetectionPage      │
         │  - Manages state              │
         │  - Handles errors             │
         └───────────┬───────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│ ReportGenerator│         │ ProfileService│
│ - Async        │         │ - Get profile │
│ - Generates    │         └───────────────┘
│   report       │
└───────┬───────┘
        │
        ├─────────────────────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────┐                 ┌───────────────┐
│ChartGenerator │                 │GradCAMGenerator│
│- Canvas charts│                 │- Heatmaps     │
│- Base64 output│                 │- Image overlay│
└───────┬───────┘                 └───────┬───────┘
        │                                 │
        └────────────┬────────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │  InspectionReport Object      │
         │  - Metadata                   │
         │  - Summary                    │
         │  - Statistics                 │
         │  - Charts (base64)            │
         │  - Results with images        │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │  ReportExporter               │
         │  - Creates jsPDF              │
         │  - Adds content               │
         │  - Formats layout             │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │  PDF Blob                     │
         │  - Complete document          │
         │  - Ready for download         │
         └───────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────────────┐
         │  Browser Download             │
         │  - Creates download link      │
         │  - Triggers download          │
         │  - Cleans up resources        │
         └───────────────────────────────┘
```

## Service Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐                                          │
│  │ ReportGenerator  │                                          │
│  │                  │                                          │
│  │  Dependencies:   │                                          │
│  │  ├─ ChartGenerator                                          │
│  │  ├─ GradCAMGenerator                                        │
│  │  └─ imageUtils   │                                          │
│  └────────┬─────────┘                                          │
│           │                                                     │
│           ├──────────────────┬──────────────────┐              │
│           │                  │                  │              │
│           ▼                  ▼                  ▼              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐      │
│  │ChartGenerator│   │GradCAMGenerator│   │ imageUtils   │      │
│  │              │   │              │   │              │      │
│  │ Canvas API   │   │ Canvas API   │   │ Image API    │      │
│  │ Math         │   │ TensorFlow.js│   │ Canvas API   │      │
│  └──────────────┘   └──────────────┘   └──────────────┘      │
│                                                                 │
│  ┌──────────────────┐                                          │
│  │ ReportExporter   │                                          │
│  │                  │                                          │
│  │  Dependencies:   │                                          │
│  │  ├─ jsPDF                                                   │
│  │  ├─ jspdf-autotable                                         │
│  │  ├─ date-fns                                                │
│  │  └─ imageUtils   │                                          │
│  └──────────────────┘                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
User Action
    │
    ▼
Try Block
    │
    ├─ Generate Report
    │  ├─ Success → Continue
    │  └─ Error → Catch Block
    │
    ├─ Generate Charts
    │  ├─ Success → Continue
    │  └─ Error → Log & Continue (graceful degradation)
    │
    ├─ Generate GradCAM
    │  ├─ Success → Continue
    │  └─ Error → Log & Continue (graceful degradation)
    │
    ├─ Export PDF
    │  ├─ Success → Download
    │  └─ Error → Catch Block
    │
    └─ Catch Block
       ├─ Log error to console
       ├─ Show user-friendly message
       └─ Reset loading state
```

## Performance Optimization

```
Parallel Processing:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Chart Generation (Parallel)                                   │
│  ├─ Chart 1 ──┐                                                │
│  ├─ Chart 2 ──┼─→ All complete → Continue                      │
│  ├─ Chart 3 ──┤                                                │
│  └─ Chart 4 ──┘                                                │
│                                                                 │
│  Image Processing (Sequential - due to memory)                 │
│  ├─ Image 1 → GradCAM 1 → Complete                             │
│  ├─ Image 2 → GradCAM 2 → Complete                             │
│  └─ Image N → GradCAM N → Complete                             │
│                                                                 │
│  PDF Assembly (Sequential)                                     │
│  ├─ Add Page 1                                                 │
│  ├─ Add Page 2                                                 │
│  ├─ Add Page 3 (Charts)                                        │
│  └─ Add Pages 4+ (Results)                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Memory Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    Memory Lifecycle                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Allocate                                                    │
│     ├─ Load images into memory                                 │
│     ├─ Create canvas elements                                  │
│     └─ Generate base64 strings                                 │
│                                                                 │
│  2. Process                                                     │
│     ├─ Generate charts (temporary canvases)                    │
│     ├─ Generate heatmaps (temporary canvases)                  │
│     └─ Build PDF document                                      │
│                                                                 │
│  3. Cleanup                                                     │
│     ├─ Remove temporary canvases                               │
│     ├─ Clear image references                                  │
│     ├─ Revoke object URLs                                      │
│     └─ Trigger garbage collection (automatic)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

This flow diagram shows the complete architecture and data flow of the enhanced PDF export system.
