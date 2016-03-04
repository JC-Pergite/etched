FROM node:5.5.0

COPY . /app

WORKDIR /app

EXPOSE 80

RUN apt-get update && apt-get install -y libpq-dev

RUN /bin/bash -c 'cd /app && npm install'

CMD /bin/bash -c 'cd /app && PORT=80 npm start'