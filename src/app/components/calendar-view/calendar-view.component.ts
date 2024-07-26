import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Store } from '@ngrx/store';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TaskModel } from '../../models/TaskModel';
import { ProjectModel } from '../../models/ProjectModel';
import { selectAllTasks } from '../../state/task/task.selector';
import { TaskActions } from '../../state/task/task.actions';
import { TaskState } from '../../state/task/task.reducer';
import { CalendarOptions, EventClickArg, EventContentArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Timestamp } from '@firebase/firestore';
import { UpdateTaskComponent } from '../update-task/update-task.component';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.css'
})
export class CalendarViewComponent implements OnInit, OnChanges, AfterViewInit  {

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    events: [],
    headerToolbar: {
      right: 'prev,next',
      center: 'title',
      left: 'today'
    },
    eventClick: this.handleEventClick.bind(this),
    eventContent: this.eventContent.bind(this)
  };

  @Input() projectId!: number;
  tasks!: TaskModel[];
  selectedProject!: ProjectModel;

  id!: string;

  constructor(public dashboardService: DashboardService, private store: Store<{ tasks: TaskState }>, public dialog: MatDialog,    private cdr: ChangeDetectorRef  ) {}

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {

    this.store.select(selectAllTasks).subscribe(tasks => {
      this.tasks = tasks;

      if (this.tasks.length > 0) {
        this.setCalendarOptions();
      }
    })

  }

  setCalendarOptions(): void {
    if (this.tasks) {
      this.calendarOptions.events = this.tasks.map(task => ({
        title: task.title,
        date: task.dueDate instanceof Timestamp ? task.dueDate.toDate().toISOString().split('T')[0] : new Date(task.dueDate).toISOString().split('T')[0],
        extendedProps: {
          id: task.id,
          description: task.description,
          statusName: task.statusName,
        }
      }));
    }
  }

  eventContent(info: EventContentArg) {
    const { event } = info;

    const id = event.extendedProps['id'] ? `${event.extendedProps['id']}` : '';
    const description = event.extendedProps['description'] ? `<div>${event.extendedProps['description']}</div>` : '';
    const statusName = event.extendedProps['statusName'] ? `<div>Status: ${event.extendedProps['statusName']}</div>` : '';

    this.id = id;

    return {
      html: `
        <div>
          <div>
          <strong>${event.title}</strong>
          ${description}
          ${statusName}
        </div>
      `
    };
  }

  ngOnChanges(): void {

    this.loadTasks(this.projectId);
    this.setCalendarOptions();

  }

  loadTasks(projectId: number): void {
    this.dashboardService.getTasks("tasks", projectId).subscribe(tasks => {
      this.store.dispatch(TaskActions.loadTasks({ tasks }));
    });
  }

  handleEventClick(clickInfo: EventClickArg): void {

    const task = this.tasks.find(t => t.id == this.id);

    if (task) {
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

}
