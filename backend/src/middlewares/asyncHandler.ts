import { Request, Response, NextFunction, RequestHandler } from 'express'

// Express 4 no captura errores de funciones async: los pasa al errorHandler
export const asyncHandler = <R extends Request>(fn: (req: R, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { fn(req as R, res, next).catch(next) }
