import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProjectModel } from '../../models/ProjectModel';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TaskModel } from '../../models/TaskModel';
import { DashboardService } from '../../services/dashboard.service';
import { UserModel } from '../../models/UserModel';
import { AuthService } from '../../services/auth.service';
import { TaskActions } from '../../state/task/task.actions';
import { TaskState } from 'zone.js/lib/zone-impl';
import { Store } from '@ngrx/store';
import { TaskCommentsModel } from '../../models/TaskCommentsModel';
import { finalize, from, Observable, of } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.css'
})
export class CreateTaskComponent implements OnInit {

  projectData!: ProjectModel;
  taskForm: FormGroup;
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

  constructor(public dialogRef: MatDialogRef<CreateTaskComponent>, 
              @Inject(MAT_DIALOG_DATA) public data: any, 
              private fb: FormBuilder, 
              private dashboardService: DashboardService,
              private authService: AuthService,
              private store: Store<{ tasks: TaskState }>,
              private storage: AngularFireStorage
            ){

    this.taskForm = this.fb.group({
      id: [null, Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],
      statusName: [''],
      projectId: [null, Validators.required],
      assigneeId: ['', Validators.required],
      assigneeName: [''],
      dueDate: [null, Validators.required],
      priority: ['', Validators.required],
      priorityName: [''],
      dateCreated: [null, Validators.required],
      createdId: [null, Validators.required],
      attachment: [undefined],
      dateModified: [undefined],
      modifiedId: [undefined],
      comments: this.fb.array([]),
      commentInput: ['']
    });

  }

  ngOnInit(): void {

    this.projectData = this.data;

    this.getStatuses();

    this.getUsers();

    this.getPriority();

    this.dashboardService.getUsers("users").subscribe(users => {
      const username = this.authService.getUsername().getValue();
      this.user = users.find(user => user.username === username) || null;
    });

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

  createCommentGroup(comment: TaskCommentsModel): FormGroup {
    return this.fb.group({
      taskId: [comment.taskId],
      description: [comment.description],
      createdById: [comment.createdById],
      createBy: [comment.createdBy],
      dateCreated: [comment.dateCreated]
    });
  }

  get commentsArray(): FormArray {
    return this.taskForm.get('comments') as FormArray;
  }

  onSubmit() {

    const control = this.taskForm.get('dueDate')?.value;

    this.taskForm.get('id')?.setValue(Math.random().toString());
    this.taskForm.get('dateCreated')?.setValue(new Date());
    this.taskForm.get('createdId')?.setValue(this.user.id);
    this.taskForm.get('projectId')?.setValue(this.projectData.id);
    this.taskForm.get('statusName')?.setValue(this.selectedStatusName);
    this.taskForm.get('assigneeName')?.setValue(this.selectedAssigneeName);
    this.taskForm.get('priorityName')?.setValue(this.selectedPriorityName);
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
              };

              this.createTask(newTask);
            });
          })
        ).subscribe()
      }
      else{
        const newTask: TaskModel = {
          ...this.taskForm.value,
          comments: this.commentsArray.value
        };

        this.createTask(newTask);
      }

  
    }
    else{
      alert('Mandatory fields!!');
    }

  }

  createTask(task: TaskModel): void {

    this.dashboardService.createTask(task).subscribe(res=>{
      this.store.dispatch(TaskActions.createTask({ task: task }))
      this.dialogRef.close();
    });

  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }


}

