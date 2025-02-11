import { Hono } from 'hono'
import {CreateStory,storyId, bulk, UpdateStory, } from '../Controller/StoryController'

export const StoryRoute = new Hono<{
    Bindings:{
        DATABASE_URL : string;
        JWT_SECRET: string;
    }
    Variable: {
        userId: string
    }
}>()

StoryRoute.post('/api/create', CreateStory)
StoryRoute.post('/api/updateStory', UpdateStory)
StoryRoute.get('/api/posts', storyId)
StoryRoute.get('/api/bulk', bulk)