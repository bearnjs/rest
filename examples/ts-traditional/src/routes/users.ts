import { Handler, createRouter, validate } from "@bearn/rest";
import { z } from "zod";
import { createUser, getUsers } from "../controllers/users";

export const usersRouter = createRouter({ prefix: "/users" });

usersRouter.post("/", validate({
    params: z.object({ id: z.uuid() }),
    body: z.object({ name: z.string().max(2) })
}), createUser as Handler);

usersRouter.get("/", validate({
    query: z.object({
        limit: z.number().default(10),
        page: z.number().default(1)
    })
}), getUsers as Handler);