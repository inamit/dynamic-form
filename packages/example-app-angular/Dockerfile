FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Angular uses its own build, copy it in
COPY packages/example-app-angular/ ./packages/example-app-angular/

# Install dependencies and build example-app-angular
RUN npm install
RUN npm run build --workspace=example-app-angular

# Nginx Image
FROM nginx:alpine

COPY --from=builder /app/packages/example-app-angular/dist/example-app-angular/browser /usr/share/nginx/html
COPY packages/example-app-angular/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh
# Ensure assets folder exists for env.js
RUN mkdir -p /usr/share/nginx/html/assets

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
