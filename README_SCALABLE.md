# Chitti AI NDT - Scalable Production System

A production-ready, scalable AI-powered Non-Destructive Testing (NDT) system with real AI models, database persistence, job queuing, and real-time updates.

## 🏗️ Architecture Overview

### Core Components
- **Next.js 15** - Frontend and API layer
- **PostgreSQL** - Primary database with Prisma ORM
- **Redis** - Caching and job queue management
- **Bull Queue** - Background job processing
- **TensorFlow.js Node** - Real AI model inference
- **WebSocket** - Real-time updates
- **Docker** - Containerized deployment

### Scalability Features
- **Horizontal Scaling**: Multiple worker processes
- **Database Persistence**: All data stored in PostgreSQL
- **Job Queue**: Asynchronous processing with Bull/Redis
- **Real-time Updates**: WebSocket connections for live progress
- **Model Management**: Dynamic loading/unloading of AI models
- **Caching**: Redis for performance optimization
- **Monitoring**: System health and metrics APIs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd chitti-ai-ndt
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your database and Redis credentials
   ```

3. **Database Setup**
   ```bash
   npm run db:migrate
   npm run db:generate
   npm run setup
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Build and Start**
   ```bash
   npm run docker:build
   npm run docker:up
   ```

2. **Setup Database**
   ```bash
   docker-compose exec app npm run setup
   ```

## 📊 Database Schema

### Core Tables
- **users** - User management
- **detection_jobs** - Processing jobs with status tracking
- **detection_files** - Uploaded files with metadata
- **detection_results** - AI detection results
- **model_info** - AI model registry
- **audit_logs** - System activity logging

### Job Processing Flow
1. Files uploaded → `detection_files` table
2. Job created → `detection_jobs` table
3. Job queued → Redis/Bull queue
4. Worker processes files → Updates progress
5. Results stored → `detection_results` table
6. Real-time updates → WebSocket broadcasts

## 🤖 AI Model Integration

### Model Management
- **Dynamic Loading**: Models loaded on-demand
- **Memory Management**: Automatic unloading of unused models
- **Version Control**: Multiple model versions supported
- **Performance Metrics**: Accuracy and inference time tracking

### Supported Models
- **YOLO v5/v8**: Object detection for defects
- **Custom Models**: TensorFlow.js compatible models
- **Model Formats**: SavedModel, GraphModel, LayersModel

### Adding New Models
1. Place model files in `/models/{model-name}/`
2. Register via API: `POST /api/models`
3. Configure detection parameters
4. Test with sample images

## 🔄 Job Processing System

### Queue Management
- **Priority Queues**: High/normal/low priority jobs
- **Retry Logic**: Automatic retry on failures
- **Concurrency Control**: Configurable worker processes
- **Progress Tracking**: Real-time progress updates

### Processing Pipeline
1. **File Validation**: Format, size, content checks
2. **Preprocessing**: Image normalization and resizing
3. **AI Inference**: Model prediction execution
4. **Post-processing**: Result formatting and validation
5. **Storage**: Database persistence and file cleanup

## 📡 Real-time Features

### WebSocket Connections
- **Job Progress**: Live updates on processing status
- **File Status**: Individual file processing updates
- **System Status**: Health and performance metrics
- **Error Notifications**: Real-time error reporting

### Connection Management
- **Auto-reconnection**: Client-side reconnection logic
- **Subscription Model**: Channel-based message routing
- **Load Balancing**: Multiple WebSocket server support

## 🔧 API Endpoints

### Core APIs
- `POST /api/processing/batch` - Start batch processing
- `GET /api/processing/batch` - Get job status
- `DELETE /api/processing/batch` - Cancel job
- `GET /api/models` - List available models
- `POST /api/models` - Register new model
- `GET /api/system/status` - System health check

### Authentication & Security
- JWT token-based authentication
- Rate limiting on API endpoints
- File type validation and sanitization
- SQL injection prevention with Prisma

## 📈 Monitoring & Observability

### System Metrics
- **Performance**: Response times, throughput
- **Resources**: Memory, CPU, disk usage
- **Queue Stats**: Job counts, processing times
- **Error Rates**: Failed jobs, system errors

### Health Checks
- Database connectivity
- Redis availability
- Model loading status
- WebSocket connections

### Logging
- Structured logging with timestamps
- Error tracking and alerting
- Audit trail for compliance
- Performance profiling

## 🔒 Security Features

### Data Protection
- **Encryption**: Data at rest and in transit
- **Access Control**: Role-based permissions
- **File Validation**: Malware and format checking
- **Audit Logging**: Complete activity tracking

### Network Security
- HTTPS enforcement
- CORS configuration
- Rate limiting
- Input sanitization

## 🚀 Deployment Options

### Production Deployment
1. **Docker Compose** (Recommended)
2. **Kubernetes** with Helm charts
3. **Cloud Platforms** (AWS, GCP, Azure)
4. **Bare Metal** with PM2 process manager

### Scaling Strategies
- **Horizontal**: Multiple app instances
- **Vertical**: Increased resources per instance
- **Database**: Read replicas, connection pooling
- **Storage**: Distributed file systems

### Environment Configuration
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50000000

# AI Models
MODEL_STORAGE_PATH=./models
DEFAULT_MODEL_ID=yolo-defect-v1

# Security
JWT_SECRET=your-secret-key
API_RATE_LIMIT=100
```

## 🧪 Testing

### Test Coverage
- Unit tests for core services
- Integration tests for APIs
- End-to-end tests for workflows
- Performance tests for scalability

### Running Tests
```bash
npm test                 # All tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## 📝 Development Guidelines

### Code Structure
- **Services**: Business logic layer
- **API Routes**: HTTP endpoint handlers
- **Components**: React UI components
- **Types**: TypeScript definitions
- **Utils**: Helper functions

### Best Practices
- TypeScript for type safety
- Prisma for database operations
- Error handling with try-catch
- Logging for debugging
- Code formatting with Prettier

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request

## 📞 Support

### Documentation
- API documentation: `/docs/api`
- Model setup guide: `/docs/models`
- Deployment guide: `/docs/deployment`

### Troubleshooting
- Check system status: `GET /api/system/status`
- Review logs in `/logs` directory
- Monitor job queue in Redis
- Verify model files and configuration

---

**Built for Production** - Scalable, reliable, and maintainable AI-powered defect detection system.