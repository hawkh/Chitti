# Chitti AI NDT - AI-Powered Defect Detection System

A comprehensive Non-Destructive Testing (NDT) solution that uses AI to detect defects in manufacturing components. Built with Next.js, React, TypeScript, and TensorFlow.js.

## 🚀 Features

- **AI-Powered Detection**: YOLO-based defect detection with enterprise precision
- **Real-time Processing**: Fast image and video analysis
- **Batch Processing**: Handle multiple files simultaneously
- **Comprehensive Reporting**: PDF, CSV, and JSON export formats
- **Audit Logging**: Complete activity tracking for compliance
- **User-Friendly Interface**: Drag-and-drop file upload with progress tracking
- **Defect Visualization**: Interactive defect highlighting and analysis
- **Component Profiles**: Customizable detection parameters for different materials

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **AI/ML**: TensorFlow.js, YOLO object detection
- **File Processing**: Sharp.js for image processing
- **Reports**: jsPDF, date-fns for report generation
- **Testing**: Jest, React Testing Library
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser with WebGL support

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chitti-ai-ndt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your YOLO model**
   - Place your model files in `public/models/yolo-defect-detector/`
   - Update the configuration in `public/models/config.json`
   - See [MODEL_SETUP.md](MODEL_SETUP.md) for detailed instructions

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── detection/         # Detection page
│   ├── dashboard/         # Dashboard page
│   └── api/              # API routes
├── components/            # React components
│   ├── detection/        # Detection-related components
│   ├── dashboard/        # Dashboard components
│   ├── upload/          # File upload components
│   └── shared/          # Shared components
├── services/             # Business logic services
│   ├── ai/              # AI/ML services
│   ├── report/          # Report generation
│   └── audit/           # Audit logging
├── types/               # TypeScript type definitions
├── lib/                 # Utility functions
├── public/              # Static assets
│   └── models/         # AI model files
└── __tests__/          # Test files
```

## 🔧 Configuration

### Model Configuration

Update `public/models/config.json` to configure your YOLO model:

```json
{
  "models": {
    "yolo-defect-detector": {
      "modelUrl": "/models/yolo-defect-detector/model.json",
      "inputSize": { "width": 640, "height": 640 },
      "classNames": ["crack", "corrosion", "deformation", ...],
      "confidenceThreshold": 0.5
    }
  }
}
```

### Detection Parameters

Customize detection parameters in the component profiles:

- **Confidence Threshold**: Minimum confidence for defect detection
- **Material Types**: Metal, plastic, composite, ceramic
- **Defect Types**: Crack, corrosion, deformation, surface irregularities
- **Image Requirements**: Resolution, file size, formats

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Usage

### 1. Upload Files
- Navigate to `/detection`
- Drag and drop images or videos
- Supports JPEG, PNG, WebP, MP4 formats

### 2. Process Detection
- Click "Start Detection" to analyze files
- Monitor progress in real-time
- View results as they complete

### 3. Analyze Results
- Click on any result to view detailed analysis
- Interactive defect visualization with zoom/pan
- Confidence scores and severity levels

### 4. Generate Reports
- Export results in PDF, CSV, or JSON format
- Comprehensive statistics and recommendations
- Compliance-ready audit trails

### 5. Dashboard Overview
- View processing statistics
- Monitor pass/fail rates
- Track performance metrics

## 🔍 Supported Defect Types

- **Cracks**: Linear fractures in material
- **Corrosion**: Chemical deterioration
- **Deformation**: Physical distortion
- **Surface Irregularities**: Texture anomalies
- **Inclusions**: Foreign material
- **Voids**: Empty spaces or holes
- **Dimensional Variance**: Size deviations

## 📈 Performance

- **Processing Speed**: Fast real-time analysis
- **Scalability**: Enterprise-grade infrastructure
- **Batch Processing**: Handle multiple files simultaneously
- **Memory Usage**: Optimized for browser and server environments

## 🛡️ Security & Compliance

- **Audit Logging**: Complete activity tracking
- **Data Privacy**: Client-side processing option
- **File Validation**: Secure file type checking
- **Error Handling**: Comprehensive error recovery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [MODEL_SETUP.md](MODEL_SETUP.md) guide
2. Review the browser console for error messages
3. Ensure your model files are properly configured
4. Verify WebGL support in your browser

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_MODEL_BASE_URL=/models
NEXT_PUBLIC_API_BASE_URL=/api
```

## 🔮 Roadmap

- [ ] Real-time video processing
- [ ] Advanced analytics dashboard
- [ ] Multi-user support with authentication
- [ ] Cloud model hosting
- [ ] Mobile app support
- [ ] Integration with manufacturing systems

---

Built with ❤️ for the manufacturing industry to make quality control accessible to everyone.