import { Request, Response, NextFunction } from 'express';

export class IndexController {
    public getIndex(req: Request, res: Response, next: NextFunction): void {
        res.send('Hello from IndexController!');
    }
}