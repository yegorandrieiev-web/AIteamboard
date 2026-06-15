
export type Task = {
  id: string;
  title: string;
  description?: string;
  userId: string;
  assignedToUserId: string;
  assignedToUser?: {
    username: string;
  };
};
