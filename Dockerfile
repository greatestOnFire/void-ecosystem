FROM node:24.18.0-slim
WORKDIR /app

# 1. Копируем корневой конфиг
COPY package*.json ./

# 2. Копируем конфиги ВСЕХ пакетов и микросервисов для NPM Workspaces
COPY packages/core-query-builder/package*.json ./packages/core-query-builder/
COPY apps/auth-service/package*.json ./apps/auth-service/
COPY apps/payment-gateway/package*.json ./apps/payment-gateway/
COPY apps/marketplace-service/package*.json ./apps/marketplace-service/
COPY apps/analytics-logs-collector/package*.json ./apps/analytics-logs-collector/

# 3. Теперь установка увидит все дерево зависимостей
RUN npm install

# 4. Копируем остальной код
COPY . .

CMD ["npm", "test"]
