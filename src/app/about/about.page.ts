import { Component, OnInit } from '@angular/core';
import { AttendanceeService } from '../api/attendancee.service';
import { Attendance } from '../models/Attendance';

@Component({
  selector: 'app-about',
  templateUrl: 'about.page.html',
  styleUrls: ['about.page.scss']
})
export class AboutPage implements OnInit {
  
  attendances:Attendance[];

  constructor(
    private attendanceService: AttendanceeService
  ) { }

  
  ngOnInit(): void {
    this.attendanceService.fetchAllAttendance().subscribe(data => {
      this.attendances = data;
    });
  }
}
