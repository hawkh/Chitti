# AI NDT Defect Detection System - Integrated Platform

A comprehensive AI-powered Non-Destructive Testing (NDT) defect detection system built with Next.js, React, and TensorFlow.js. This integrated platform provides end-to-end defect detection capabilities for manufacturing quality control.

## 🚀 Features

### Core Detection Capabilities
- **AI-Powered Detection**: Advanced YOLO-based models for automated defect detection
- **Multi-Format Support**: Process images (JPEG, PNG, TIFF, BMP) and videos (MP4, AVI, MOV)
- **Real-time Analysis**: Live defect detection with confidence scoring and severity assessment
- **Batch Processing**: Handle up to 100 images or 10 videos simultaneously with intelligent queue management

### Advanced Analytics & Reporting
- **Comprehensive Dashboard**: Visual insights, performance metrics, and quality trends
- **Detailed Reports**: Generate PDF, CSV, and JSON reports with customizable templates
- **Quality Metrics**: Pass rates, defect statistics, and quality scoring
- **Audit Trail**: Complete logging and compliance tracking for regulatory requirements

### Intelligent Configuration
- **Component Profiles**: Customizable detection profiles for different materials (metal, plastic, composite, ceramic)
- **Adaptive Sensitivity**: Material-specific detection parameters and thresholds
- **Critical Defect Management**: Define and prioritize defect types by severity
- **Quality Standards Integration**: Support for ISO, ASTM, and custom quality standards

### Enterprise Features
- **Processing Queue**: Priority-based job scheduling with parallel processing
- **System Health Monitoring**: Real-time system status and performance metrics
- **Scalable Architecture**: Designed for high-volume production environments
- **API-First Design**: RESTful APIs for integration with existing systems

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **AI/ML**: TensorFlow.js, YOLO object detection, custom defect classification models
- **Image Processing**: Sharp.js, Canvas API, WebGL acceleration
- **Video Processing**: FFmpeg.js for frame extraction and analysis
- **State Management**: React Context API with optimistic updates
- **Testing**: Jest, React Testing Library, comprehensive test coverage
- **Development**: ESLint, Prettier, TypeScript strict mode

## 📋 System Requirements

### Minimum Requirements
- Node.js 18+ 
- 8GB RAM
- Modern web browser with WebGL 2.0 support
- 2GB available disk space

### Recommended Requirements
- Node.js 20+
- 16GB RAM
- Dedicated GPU (for faster processing)
- SSD storage
- Chrome/Edge browser (best performance)

