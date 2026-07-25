FROM node:16-alpine AS builder

WORKDIR /app

# Кэшируем зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходники
COPY . .

# Собираем проект
RUN npm run build


FROM nginx:latest AS production

# Копируем конфиг nginx
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Копируем собранный фронтенд
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
