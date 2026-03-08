export class Task {
    public id: number;
    public title: string;
    public value: number;
    public completed: boolean;
    public assignedTo: number | null; // User ID of the child assigned to this task

    constructor(public _id: number, public _title: string, public _value: number) {
        this.id = _id;
        this.title = _title;
        this.value = _value;
        this.completed = false;
        this.assignedTo = null;
    }
}