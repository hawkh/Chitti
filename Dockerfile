FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Create uploads and models directories
RUN mkdir -p uploads models

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]