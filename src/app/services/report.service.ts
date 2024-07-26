import { Injectable } from '@angular/core';
import { TaskModel } from '../models/TaskModel';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  getCompletionRates(tasks: TaskModel[]): any {
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


  exportToExcel(data: any[], fileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
}
