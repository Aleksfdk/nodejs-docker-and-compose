export interface RequestWithUser extends Request {
  user: {
    id: number;
    username: string;
  };
}
