import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import UserModel from '../user/userModel.js';
import type { Request, Response, NextFunction } from 'express';

const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {};
