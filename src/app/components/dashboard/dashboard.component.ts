import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { ProjectModel } from '../../models/ProjectModel';
import { CreateTaskComponent } from '../create-task/create-task.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  username: string = "";
  role: string = "";
  projects: ProjectModel[] = [];
  selectedProject!: ProjectModel;

  constructor(public authService: AuthService, public dashboardService: DashboardService, public dialog: MatDialog, public translate: TranslateService){
    translate.setDefaultLang('en');
    translate.setDefaultLang('en');
    this.translate.use('en')
  }

  ngOnInit(): void {

    this.authService.getUsername().subscribe(res => {
      this.username = res;
    });

    this.authService.getRole().subscribe(res => {
      this.role = res;
    });

    this.dashboardService.getProjects("projects").subscribe(res=>{
      this.projects = res;
    })  

  }

  onProjectClick(project: ProjectModel){
    this.selectedProject = project;
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.selectedProject;
    dialogConfig.width = '900px';
    // dialogConfig.height = '560px';

    const dialogRef = this.dialog.open(CreateTaskComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
    });
  }


  logout(){
    this.authService.logout();
  }


}
