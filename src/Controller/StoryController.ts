import { Hono } from "hono";
import { prisma } from "../Utlis/prisma";
import { Context } from "hono";

export const StoryRoute = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

export const CreateStory = async (c: Context) => {
  const body = await c.req.json();
  const payload = c.get("jwtPayload");
  const authorId = payload.userId;

  try {
    const post = await prisma.story.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: authorId,
        published: true,
      },
    });

    return c.json({ message: "Story created successfully", post });
  } catch (error) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export const UpdateStory = async (c: Context) => {
  const body = await c.req.json();

  if (body.title || body.content) {
    c.status(411);
    return c.json({ message: "inavild input " });
  }

  try {
    const update = await prisma.story.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    if (!update) {
      c.status(400);
      return c.json({ message: "update didn't success" });
    }
  } catch (error) {
    c.status(500);
    return c.json({ error: "internal server error " });
  }
};

export const storyId = async (c: Context) => {
  const id = await c.req.param("id");
  const body = await c.req.json();
  try {
    const story = await prisma.story.findUnique({
      where: {
        id: body.id,
      },
    });

    return c.json(story);
  } catch (error) {
    c.status(500);
    return c.json({ message: "internal server error" });
  }
};

export const bulk = async (c: Context) => {
  try{const posts = await prisma.story.findMany({});

  return c.json(posts);}
  catch(error){
    c.status(500)
    c.json({messge: "internal server error "})
  }
};
