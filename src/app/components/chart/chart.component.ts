import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { TaskModel } from '../../models/TaskModel';
import { selectAllTasks } from '../../state/task/task.selector';
import { DashboardService } from '../../services/dashboard.service';
import { Store } from '@ngrx/store';
import { TaskState } from '../../state/task/task.reducer';
import { TaskActions } from '../../state/task/task.actions';
import { registerables } from 'chart.js';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent implements OnInit, OnChanges{

  @ViewChild('canvas') canvasRef!: ElementRef;

  @Input() projectId!: number;
  chart: Chart | null = null; // Initialize as Chart or null

  tasks: TaskModel[] = [];

  constructor(public dashboardService: DashboardService, private store: Store<{ tasks: TaskState }>, private reportService: ReportService) { 
    Chart.register(...registerables);

  }

  ngOnChanges(): void {
    this.loadTasks(this.projectId);

  }

  ngOnInit(): void {

    this.store.select(selectAllTasks).subscribe(tasks => {
      this.tasks = tasks;
    });

  }

  loadTasks(projectId: number): void {
    this.dashboardService.getTasks("tasks", projectId).subscribe(tasks => {

      this.store.dispatch(TaskActions.loadTasks({ tasks }));
      this.createChart(tasks);

    });
  }

  exportReport(): void {
    this.reportService.exportToExcel(this.tasks, 'TaskReport');
  }

  createChart(tasks: TaskModel[]): void {

    const ctx = this.canvasRef.nativeElement.getContext('2d');

    if (this.chart) {
      this.chart.destroy(); // Destroy the old chart instance
    }

    const priorityMap = this.getTasksByPriority(tasks);
    const completionRate = this.getCompletionRates(tasks);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(priorityMap),
        datasets: [
          {
            label: 'Tasks by Priority',
            data: Object.values(priorityMap),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Completion Rate (%)',
            data: new Array(Object.keys(priorityMap).length).fill(completionRate),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y-axis-2'
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          },
          'y-axis-2': {
            type: 'linear',
            position: 'right',
            beginAtZero: true
          }
        }
      }
    });

  }

  getCompletionRates(tasks: TaskModel[]): number {
    const completedTasks = tasks.filter(task => task.status === '4');
    const totalTasks = tasks.length;

    return (completedTasks.length / totalTasks) * 100;
  }

  getTasksByPriority(tasks: TaskModel[]): any {
    const priorityMap: { [key: string]: any } = {};
    tasks.forEach(task => {
      priorityMap[task.priorityName] = (priorityMap[task.priorityName] || 0) + 1;
    });
    return priorityMap;
  }

}
