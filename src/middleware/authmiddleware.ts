import { verify } from "hono/jwt";
import { Context, Next } from "hono";

export const jwtMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    c.status(401);
    return c.json({ error: "Unauthorized - No Token Provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set("jwtPayload", payload); 
    await next(); 
  } catch (error) {
    c.status(500);
    return c.json({ error: " internal server error" });
  }
};
