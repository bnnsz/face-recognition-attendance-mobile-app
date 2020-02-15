import { Injectable } from '@angular/core';
import { Student } from '../models/Student';
import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Attendance } from '../models/Attendance';

@Injectable({
  providedIn: 'root'
})
export class AttendanceeService {

  constructor(private http: HttpClient) { }

  registerStudent(student: Student): Observable<Student> {
    return this.http.post<Student>(`${this.attendanceAPI}/student/register`,student, this.options)
    .pipe(catchError(this.handleError));
  }

  createAttendance(personId: string):Observable<Attendance> {
    return this.http.post<Attendance>(`${this.attendanceAPI}/${personId}/create`,undefined, this.options)
      .pipe(catchError(this.handleError));
  }

  fetchAllAttendance(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.attendanceAPI}/all`, this.options)
      .pipe(catchError(this.handleError));
  }


  /*
   * Handle Http operation that failed.
   * Let the app continue.
 *
 * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError = (error: any, result?: any): Observable<any> => {
    return of(error ? undefined : result);
  };



  private get attendanceAPI() {
    return "http://167.172.18.200/api/v1/attendance";
  }



  private get options() {
    return {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };
  }
}
