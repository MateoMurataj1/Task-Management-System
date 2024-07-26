import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { UserModel } from '../models/UserModel';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private apiUrl = 'api/users';
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private userRole = new BehaviorSubject<string>('');
  private userName = new BehaviorSubject<string>('');

  constructor(private http: HttpClient, private router: Router, private firestore: AngularFirestore) {}

  // login(username: string, password: string): Observable<any> {
  //   return this.http.get<any[]>(this.apiUrl).pipe(
  //     map(users => users.find(user => user.username === username && user.password === password)),
  //     tap(user => {
  //       if(user){
  //         const token = btoa(JSON.stringify({username: user.username, role: user.role}));
  //         localStorage.setItem('token', token);
  //         this.userRole.next(user.role);

  //         this.isAuthenticated.next(true);
  //       }
  //     })
  //   )
  // }

  login(username: string, password: string): Observable<any> {
    return this.firestore.collection('users', ref => ref.where('username', '==', username).where('password', '==', password)).valueChanges().pipe(
      map(users => users[0]),
      tap(user => {
        if(user){
          const token = btoa(JSON.stringify({username: user.username, role: user.role}));
          localStorage.setItem('token', token);
          this.userRole.next(user.role);
          this.isAuthenticated.next(true);
        }
      })
    )
  }

  logout(){
    localStorage.removeItem('token');
    this.isAuthenticated.next(false);
    this.userRole.next('');
    this.router.navigate(['/login']);
  }

  getRole(){
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token));
      this.userRole.next(payload.role);
    }
    return this.userRole;
  }

  getUsername(){
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token));
      this.userName.next(payload.username);
    }
    return this.userName;
  }

  isLoggedIn(){
    const token = localStorage.getItem('token');
    if(token){
      const payload = JSON.parse(atob(token));
      this.userRole.next(payload.role);
      this.isAuthenticated.next(true);
    }

    return this.isAuthenticated;
  }

}
