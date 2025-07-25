# Deployment Guide

## Prerequisites

1. **Node.js 18+** installed
2. **npm or yarn** package manager
3. **Model files** (see MODEL_SETUP.md)

## Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Set up model files**
   - Follow instructions in MODEL_SETUP.md
   - Place model files in `public/models/yolo-defect-detector/`

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t chitti-ai-ndt .
   docker run -p 3000:3000 chitti-ai-ndt
   ```

## Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_MODEL_BASE_URL`: Base URL for model files
- `NEXT_PUBLIC_API_BASE_URL`: API base URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_VERSION`: Application version

## Performance Optimization

1. **Model Loading**
   - Use CDN for model files
   - Implement model caching
   - Consider model quantization

2. **Image Processing**
   - Optimize image sizes
   - Use WebP format when possible
   - Implement lazy loading

3. **Bundle Optimization**
   - Enable tree shaking
   - Use dynamic imports
   - Optimize dependencies

## Monitoring

1. **Error Tracking**
   - Integrate with Sentry or similar
   - Monitor client-side errors
   - Track model loading failures

2. **Performance Monitoring**
   - Monitor detection processing times
   - Track memory usage
   - Monitor API response times

3. **Analytics**
   - Track user interactions
   - Monitor detection accuracy
   - Analyze usage patterns

## Security Considerations

1. **File Upload Security**
   - Validate file types
   - Limit file sizes
   - Scan for malware

2. **API Security**
   - Implement rate limiting
   - Use HTTPS only
   - Validate all inputs

3. **Model Security**
   - Protect model files
   - Implement access controls
   - Monitor for tampering

## Troubleshooting

### Common Issues

1. **Model Loading Fails**
   - Check model file paths
   - Verify file permissions
   - Check network connectivity

2. **Memory Issues**
   - Reduce batch sizes
   - Implement model disposal
   - Monitor memory usage

3. **Performance Issues**
   - Optimize image preprocessing
   - Use Web Workers for processing
   - Implement result caching

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

### Health Checks

Implement health check endpoints:
- `/api/health` - Basic health check
- `/api/health/model` - Model availability check
- `/api/health/storage` - Storage availability check