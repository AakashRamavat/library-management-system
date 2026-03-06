declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
