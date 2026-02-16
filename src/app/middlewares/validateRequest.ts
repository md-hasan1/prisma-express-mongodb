import { NextFunction, Request, Response } from "express";
import { json } from "stream/consumers";
import { AnyZodObject } from "zod";

const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = req.body.data ? JSON.parse(req.body.data) : req.body;
      await schema.parseAsync(req.body);
      req.body.data=req.body.data && JSON.stringify(req.body)
      return next();
    } catch (err) {
      next(err);
    }
  };

export default validateRequest;
