import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { ProjectModel } from '../models/ProjectModel';
import { UserModel } from '../models/UserModel';
import { TaskModel } from '../models/TaskModel';
import { TaskCommentsModel } from '../models/TaskCommentsModel';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {


  constructor() { }

  createDb() {
    const users: UserModel[]= [
      { id: 1, username: 'admin', password: 'admin', role: 'admin' },
      { id: 2, username: 'user', password: 'user', role: 'user' }
    ]
    
    const priority = [ 
      { id: 1, name: "Urgent" },
      { id: 2, name: "High" },
      { id: 3, name: "Normal" },
      { id: 4, name: "Low" }
    ]

    const status = [
      { id: 1, name: 'To Do', color: '#FF5733' },
      { id: 2, name: 'In Progress', color: '#FFC300' },
      { id: 3, name: 'In Review', color: '#C70039' },
      { id: 4, name: 'Done', color: '#DAF7A6'}
    ]

    const projects: ProjectModel[] = [
      { id: 1, name: 'Project One', description: 'This is First project' },
      { id: 2, name: 'Project Two', description: 'This is Second project' },
      { id: 3, name: 'Project Test', description: 'This is Test project' },
    ];

    // const tasks: TaskModel[] = [
    //   { id: 1, title: "Task1", description: 'This is te first description',  status: 1, statusName: 'To Do', projectId: 1, assigneeId: 1, assigneeName: 'admin', dueDate: new Date(), priority: 2, priorityName: 'Low', dateCreated: new Date(), createdId: 1, attachment: undefined, dateModified: new Date(), modifiedId: 1, comments: [] },
    //   { id: 3, title: "Task2", description: '',  status: 2, statusName: 'In Progress', projectId: 1, assigneeId: 1, assigneeName: 'admin', dueDate: new Date(), priority: 1,  priorityName: 'Low', dateCreated: new Date(), createdId: 1, attachment: undefined, dateModified: new Date(), modifiedId: 1, comments: [] },
    //   { id: 2, title: "Task3", description: '',  status: 3, statusName: 'In Review', projectId: 1, assigneeId: 1, assigneeName: 'admin', dueDate: new Date(), priority: 2,  priorityName: 'Low', dateCreated: new Date(), createdId: 1, attachment: undefined, dateModified: new Date(), modifiedId: 1, comments: [] },
    //   { id: 4, title: "Task4", description: '',  status: 4, statusName: 'Done', projectId: 1, assigneeId: 1, assigneeName: 'admin', dueDate: new Date(), priority: 3,  priorityName: 'Low', dateCreated: new Date(), createdId: 1, attachment: undefined, dateModified: new Date(), modifiedId: 1, comments: [] },
    //   { id: 5, title: "Task5", description: '',  status: 1, statusName: 'To Do', projectId: 1, assigneeId: 1, assigneeName: 'admin', dueDate: new Date(), priority: 4,  priorityName: 'Low', dateCreated: new Date(), createdId: 1, attachment: undefined, dateModified: new Date(), modifiedId: 1, comments: [] },
    //   { id: 6, title: "Task6", description: '',  status: 2, statusName: 'In Progress', projectId: 1, assigneeId: 1, assigneeName: 'admin', dueDate: new Date(), priority: 3,  priorityName: 'Low', dateCreated: new Date(), createdId: 1, attachment: undefined, dateModified: new Date(), modifiedId: 1, comments: [] },
    //   { id: 7, title: "Task00", description: '',  status: 3, statusName: 'In Review', projectId: 2, assigneeId: 1, assigneeName: 'admin', dueDate: new Date(), priority: 2,  priorityName: 'Low', dateCreated: new Date(), createdId: 1, attachment: undefined, dateModified: new Date(), modifiedId: 1, comments: [] },
    //   { id: 8, title: "Task32", description: '',  status: 3, statusName: 'In Review', projectId: 2  , assigneeId: 1, assigneeName: 'admin', dueDate: new Date(), priority: 3,  priorityName: 'Low', dateCreated: new Date(), createdId: 1, attachment: undefined, dateModified: new Date(), modifiedId: 1, comments: [] }
    // ]    

    // const taskComments: TaskCommentsModel[] = [
    //   { taskId: 1, description: 'this task is ...', assigneeId: 1 , dateCreated: new Date()  },
    //   { taskId: 1, description: 'this task is ...', assigneeId: 1 , dateCreated: new Date()  },
    //   { taskId: 2, description: 'this task is ...', assigneeId: 1 , dateCreated: new Date()  }
    // ]

    return { users, priority, projects, status } ;
  }

   

}
