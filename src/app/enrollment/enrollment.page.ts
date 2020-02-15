import { Component } from '@angular/core';
import { Image } from '../models/image';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { Student } from '../models/Student';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { FilesService } from '../api/files.service';
import { FaceService } from '../api/face.service';
import { AttendanceeService } from '../api/attendancee.service';
import { forkJoin } from 'rxjs';
import { Observable } from 'rxjs/';

@Component({
  selector: 'app-enrollment',
  templateUrl: 'enrollment.page.html',
  styleUrls: ['enrollment.page.scss']
})
export class EnrollmentPage {

  images: Image[] = [];
  user: Student;

  constructor(public modalCtrl: ModalController,
    private filesService: FilesService,
    private faceservice: FaceService,
    private attendanceService: AttendanceeService,
    private loadCtrl: LoadingController,
    private alertCtrl: AlertController,
    private transfer: FileTransfer,
    private camera: Camera) { }


  reset() {
    this.images = [];
  }

  remove(id: string) {
    this.images = this.images.filter(function (img) {
      return img.id !== id;
    });
  }


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
      let image = new Image();
      image.data = "data:image/jpeg;base64," + ImageData;
      image.id = this.generateName();
      this.images.push(image);
    }), error => {
      console.log(error);
    });
  }

  async uploadImages() {
    if (!this.user) {
      const alert = await this.alertCtrl.create({
        header: 'Enter your info',
        inputs: [
          {
            name: 'reg',
            type: 'text',
            placeholder: 'Registration Number'
          },
          {
            name: 'fullname',
            type: 'text',
            id: 'name2-id',
            placeholder: 'Full Name'
          },
          {
            name: 'email',
            type: 'email',
            placeholder: 'Email'
          },
          // input date with min & max
          {
            name: 'phone',
            type: 'text',
            placeholder: 'Phone number'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              this.user = undefined;
            }
          }, {
            text: 'Ok',
            handler: data => {
              this.user = new Student();
              console.dir(data);
              this.user.regNo = data.reg;
              this.user.fullName = data.fullname;
              this.user.email = data.email;
              this.user.phone = data.phone;
              this.upload();
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.upload();
    }
  }



  upload() {
    this.loadCtrl.create({ message: "Uploading images to server please wait ...." })
      .then(loader => {
        loader.present();
        this.faceservice.createPersonGroup().subscribe(() => {
          this.faceservice.createPerson(this.user).subscribe(person => {
            if (person) {
              this.user.personId = person.personId
              this.attendanceService.registerStudent(this.user).subscribe(student => {
                if (student) {
                  forkJoin(
                    this.images.map(img => {
                      return this.filesService.createFile(this.getImage(img.data), img.id);
                    })
                  ).subscribe(files => {
                    forkJoin(
                      files.map(file => {
                        return this.faceservice.addPersonFace(this.user.personId, file.link);
                      })
                    ).subscribe(() => {
                      loader.message = "Training image data"
                      this.faceservice.train().subscribe(() => {
                        loader.dismiss();
                        let msg;
                        if (this.images.length != files.length) {
                          msg = "Oops: incomplete upload please try again"
                        } else {
                          msg = "Upload complete"
                          this.user = undefined;
                          this.images = [];
                        }
                        this.alertCtrl
                          .create({ message: msg })
                          .then(alert => alert.present());
                      });
                    })
                  });
                } else {
                  loader.dismiss();
                  let msg = "Oops: incomplete upload please try again"
                  this.alertCtrl
                    .create({ message: msg })
                    .then(alert => alert.present());
                }
              });
            }
          });
        })
      });
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
