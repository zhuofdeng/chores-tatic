import { Child } from "./child";
import { User } from "./user";

export class Parent extends User {

    children: Child[];
    constructor(public _id: number, public _name: string) {
        super(_id, _name, "parent");
        this.children = [];
    }

    assignTaskToUser(taskId: number, user: Child): void {
        user.assignTask(taskId);
    }

    unassignTaskFromUser(taskId: number, user: Child): void {
        user.unassignTask(taskId);
    }

    addChild(childId: number, childName: string): void {
        // Implement adding a child to the parent
        const newChild = new Child(childId, childName);
        this.children.push(newChild);
    }

    removeChild(childId: number): void {
        this.children = this.children.filter(c => c.id !== childId);
    }

    saveParent(): void {
        // Implement saving parent data to persistent storage (e.g., AsyncStorage, file system, etc.)
    }

    loadParent(): void {
        // Implement loading parent data from persistent storage
    }
}