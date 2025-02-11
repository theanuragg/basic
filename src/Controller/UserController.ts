import { Context, Hono } from "hono";
import { prisma } from "../Utlis/prisma";
import * as bcrypt from "bcrypt";
import { sign } from "hono/jwt";
import { date, z } from "zod";

export const userRoute = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

const SignupSchemaInput = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const Signup = async (c: Context) => {
  const body = await c.req.json();
 console.log(body)
  if (body.name || body.email || body.password) {
    c.status(411);
    return c.json({ message: "invaild input", c });
  }
  try {
    const hashpassword = await bcrypt.hash(body.password, 10); 
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
    console.log(error);
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

export const update = async (c: Context) => {
  const body = await c.req.json();

  if (!body.email || body.name || body.password) {
    c.status(411);
    return c.json({ message: "missing feilds" });
  }

  const hashpassword = await bcrypt.hash(body.password, 6);
  try {
    const user = await prisma.user.update({
      where: {
        email: body.email,
      },
      data: {
        name: body.name,
        password: hashpassword,
      },
    });

    if (!user) {
      c.status(411);
      return c.json({ message: "wronng user " });
    }

    return c.json({ message: "update user", user });
  } catch (error) {
    c.status(500);
    return c.json({ error: "internal server error" });
  }
};

export const deleteUser = async (c: Context) => {
  const body = await c.req.json(); 

  if (!body.email) {
    c.status(400);
    return c.json({ message: "Email is needed" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      c.status(404);
      return c.json({ message: "User doesn't exists" });
    }
    await prisma.user.delete({
      where: { email: body.email },
    });

    return c.json({ message: "delete user" });
  } catch (error) {
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
};
