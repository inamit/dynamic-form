FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json nx.json ./
COPY apps/permissions/external2-service/package.json ./apps/permissions/external2-service/
RUN npm ci
COPY apps/permissions/external2-service/ ./apps/permissions/external2-service/
WORKDIR /app/apps/permissions/external2-service
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=build /app/apps/permissions/external2-service/package.json ./apps/permissions/external2-service/
RUN npm ci --omit=dev

COPY --from=build /app/apps/permissions/external2-service/dist ./apps/permissions/external2-service/dist

WORKDIR /app/apps/permissions/external2-service
CMD ["npm", "start"]
