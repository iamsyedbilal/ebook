import express from 'express';
import {
    createUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
} from './userController.js';
import verifyJWT from '../middlewares/verifyJWT.js';

const userRouter = express.Router();

userRouter.post('/register', createUser);

userRouter.post('/login', loginUser);

userRouter.post('/logout', verifyJWT, logoutUser);

userRouter.post('/refresh-token', verifyJWT, refreshAccessToken);

export default userRouter;
