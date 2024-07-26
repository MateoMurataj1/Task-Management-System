import { createReducer, on } from "@ngrx/store";
import { TaskModel } from "../../models/TaskModel";
import { TaskActions } from "./task.actions";


export interface TaskState {
  tasks: TaskModel[];
}

export const initialState: TaskState = {
  tasks: [],
};

export const taskReducer = createReducer(
  initialState,
  on(TaskActions.loadTasks, (state, { tasks }) => ({ ...state, tasks })),
  on(TaskActions.createTask, (state, { task }) => ({ ...state, tasks: [...state.tasks, task] })),
  on(TaskActions.updateTask, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map(t => t.id === task.id ? task : t)
  })),
  on(TaskActions.deleteTask, (state, { taskId }) => ({
    ...state,
    tasks: state.tasks.filter(t => t.id !== taskId)
  }))
);
