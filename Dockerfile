FROM node:20.16.0-slim
WORKDIR /app

# 1. Копируем корневой конфиг
COPY package*.json ./

# 2. Копируем конфиги ВСЕХ пакетов и приложений (важно для Workspaces)
COPY packages/core-query-builder/package*.json ./packages/core-query-builder/
COPY apps/auth-service/package*.json ./apps/auth-service/

# 3. Теперь установка увидит все дерево зависимостей
RUN npm install

# 4. Копируем остальной код
COPY . .

CMD ["npm", "test"]
