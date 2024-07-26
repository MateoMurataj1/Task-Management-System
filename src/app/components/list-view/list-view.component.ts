import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { TaskModel } from '../../models/TaskModel';
import { Store } from '@ngrx/store';
import { TaskActions } from '../../state/task/task.actions';
import { TaskState } from '../../state/task/task.reducer';
import { selectAllTasks } from '../../state/task/task.selector';
import { map, Observable } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProjectModel } from '../../models/ProjectModel';
import { UpdateTaskComponent } from '../update-task/update-task.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css'
})
export class ListViewComponent implements OnInit, OnChanges {

  @Input() projectId!: number;
  tasks!: TaskModel[];
  selectedProject!: ProjectModel;

  filteredTasks!: TaskModel[];
  sortColumn: string = 'title';
  sortDirection: string = 'asc';
  filterText: string = '';
  groupBy: string = '';

  constructor(public dashboardService: DashboardService, private store: Store<{ tasks: TaskState }>, public dialog: MatDialog) {}

  ngOnChanges(): void {

    this.loadTasks(this.projectId);
  }

  ngOnInit(): void {

    this.store.select(selectAllTasks).subscribe(tasks => {
      this.tasks = tasks;
      this.applyFilters();
    })

  }

  loadTasks(projectId: number): void {
    this.dashboardService.getTasks("tasks", projectId).subscribe(tasks => {
      this.store.dispatch(TaskActions.loadTasks({ tasks }));
    });
  }

  deleteTask(task: TaskModel){
    if (window.confirm('Are you sure you want to delete this task?')) {

      this.dashboardService.deleteTask("tasks", task).subscribe(res=>{
        this.store.dispatch(TaskActions.deleteTask({ taskId: task.id }))
      })

    }
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

  applyFilters(): void {
    this.filteredTasks = this.tasks
      .filter(task => task.title.includes(this.filterText))
      .sort((a, b) => {
        const isAsc = this.sortDirection === 'asc';
        switch (this.sortColumn) {
          case 'title': return this.compare(a.title, b.title, isAsc);
          case 'statusName': return this.compare(a.statusName, b.statusName, isAsc);
          case 'assigneeName': return this.compare(a.assigneeName, b.assigneeName, isAsc);
          case 'dueDate': return this.compare(a.dueDate, b.dueDate, isAsc);
          case 'priorityName': return this.compare(a.priorityName, b.priorityName, isAsc);
          case 'dateCreated': return this.compare(a.dateCreated, b.dateCreated, isAsc);
          default: return 0;
        }
      });
  }

  compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  onSortChange(column: any): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  isSortedAsc(column: string): boolean {
    return this.sortColumn === column && this.sortDirection === 'asc';
  }

  isSortedDesc(column: string): boolean {
    return this.sortColumn === column && this.sortDirection === 'desc';
  }

  onFilterChange(filterText: any): void {
    this.filterText = filterText.target.value;
    this.applyFilters();
  }

  onGroupChange(groupBy: any): void {
    this.groupBy = groupBy.target.value;
    this.applyFilters();
  }


}
