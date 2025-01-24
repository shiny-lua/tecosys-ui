FROM node:20.18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 7878

ENV HOST=0.0.0.0
ENV PORT=7878

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "7878"]
