import express from 'express';
import { registrationUser , activateUser , loginUser, logoutUser } from '../controllers/user.controller';
import { isAuthenticatedUser } from '../middleware/auth';
const userRouter  = express.Router();


userRouter.post('/registration', registrationUser);

userRouter.post('/activate-user', activateUser);

userRouter.post('/login', loginUser);

userRouter.get('/logout', isAuthenticatedUser, logoutUser);


export default userRouter;