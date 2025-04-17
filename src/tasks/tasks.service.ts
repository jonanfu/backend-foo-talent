import { Injectable } from '@nestjs/common';
import { Task } from './task.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TasksService {
    private tasks: Task[] = [];
  
    findAll(userId: string): Task[] {
      return this.tasks.filter(task => task.userId === userId);
    }
  
    create(task: Omit<Task, 'id'>): Task {
      const newTask = { ...task, id: uuid() };
      this.tasks.push(newTask);
      return newTask;
    }
  
    update(id: string, userId: string, updated: Partial<Task>): Task | undefined {
      const task = this.tasks.find(t => t.id === id && t.userId === userId);
      if (task) Object.assign(task, updated);
      return task;
    }
  
    delete(id: string, userId: string): boolean {
      const index = this.tasks.findIndex(t => t.id === id && t.userId === userId);
      if (index >= 0) {
        this.tasks.splice(index, 1);
        return true;
      }
      return false;
    }
  }