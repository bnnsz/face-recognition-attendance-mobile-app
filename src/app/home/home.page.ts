import { Component } from '@angular/core';
import { ModalController, LoadingController, AlertController } from '@ionic/angular';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FilesService } from '../api/files.service';
import { stringify } from 'querystring';
import { FaceService } from '../api/face.service';
import { AttendanceeService } from '../api/attendancee.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  pic: string = '/assets/shapes.svg';

  constructor(public modalCtrl: ModalController,
    private filesService: FilesService,
    private faceservice: FaceService,
    private attendanceService: AttendanceeService,
    private loadCtrl: LoadingController,
    private alertCtrl: AlertController,
    private transfer: FileTransfer,
    private camera: Camera) { }


  async imageCapture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true,
      encodingType: this.camera.EncodingType.JPEG,
      saveToPhotoAlbum: false
    }
    this.camera.getPicture(options).then((ImageData => {
      this.pic = "data:image/jpeg;base64," + ImageData;
      this.loadCtrl.create({ message: "Uploading image on server please wait ...." })
        .then(loader => {
          loader.present();
          this.filesService.createFile(
            this.getImage(this.pic),
            this.generateName()
          ).subscribe(resp => {
            if (!resp) {
              loader.dismiss();
              this.alertCtrl
                .create({ message: "Err: Please try again" })
                .then(alert => alert.present());
              return;
            }
            loader.message = "Detecting face on image please wait ...."
            this.faceservice
              .detectFace(resp.link)
              .subscribe(faces => {
                if (!faces) {
                  loader.dismiss();
                  this.alertCtrl
                    .create({ message: "Err: Please try again" })
                    .then(alert => alert.present());
                  return;
                }

                if (faces.length > 1) {
                  this.alertCtrl
                    .create({ message: "Multple faces detected, only 1 face is required" })
                    .then(alert => alert.present());
                  return;
                }
                loader.message = `Identifying face please wait ....`
                this.faceservice.verifiyPerson(faces.map(face => face.faceId))
                  .subscribe(persons => {
                    if (persons && persons.length > 0 && persons[0].candidates && persons[0].candidates.length > 0) {
                      this.attendanceService
                        .createAttendance(persons[0].candidates[0].personId)
                        .subscribe(attendance => {
                          let message;
                          if (attendance) {
                            let mm = attendance.exitTime ? "Clocked out" : "Clocked in";
                            message = `${attendance.student.fullName} ${mm}`;
                          }else{
                            message = "No match found";
                          }
                          loader.dismiss();
                          this.alertCtrl
                          .create({ message: message })
                          .then(alert => alert.present());
                        });
                    } else {
                      loader.dismiss();
                      this.alertCtrl
                        .create({ message: "No match found" })
                        .then(alert => alert.present());
                    }
                  })
              })


          })
        });
    }), error => {
      console.log(error);
    });
  }

  handleError(loader: any) {
    loader.dismiss();
    this.alertCtrl
      .create({ message: "Err: Please try again" })
      .then(alert => alert.present());
  }

  getImage(imageURL: string): Blob {
    let base64Data = imageURL.replace("data:image/jpeg;base64,", "");
    return this.dataURItoBlob(base64Data);

  }

  generateName(): string {
    const date = new Date().valueOf();
    let text = '';
    const possibleText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      text += possibleText.charAt(Math.floor(Math.random() * possibleText.length));
    }
    // Replace extension according to your media type
    const imageName = date + '.' + text + '.jpg';
    return imageName;
  }

  dataURItoBlob(dataURI: string): Blob {
    console.log(dataURI);

    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpg' });
    return blob;
  }

}
