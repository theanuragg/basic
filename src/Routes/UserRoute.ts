import { Hono } from "hono";
import { Signup, signin } from "../Controller/UserController";
export const userRoute = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

userRoute.post ('/signin', signin)
userRoute.post('/signup', Signup)

