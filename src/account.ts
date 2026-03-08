import { User } from "./user";

export class Account {
    public id: number;
    public name: string;
    public users: User[]; // Array of user IDs

    constructor(public _id: number, public _name: string) {
        this.id = _id;
        this.name = _name;
        this.users = [];
    }

    addUser(user: User): void {
        if (!this.users.includes(user)) {
            this.users.push(user);
        }
    }

    removeUser(user: User): void {
        this.users = this.users.filter(u => u !== user);
    }

    saveAccount(): void {
        // Implement saving account data to persistent storage (e.g., AsyncStorage, file system, etc.)
    }

    loadAccount(): void {
        // Implement loading account data from persistent storage
    }
}