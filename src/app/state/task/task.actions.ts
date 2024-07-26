import { createAction, props } from "@ngrx/store";
import { TaskModel } from "../../models/TaskModel";

export namespace TaskActions {

    export const loadTasks = createAction('[Task] Load Tasks', props<{ tasks: TaskModel[] }>());
    export const createTask = createAction('[Task] Create Task', props<{ task: TaskModel }>());
    export const updateTask = createAction('[Task] Update Task', props<{ task: TaskModel }>());
    export const deleteTask = createAction('[Task] Delete Task', props<{ taskId: string }>());
}

