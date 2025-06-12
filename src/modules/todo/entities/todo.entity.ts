export type TodoStatus = 'pending' | 'done';

export class Todo {
  id: string;
  title: string;
  content: string;
  status: TodoStatus;
  dateTime: Date;
}
