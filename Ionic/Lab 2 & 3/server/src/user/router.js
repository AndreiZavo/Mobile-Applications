import Router from 'koa-router';
import jwt from 'jsonwebtoken';

import userStore from "./store";
import {jwtConfig} from "../utils/constants";

export const router = new Router();

const createToken = (user) => {
    return jwt.sign({ username: user.username, _id: user._id },
        jwtConfig.secret,
        { expiresIn: 60 * 60 * 60 });
};

router.post('/login', async (context) => {
    const credentials = context.request.body;
    const response = context.response;

    const user = await userStore.findOne({ username: credentials.username });
    if(user && credentials.password === user.password) {
        response.body = { token: createToken(user) };
        response.status = 201; // created
    } else {
        response.body = { issue: [{ error: 'Invalid credentials!' }] };
        response.status = 400; // bad request
    }
});
