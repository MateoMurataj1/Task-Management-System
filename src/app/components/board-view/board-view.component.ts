import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Store } from '@ngrx/store';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TaskActions } from '../../state/task/task.actions';
import { TaskState } from '../../state/task/task.reducer';
import { TaskModel } from '../../models/TaskModel';
import { selectAllTasks } from '../../state/task/task.selector';
import { UpdateTaskComponent } from '../update-task/update-task.component';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrl: './board-view.component.css'
})
export class BoardViewComponent implements OnInit, OnChanges  {

  @Input() projectId!: number;
  tasks!: TaskModel[];

  currectTask!: TaskModel;
  constructor(public dashboardService: DashboardService, private store: Store<{ tasks: TaskState }>, public dialog: MatDialog) {}

  ngOnInit(): void {

    this.store.select(selectAllTasks).subscribe(tasks => {
      this.tasks = tasks;
    })  
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadTasks(this.projectId );

  }

  loadTasks(projectId: number): void {
    this.dashboardService.getTasks("tasks", projectId).subscribe(tasks => {
      this.store.dispatch(TaskActions.loadTasks({ tasks }));
    });
  }

  filterTasks(statusId: string){
    return this.tasks.filter(task => task.status === statusId)
  }

  onDragStart(task: TaskModel){
    this.currectTask = task;
  }

  onDrop(event: any, statusId: string, statusName: string){

    const updatedTask = { ...this.currectTask, status: statusId, statusName: statusName };

    this.dashboardService.updateTask("tasks", updatedTask);
    this.store.dispatch(TaskActions.updateTask({ task: updatedTask }))
  }

  onDragOver(event: any){

    event.preventDefault();
  }

  getCurrentDate(dateVal: any): string {
    const date = new Date(dateVal);

    return `${date}`;
  }

  openDialog(task: TaskModel) {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = task;
    dialogConfig.width = '900px';
    dialogConfig.height = '560px';

    const dialogRef = this.dialog.open(UpdateTaskComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
