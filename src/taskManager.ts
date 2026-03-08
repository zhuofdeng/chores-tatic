import { Task } from './task';
import { User } from './user';

export class TaskManager {
    private tasks: Task[] = [];
    private nextId: number = 1;

    constructor() {
        this.loadTasks();
    }

    addTask(title: string, value: number): Task {
        const task = new Task(this.nextId++, title, value);
        this.tasks.push(task);
        return task;
    }

    getTasks(): Task[] {
        return this.tasks;
    }

    completeTask(id: number): void {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = true;
        }
    }

    deleteTask(id: number): void {
        this.tasks = this.tasks.filter(t => t.id !== id);
    }

    saveTasks(): void {
        // Implement saving tasks to persistent storage (e.g., AsyncStorage, file system, etc.)
    }

    loadTasks(): void {
        // Implement loading tasks from persistent storage
    }

    getTasksByUser(userId: number): Task[] {
        return this.tasks.filter(t => t.assignedTo === userId);
    }

    getUnassignedTasks(): Task[] {
        return this.tasks.filter(t => t.assignedTo === null);
    }

    assignTaskToUser(taskId: number, user: User): void {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.assignedTo = user._id;
            user.assignTask(taskId);
        }
    }

    unassignTaskFromUser(taskId: number, user: User): void {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.assignedTo = null;
            user.unassignTask(taskId);
        }
    }

    resetAllTasks(): void {
        this.tasks.forEach(task => {
            task.completed = false;
            task.assignedTo = null;
        });
        this.saveTasks();
    }
}