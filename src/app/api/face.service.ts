import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Student } from '../models/Student';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FaceService {
  apiKey: string = "1d12bb2f0ad2412a8427bc0d4d8c2434";
  endpoint: string = "https://bizstudio.cognitiveservices.azure.com";
  personGroupId: string = "bizstudio_project_group_2";

  constructor(private http: HttpClient) { }

  createPersonGroup(): Observable<any> {
    let data = {
      name: "ProjectGroup2",
    }
    let url = `${this.endpoint}/face/v1.0/persongroups/${this.personGroupId}`;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': `${this.apiKey}`
      })
    }
    return this.http.put<any>(url, data, options).pipe(catchError(this.handleError));
  }

  createPerson(person: Student): Observable<{ personId: string }> {
    let data = {
      name: person.fullName,
      userData: JSON.stringify(person)
    }
    let url = `${this.endpoint}/face/v1.0/persongroups/${this.personGroupId}/persons`;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': `${this.apiKey}`
      })
    }
    return this.http.post<{ personId: string }>(url, data, options).pipe(catchError(this.handleError));
  }

  addPersonFace(personId: string, imageUrl: string) {
    let data = {
      url: `${imageUrl}`
    }
    let url = `${this.endpoint}/face/v1.0/persongroups/${this.personGroupId}/persons/${personId}/persistedFaces?detectionModel=detection_01`;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': `${this.apiKey}`
      })
    }
    return this.http.post<any>(url, data, options).pipe(catchError(this.handleError));
  }

  getPerson(personId: string): Observable<Student> {
    let url = `${this.endpoint}/face/v1.0/persongroups/${this.personGroupId}/persons/${personId}`;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': `${this.apiKey}`
      })
    }
    return this.http.get<{
      personId: string,
      persistedFaceIds: [],
      name: string,
      userData: string
    }>(url, options)
      .pipe(map(data => {
        let user: Student = JSON.parse(data.userData);
        return user;
      }), catchError(this.handleError));
  }

  detectFace(imageUrl: string): Observable<[{ faceId: string }]> {
    let data = {
      url: `${imageUrl}`
    }
    let url = `${this.endpoint}/face/v1.0/detect`;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': `${this.apiKey}`
      })
    }
    return this.http.post<any>(url, data, options).pipe(catchError(this.handleError));
  }

  train(): Observable<any> {
    let url = `${this.endpoint}/face/v1.0/persongroups/${this.personGroupId}/train`;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': `${this.apiKey}`
      })
    }
    return this.http.post<any>(url, undefined, options).pipe(catchError(this.handleError));
  }

  verifiyPerson(faces: string[]): Observable<[
    {
      faceId: string,
      candidates: [
        {
          personId: string,
          confidence: number
        }
      ]
    }]> {
    let data = {
      personGroupId: `${this.personGroupId}`,
      faceIds: faces,
      maxNumOfCandidatesReturned: 2,
      confidenceThreshold: 0.5
    }
    let url = `${this.endpoint}/face/v1.0/identify`;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': `${this.apiKey}`
      })
    }
    return this.http.post<any>(url, data, options).pipe(catchError(this.handleError));
  }

  private handleError = (error: any, result?: any): Observable<any> => {
    return of(undefined);
  };
}