## 🚀 Quick Start

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd ai-ndt-defect-detection
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open the application:**
Navigate to [http://localhost:3000](http://localhost:3000)

### First Detection

1. **Access the integrated system:** Go to `/integrated-detection`
2. **Upload test images:** Use the drag-and-drop interface
3. **Configure detection:** Select component type and sensitivity
4. **Start analysis:** Monitor real-time progress
5. **Review results:** Examine detected defects and generate reports

## 📖 User Guide

### Detection Workflow

1. **File Upload**
   - Drag and drop files or click to browse
   - Supports batch upload up to 100 files
   - Real-time validation and preview

2. **Configuration**
   - Select component profile or create custom
   - Adjust sensitivity and confidence thresholds
   - Choose specific defect types to detect

3. **Processing**
   - Monitor queue status and progress
   - Real-time processing updates
   - Estimated completion times

4. **Results Analysis**
   - Interactive defect visualization
   - Detailed defect information
   - Quality metrics and scoring

5. **Report Generation**
   - Multiple report templates
   - PDF, CSV, and JSON formats
   - Customizable content and branding

### Component Profile Management

Create and manage detection profiles for different component types:

```typescript
// Example profile configuration
{
  name: "Metal Casting Profile",
  materialType: "metal",
  criticalDefects: ["crack", "void", "inclusion"],
  defaultSensitivity: 0.7,
  qualityStandards: ["ISO 9001", "ASTM E165"],
  customParameters: {
    "temperature_range": "-40°C to 200°C",
    "surface_finish": "Ra 3.2"
  }
}
```

## 🔧 API Documentation

### Core Endpoints

#### File Upload
```bash
POST /api/upload
# Upload files for processing

GET /api/upload?fileId={id}
# Check upload status

DELETE /api/files/{filename}
# Delete uploaded files
```

#### Detection Processing
```bash
POST /api/processing/batch
# Start batch processing

GET /api/processing/batch?jobId={id}
# Get processing status

DELETE /api/processing/batch?jobId={id}
# Cancel processing job
```

#### Component Profiles
```bash
GET /api/profiles
# List all profiles

POST /api/profiles
# Create new profile

PUT /api/profiles
# Update existing profile

DELETE /api/profiles?id={id}
# Delete profile
```

#### System Health
```bash
GET /api/models/health
# Check AI model status

GET /api/processing/queue
# Get queue statistics

POST /api/models/load
# Load/unload AI models
```

## 🏗 Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   API Gateway   │    │  AI Processing  │
│                 │    │                 │    │                 │
│ • React/Next.js │◄──►│ • REST APIs     │◄──►│ • YOLO Models   │
│ • TypeScript    │    │ • Validation    │    │ • TensorFlow.js │
│ • Tailwind CSS │    │ • Queue Mgmt    │    │ • Image Proc    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  File Storage   │    │   Data Layer    │    │   Reporting     │
│                 │    │                 │    │                 │
│ • Upload Mgmt   │    │ • Profiles      │    │ • PDF/CSV Gen   │
│ • Temp Storage  │    │ • Results       │    │ • Templates     │
│ • Media Serving │    │ • Audit Logs    │    │ • Export Tools  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Implementation Status

### ✅ Completed Features

1. **Core Infrastructure**
   - ✅ Project structure and TypeScript configuration
   - ✅ Data models and validation utilities
   - ✅ File upload system with drag-and-drop interface
   - ✅ AI model loading and initialization system

2. **Detection System**
   - ✅ Image preprocessing pipeline
   - ✅ Defect detection core logic
   - ✅ Defect visualization component with zoom/pan
   - ✅ Results dashboard with filtering and search

3. **Profile Management**
   - ✅ Component profile configuration interface
   - ✅ Profile storage and retrieval system
   - ✅ Material-specific detection parameters

4. **Batch Processing**
   - ✅ Processing queue management
   - ✅ Batch processing worker with parallel execution
   - ✅ Batch results aggregation and analytics

5. **Reporting System**
   - ✅ Report data structures and templates
   - ✅ Report export functionality (PDF, CSV, JSON)
   - ✅ Comprehensive analytics dashboard

6. **Integration**
   - ✅ Integrated detection workflow
   - ✅ System health monitoring
   - ✅ API endpoints for all major features

### 🚧 Remaining Tasks

1. **Audit Logging** (Tasks 9.1, 9.2)
2. **Video Processing** (Tasks 10.1, 10.2)
3. **Error Handling Enhancement** (Tasks 11.1, 11.2)
4. **Performance Optimization** (Task 12.1)
5. **Comprehensive Testing** (Task 12.2)
6. **Final Integration** (Tasks 13.1, 13.2)

## 🧪 Testing

### Test Coverage

Current test coverage includes:
- Unit tests for validation utilities
- Component tests for UI elements
- API endpoint integration tests
- Model manager functionality tests

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/                           # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── upload/               # File upload endpoints
│   │   ├── processing/           # Batch processing APIs
│   │   ├── profiles/             # Profile management APIs
│   │   └── models/               # AI model management APIs
│   ├── dashboard/                # Dashboard pages
│   ├── detection/                # Detection pages
│   └── integrated-detection/     # Integrated system page
├── components/                   # React components
│   ├── detection/               # Detection workflow components
│   ├── dashboard/               # Dashboard and analytics
│   ├── profiles/                # Profile management
│   ├── upload/                  # File upload components
│   └── system/                  # System monitoring
├── services/                    # Business logic services
│   ├── ai/                      # AI/ML services
│   ├── processing/              # Processing queue and batch
│   ├── profiles/                # Profile management service
│   └── report/                  # Report generation
├── types/                       # TypeScript type definitions
├── lib/                         # Utility functions
├── docs/                        # Documentation
├── examples/                    # Usage examples
└── __tests__/                   # Test files
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Reference](docs/UPLOAD_API.md)
- [Model Setup Guide](MODEL_SETUP.md)
- [Changelog](CHANGELOG.md)

### Issues
For bug reports and feature requests, please open an issue in the GitHub repository.

---

**Built with ❤️ for manufacturing quality control**