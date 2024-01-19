FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

RUN touch /opt/db.json

RUN chmod 777 /opt/db.json

CMD [ "npm", "start" ]