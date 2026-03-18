FROM node:20.16.0-slim

WORKDIR /app

# Копируем конфиги монорепозитория
COPY package*.json ./
# ВАЖНО: Если у тебя уже есть папка packages/core-query-builder
COPY packages/core-query-builder/package*.json ./packages/core-query-builder/

# Установка зависимостей
RUN npm install

# Копируем остальной код проекта
COPY . .

# При запуске контейнера по умолчанию выполняем тесты
CMD ["npm", "test"]
