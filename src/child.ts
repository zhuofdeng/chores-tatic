import { User } from "./user";

export class Child extends User {
    constructor(public _id: number, public _name: string) {
        super(_id, _name, "child");
    }

    completeTask(taskId: number): void {
        if (this.assignedTtasks.includes(taskId)) {
            // Mark the task as completed (this would typically involve updating a Task object)
            // For simplicity, we just unassign the task here.
            this.unassignTask(taskId);
            // Optionally, you could also update totalEarnings based on the task's value.
        }
    }

    signupTask(taskId: number): void {
        this.assignTask(taskId);
    }
}