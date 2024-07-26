import { TaskCommentsModel } from "./TaskCommentsModel";

export interface TaskModel {
    id: string;
    title: string;
    description: string;
    status: string;
    statusName: string;
    projectId: number;
    assigneeId: string;
    assigneeName: string;
    dueDate: Date;
    priority: string;
    priorityName: string,
    dateCreated: Date;
    createdId: number;
    attachment?: File;
    dateModified?: Date;
    modifiedId?: number;
    comments?: TaskCommentsModel[];
}