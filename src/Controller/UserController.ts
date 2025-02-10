import { Context, Hono } from "hono";
import { prisma } from "../Utlis/prisma";
import * as bcrypt from "bcrypt";
import { sign } from "hono/jwt";

export const userRoute = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

export const Signup = async (c: Context) => {
  const body = await c.req.json();

  try {
    const hashpassword = await bcrypt.hash(body.password, 10); // Use 10 rounds for better security
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashpassword,
      },
    });

    if (!user) {
      c.status(400);
      return c.json({ message: "Failed to create user" });
    }

    return c.json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Signup Error:", error);
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
};

export const signin = async (c: Context) => {
  const body = await c.req.json();

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      c.status(404);
      return c.json({ message: "User doesn't exist" });
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      c.status(401);
      return c.json({ message: "Invalid password" });
    }

    const token = await sign(
      {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      c.env.JWT_SECRET
    );

    return c.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Signin Error:", error);
    c.status(500);
    return c.json({ message: "Internal server error", error });
  }
};

