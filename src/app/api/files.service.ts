import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileDetails } from '../models/FileDetails';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Student } from '../models/Student';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private http: HttpClient) { }
  getFileByName(name: string): Observable<FileDetails> {
    return this.http.get<FileDetails>(this.fileAPI + `/${name}`, this.options)
      .pipe(catchError(this.handleError));
  }


  // DELETE => delete the file from the server
  deleteFile(name: string, folder: string): Observable<{
    successful: boolean,
    filename: string
  }> {
    const url = `${this.fileAPI}/sample/${folder}?filename=${name}`;
    return this.http.delete(url)
      .pipe(catchError(this.handleError));
  }




  // CREATE =>  POST: add a new file to the server
  createFile(file: Blob, name: string): Observable<FileDetails> {
    console.log(file);
    const options = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    }
    let formData: FormData = new FormData();
    formData.append('file', file, name);
    return this.http.post<FileDetails>(`${this.fileAPI}/sample/upload`, formData, options)
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



  private get fileAPI() {
    return "http://167.172.18.200/api/v2/files";
  }



  private get options() {
    return {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };
  }
}
