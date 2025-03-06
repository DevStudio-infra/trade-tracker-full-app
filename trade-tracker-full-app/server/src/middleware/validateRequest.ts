import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export const validateRequest = (schema: { body?: AnyZodObject; query?: AnyZodObject; params?: AnyZodObject }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      return res.status(400).json({ error: "Invalid request data" });
    }
  };
};
