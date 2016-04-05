FROM node:5.5.0

COPY . /app

WORKDIR /app

EXPOSE 80

ENV PORT 80

RUN /bin/bash -c 'cd /app && npm install'

CMD /bin/bash -c 'cd /app && npm start'