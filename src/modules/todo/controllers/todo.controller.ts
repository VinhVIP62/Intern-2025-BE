import { Controller, Get, Post, Body } from '@nestjs/common';
import { TodoService } from '../services/todo.service';
import { Todo } from '../entities/todo.entity';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  findAll(): Todo[] {
    return this.todoService.findAll();
  }

  @Post()
  create(@Body() body: Omit<Todo, 'id'>): Todo {
    return this.todoService.create(body);
  }
}
