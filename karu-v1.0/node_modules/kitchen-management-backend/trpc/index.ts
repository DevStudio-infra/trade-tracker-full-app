import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import { createContext } from "./context";

/**
 * Initialize the tRPC API
 */
const t = initTRPC.context<typeof createContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers 
 */
export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
