FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy shared-ui package which is a dependency
COPY packages/shared-ui/ ./packages/shared-ui/
COPY packages/example-app/ ./packages/example-app/

# Install dependencies and build shared-ui then example-app
RUN npm install
RUN npm run build --workspace=@dynamic-form/shared-ui
RUN npm run build --workspace=example-app

# Nginx Image
FROM nginx:alpine

COPY --from=builder /app/packages/example-app/dist /usr/share/nginx/html
COPY packages/example-app/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
