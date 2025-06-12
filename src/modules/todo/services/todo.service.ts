import { Injectable } from '@nestjs/common';
import { Todo } from '../entities/todo.entity';

@Injectable()
export class TodoService {
  private todos: Todo[] = [];

  create(data: Omit<Todo, 'id'>): Todo {
    const todo: Todo = {
      id: Date.now().toString(),
      ...data,
    };
    this.todos.push(todo);
    return todo;
  }

  findAll(): Todo[] {
    return this.todos;
  }
}
