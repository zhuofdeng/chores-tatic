export class User {
    public id: number;
    public name: string;
    public assignedTtasks: number[]; // Array of task IDs
    public totalEarnings: number;
    public userType: "parent" | "child";

    constructor(public _id: number, public _name: string, public _userType: "parent" | "child") {
        this.id = _id;
        this.name = _name;
        this.userType = _userType;
        this.assignedTtasks = [];
        this.totalEarnings = 0;
    }

    assignTask(taskId: number): void {
        if (!this.assignedTtasks.includes(taskId)) {
            this.assignedTtasks.push(taskId);
        }
    }

    unassignTask(taskId: number): void {
        this.assignedTtasks = this.assignedTtasks.filter(id => id !== taskId);
    }

    saveTasks(): void {
        // Implement saving user data to persistent storage (e.g., AsyncStorage, file system, etc.)
    }

    loadTasks(): void {
        // Implement loading user data from persistent storage
    }

    savceUser(): void {
        // Implement saving user data to persistent storage (e.g., AsyncStorage, file system, etc.)
    }

    loadUser(): void {
        // Implement loading user data from persistent storage
    }

    completeTask(taskId: number, taskValue: number): void {
        if (this.assignedTtasks.includes(taskId)) {
            this.totalEarnings += taskValue;
            this.unassignTask(taskId);
        }
    }
}