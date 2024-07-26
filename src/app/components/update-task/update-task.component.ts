import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskModel } from '../../models/TaskModel';
import { UserModel } from '../../models/UserModel';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Store } from '@ngrx/store';
import { TaskState } from 'zone.js/lib/zone-impl';
import { TaskActions } from '../../state/task/task.actions';
import { finalize, map } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Timestamp } from '@firebase/firestore';
import { el } from '@fullcalendar/core/internal-common';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-update-task',
  templateUrl: './update-task.component.html',
  styleUrl: './update-task.component.css'
})
export class UpdateTaskComponent implements OnInit {

  taskData!: TaskModel;
  taskForm!: FormGroup;
  task!: TaskModel[];
  statuses: any;
  users!: UserModel[];
  priority: any;
  user: any;
  selectedStatusName!: string;
  selectedAssigneeName!: string;
  selectedPriorityName!: string;
  items: string[] = []
  selectedFile: File | null = null;

  projectName!: string;

  constructor(public dialogRef: MatDialogRef<UpdateTaskComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private fb: FormBuilder, 
    private dashboardService: DashboardService,
    private authService: AuthService,
    private store: Store<{ tasks: TaskState }>,
    private datePipe: DatePipe,
    private storage: AngularFireStorage
  ){ }

  ngOnInit(): void {

    this.taskData = this.data;

    let formattedDate = this.formatDate(this.taskData.dueDate);

    this.taskForm = this.fb.group({
      id: [this.taskData.id],
      title: [this.taskData.title, Validators.required],
      description: [this.taskData.description],
      status: [this.taskData.status, Validators.required],
      statusName: [this.taskData.statusName],
      assigneeId: [this.taskData.assigneeId],
      assigneeName: [this.taskData.assigneeName],
      dueDate: [formattedDate],
      priority: [this.taskData.priority],
      priorityName: [this.taskData.priorityName],
      projectId: [this.taskData.projectId],
      dateCreated: [this.taskData.dateCreated],
      createdId: [this.taskData.createdId],
      dateModified: [this.taskData.dateModified],
      modifiedId: [this.taskData.modifiedId],
      attachment: [this.taskData.attachment],
      comments: this.fb.array([]),
      commentInput: ['']
    });

    this.initializeComments(this.taskData)

    this.getStatuses();

    this.getUsers();

    this.getPriority();

    this.dashboardService.getUsers("users").subscribe(users => {
      const username = this.authService.getUsername().getValue(); 
      this.user = users.find(user => user.username === username) || null;
    });

    this.dashboardService.getProjects("projects").pipe(
      map(projects => projects.find(project => project.id === this.taskData.projectId))
    ).subscribe((res: any)=>{
      this.projectName = res?.name.toString()
    })

  }


  initializeComments(taskData: any): void {
    const commentsArray = this.taskForm.get('comments') as FormArray;
    taskData.comments.forEach((comment: any) => {
      commentsArray.push(this.fb.group({
        taskId: comment.taskId,
        description: comment.description,
        createdById: comment.createdById,
        createBy: [comment.createdBy],
        dateCreated: comment.dateCreated
      }));
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); 
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  getStatuses(){
    this.dashboardService.getStatuses("status").subscribe(statuses => {
      this.statuses = statuses;
    });
  }

  getUsers(){
    this.dashboardService.getUsers("users").subscribe(users => {
      this.users = users;
      this.items = users.map(user => user.username);
    });
  }

  getPriority(){
    this.dashboardService.getPriority("priority").subscribe(priority => {
      this.priority = priority;
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onStatusChange(selectedId: any) {
    const selectedStatus = this.statuses.find((status: any) => status.id == selectedId.target.value);
    if (selectedStatus != null) {
      this.selectedStatusName = selectedStatus.name;
    }
  }

  onAssigneeChange(selectedId: any) {
    const selectedAssigne = this.users.find((user: any) => user.id == selectedId.target.value);
    if (selectedAssigne != null) {
      this.selectedAssigneeName = selectedAssigne.username;
    }
  }

  onPriorityChange(selectedId: any){
    const selectedPriority = this.priority.find((prio: any) => prio.id == selectedId.target.value);
    if (selectedPriority != null) {
      this.selectedPriorityName = selectedPriority.name;
    }
  }

  get commentsArray(): FormArray {
    return this.taskForm.get('comments') as FormArray;
  }


  onSubmit() {
    const control = this.taskForm.get('dueDate')?.value;

    this.taskForm.get('projectId')?.setValue(this.taskData.projectId);
    this.taskForm.get('dateModified')?.setValue(new Date());
    this.taskForm.get('modifiedId')?.setValue(this.user.id);
    this.taskForm.get('statusName')?.setValue(this.selectedStatusName != null ? this.selectedStatusName : this.taskData.statusName);
    this.taskForm.get('assigneeName')?.setValue(this.selectedAssigneeName != null ? this.selectedAssigneeName : this.taskData.assigneeName);
    this.taskForm.get('priorityName')?.setValue(this.selectedPriorityName != null ? this.selectedPriorityName : this.taskData.priorityName);
    this.taskForm.get('dueDate')?.setValue(new Date(control));

    if (this.taskForm.valid) {

      const commentInputValue = this.taskForm.get('commentInput')?.value;

      if (commentInputValue) {
        const commentsArray = this.commentsArray;
        commentsArray.push(this.fb.group({
          taskId: this.user.id,
          description: commentInputValue,
          createdById: this.user.id,
          createdBy: this.user.username,
          dateCreated: new Date()
        }));
      } 
  
      if(this.selectedFile){
        const filePath = `attachments/${Date.now()}_${this.selectedFile.name}`;
        const fileRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, this.selectedFile);

        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              this.taskForm.get('attachment')?.setValue(url);

              const newTask: TaskModel = {
                ...this.taskForm.value,
                comments: this.commentsArray.value
              }
        
              this.updateTask(newTask);
            });
          })
        ).subscribe()
      }
      else{
        const newTask: TaskModel = {
          ...this.taskForm.value,
          comments: this.commentsArray.value
        }
  
        this.updateTask(newTask);
      }
    

    }
    else{
      alert('Mandatory fields!!');
    }

  }

  updateTask(task: TaskModel): void {
    this.dashboardService.updateTask("tasks", task)
    this.store.dispatch(TaskActions.updateTask({ task: task }));
    this.dialogRef.close();
  };

  getCurrentDate(dateVal: any): string {
    const timestamppp = new Timestamp(dateVal.seconds, dateVal.nanoseconds);

    const date = timestamppp.toDate()

    return `${date}`;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }


}
