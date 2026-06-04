# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies first (layer-cache friendly)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Serve with nginx ────────────────────────────────────────────────
FROM nginx:stable-alpine

# Remove the default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy the built SPA from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
