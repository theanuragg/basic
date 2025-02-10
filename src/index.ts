import { Hono } from 'hono'
import {userRoute} from './Routes/UserRoute'
import { rateLimiter } from 'hono-rate-limiter'
import { jwtMiddleware } from "./middleware/authmiddleware"
const app = new Hono()


app.use('/story', jwtMiddleware, rateLimiter({
  windowMs: 1 * 60 *1000,
  limit: 10,
  standardHeaders:"draft-6",
  keyGenerator: (c) => "kathaioiio"
}))


app.get('/story',(c) => {
  return c.text('fuckkkkkkkkkkkkk')
})
app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.route('/auth',userRoute)

export default {
  port: 3000,
  fetch: app.fetch
}
