FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy shared-ui package which is a dependency
COPY packages/shared-ui/ ./packages/shared-ui/
COPY packages/management-client/ ./packages/management-client/

# Install dependencies and build shared-ui then management-client
RUN npm install
RUN npm run build --workspace=@dynamic-form/shared-ui
RUN npm run build --workspace=management-client

# Nginx Image
FROM nginx:alpine

COPY --from=builder /app/packages/management-client/dist /usr/share/nginx/html
COPY packages/management-client/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
