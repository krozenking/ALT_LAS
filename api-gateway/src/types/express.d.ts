import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';

// Kullanıcı bilgisi için genişletilmiş Request tipi
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: string[];
        permissions: string[];
        [key: string]: unknown;
      };
    }
  }
}

// Express modülünü genişlet
declare module 'express-serve-static-core' {
  interface IRouterMatcher<T> {
    (path: string, ...handlers: Array<(req: ExpressRequest, res: ExpressResponse, next: NextFunction) => Promise<void> | void>): T;
  }

  interface IRouter {
    get: IRouterMatcher<this>;
    post: IRouterMatcher<this>;
    put: IRouterMatcher<this>;
    delete: IRouterMatcher<this>;
    patch: IRouterMatcher<this>;
    options: IRouterMatcher<this>;
    head: IRouterMatcher<this>;
  }
}
