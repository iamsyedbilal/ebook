import { Router } from 'express';
import { login, logout, refreshAccessToken, register } from './auth.controller.js';
import verifyJWT from '../../middlewares/verifyJWT.js';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', verifyJWT, logout);
// Refresh uses the refresh-token cookie, not the expired access token.
authRouter.post('/refresh-token', refreshAccessToken);

export default authRouter;
