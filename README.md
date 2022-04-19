# COMMUNITY HEALTH SCREENING
---
## Mongodb setup:
- **Prerequisites:**
    - [docker](https://docs.docker.com/get-docker/)
    - [docker-compose](https://docs.docker.com/compose/install/)
- The mongodb is running as a docker container on my local.
- The mongo data is mounted onto the local file system(./mongp-db)
- 

- To spin up the mongodb, run the following:
```
$ docker-compose -f stack.yml up 
```
- The application is a **_node js_** application which by default run on port 3001

---
## Application setup:
- **Prerequisites:**
    - [nodejs](https://nodejs.org/en/download/)
    - [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)  

- To start the application:
```
$ npm install
$ npm start 
```

