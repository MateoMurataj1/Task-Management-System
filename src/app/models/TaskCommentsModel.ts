export interface TaskCommentsModel {
    taskId: number;
    description: string;
    createdById: number;
    createdBy: string;
    dateCreated: Date;
}