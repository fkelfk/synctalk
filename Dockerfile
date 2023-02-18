FROM node:16-alpine

WORKDIR /home/node

## 프로젝트의 모든 파일을 WORKDIR(/app)로 복사한다
COPY package.json yarn.lock ./ 


## Nest.js project를 build 한다

RUN yarn --frozen-lockfile

COPY . .


RUN yarn build


## application 실행
EXPOSE 3003
CMD ["yarn", "start:dev"]