import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ProjectModel } from '../models/ProjectModel';
import { TaskModel } from '../models/TaskModel';
import { UserModel } from '../models/UserModel';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private projectUrl = 'api/projects';
  private taskUrl = 'api/tasks';
  private statusUrl = 'api/status'
  private userUrl = 'api/users'
  private priorityUrl = 'api/priority'

  urll = 'https://taskmanagement-8ac04-default-rtdb.europe-west1.firebasedatabase.app/';
  constructor(private http: HttpClient, private router: Router, private firestore: AngularFirestore) { }

  getProjects(collectionName: string): Observable<ProjectModel[]>{
    return this.firestore.collection<ProjectModel>(collectionName).valueChanges();
  }

  getTasks(collectionName: string, projectId: number): Observable<TaskModel[]>{
    return this.firestore.collection<TaskModel>(collectionName).valueChanges().pipe(
      map(tasks => tasks.filter(task => task.projectId === projectId)),
      map(tasks => tasks.map(task => ({
        ...task,
        dueDate: this.convertToDate(task.dueDate),
        dateCreated: this.convertToDate(task.dateCreated),
        dateModified: this.convertToDate(task.dateModified)
      })))
    ) as Observable<TaskModel[]>;
  }
  private convertToDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  }

  createTask(task: TaskModel): Observable<any>{
    return from(this.firestore.collection('/tasks').add(task).then(docRef => {
      return docRef.update({ id: docRef.id }).then(() => {
        task.id = docRef.id;
        return task;
      });
    }));
  }

  updateTask(collectionName: string, task: TaskModel){
    this.deleteTask(collectionName, task);
    this.createTask(task);
  }

  deleteTask(collectionName: string, task: TaskModel): Observable<any> {
    return from(this.firestore.doc<TaskModel>(collectionName + '/' + task.id).delete())
  }

  getStatuses(collectionName: string): Observable<any> {
    return this.firestore.collection<any>(collectionName).valueChanges();
  }

  getUsers(collectionName: string): Observable<UserModel[]> {
    return this.firestore.collection<UserModel>(collectionName).valueChanges();
  }

  getPriority(collectionName: string): Observable<any[]> {
    return this.firestore.collection<any>(collectionName).valueChanges();
  }

  getStatusById(collectionName: string, id: number): Observable<any> {
    return this.firestore.collection<any>(collectionName).valueChanges().pipe(
      map(statuses => statuses.find(status => status.id === id))
    )
  }


}
