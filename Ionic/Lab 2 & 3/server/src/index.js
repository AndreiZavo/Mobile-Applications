import Koa from 'koa';
import WebSocket from 'ws';
import http from 'http';
import Router from 'koa-router';
import bodyParser from "koa-bodyparser";
import jwt from 'koa-jwt';
import cors from '@koa/cors';

/*timingLogger, exceptionHandler, jwtConfig,*/
import { initWss} from './utils/wss';
import { router as restaurantRouter } from './movie/router';
import { router as userRouter } from './user/router';
import { exceptionHandler, timingLogger } from "./utils/middlewares";
import { jwtConfig } from "./utils/constants";

const application = new Koa();
const server = http.createServer(application.callback());
const webSocketServer = new WebSocket.Server({ server });

initWss(webSocketServer);

application.use(cors());
application.use(timingLogger);
application.use(exceptionHandler);
application.use(bodyParser());

const prefix = '/api';

// public routes
const publicApiRouter = new Router({ prefix });
publicApiRouter.use('/auth', userRouter.routes());
application.use(publicApiRouter.routes())
           .use(publicApiRouter.allowedMethods());

application.use(jwt(jwtConfig));

// protected routes
const protectedApiRouter = new Router({ prefix });
protectedApiRouter.use('/movie', restaurantRouter.routes());

application.use(protectedApiRouter.routes())
           .use(protectedApiRouter.allowedMethods());

server.listen(3000);
console.log('started on port 3000');
console.log(restaurantRouter.stack.map(i => i.path));
