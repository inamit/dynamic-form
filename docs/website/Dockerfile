# Stage 1: Build the Docusaurus static site
FROM node:22-alpine AS builder

WORKDIR /app/docs/website

# Copy package files for caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the Docusaurus project
COPY . .

# Build the site
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=builder /app/docs/website/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
