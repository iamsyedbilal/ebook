import express from 'express';
import {
    createUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
} from './userController.js';

const userRouter = express.Router();

userRouter.post('/register', createUser);

userRouter.post('/login', loginUser);

userRouter.post('/logout', logoutUser);

userRouter.post('/refresh-token', refreshAccessToken);

export default userRouter;
