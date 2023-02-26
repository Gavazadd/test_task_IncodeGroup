FROM node:16-alpine
RUN npm install -g nodemon
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD [ "npm", "uninstall", "bcrypt" ]
CMD [ "npm", "install", "bcrypt" ]
EXPOSE 5000
CMD ["node", "app.js"]