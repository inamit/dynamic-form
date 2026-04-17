FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json nx.json ./
COPY apps/permissions/permissions-orchestrator-service/package.json ./apps/permissions/permissions-orchestrator-service/
COPY libs/ ./libs/
RUN npm ci
COPY apps/permissions/permissions-orchestrator-service/ ./apps/permissions/permissions-orchestrator-service/
WORKDIR /app/apps/permissions/permissions-orchestrator-service
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=build /app/apps/permissions/permissions-orchestrator-service/package.json ./apps/permissions/permissions-orchestrator-service/
COPY libs/ ./libs/
RUN npm ci --omit=dev

COPY --from=build /app/apps/permissions/permissions-orchestrator-service/dist ./apps/permissions/permissions-orchestrator-service/dist

WORKDIR /app/apps/permissions/permissions-orchestrator-service
CMD ["npm", "start"]
