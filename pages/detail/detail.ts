import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';


@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})

export class DetailPage {

  peripheral: any = {};
  power: boolean;
  buttonValue: number;
  brightness: number;
  userDetails: any;
  connectionStatus: string = 'Disconnected';
  bleStatus: boolean;
  charactersticData:any = [];
  notifyStatus:boolean = true;
  constructor(public navCtrl: NavController, public navParams: NavParams, private ble: BLE,
    private ngZone: NgZone, private toastCtrl: ToastController,private alertCtrl: AlertController) {

    this.bleStatus = this.navParams.get('bleStatus');
    this.userDetails = this.navParams.get('device');
    this.triggerBLEStateChange();
  }

  triggerBLEStateChange() {
    this.ble.startStateNotifications().subscribe(
      (state) => {
        if (state === "on") {
          this.ngZone.run(() => {
            this.bleStatus = true;
          });
        }
        else if (state === "off") {
          this.ngZone.run(() => {
            this.bleStatus = false;
            this.connectionStatus = 'Disconnected';
          });
        }
      }
    );
  }

  onConnectButton() {
    let device = this.navParams.get('device');
    this.ble.connect(device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      peripheral => {
        this.onDeviceDisconnected(peripheral);
      }
    );
  }


  onConnected(peripheral) {
    this.peripheral = peripheral;
    this.ngZone.run(
              () => {
        this.connectionStatus = 'Connected';
              });

  }

  onDeviceDisconnected(peripheral) {
    this.ngZone.run(() => {
      this.connectionStatus = 'Disconnected';
    });
    let toast = this.toastCtrl.create({
      message: 'Disconnected \n please connect again.',
      duration: 2000,
      position: 'middle'
    });
    toast.present();
  }


  onDisconnectButton() {
    this.ble.disconnect(this.peripheral.id).then(
      () => this.ngZone.run(() => {
        this.peripheral = [];
        this.connectionStatus = 'Disconnected';
      },
        () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
      )
    )
  }

  ionViewWillLeave() {
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
    )
  }


 onReadButton(service,charactarstic,index){
     this.ble.read(this.peripheral.id,service,charactarstic).then(
       buffer => {
          let data = new Uint8Array(buffer);
          this.ngZone.run(
            () => {
              this.charactersticData[index] = data[0];
            });
       },
       () => {

       }
     )
 }

 onWriteButton(service,charactarstic,index){
  const alert1 = this.alertCtrl.create({
    title:'Enter Value',
    inputs:[{
        name:'value',
        placeholder: 'number',
        type: 'number'
    }],
    buttons:[{
        text: 'ok',
        handler: (value) =>{
            this.charactersticData[index] = value;
        }
    }]
}).present();
  let value = this.charactersticData[index];
  let buffer = new Uint8Array([value]).buffer;
  this.ble.write(this.peripheral.id, service, charactarstic, buffer).then(
    () => {},
    e => {}
  );
}

onNotifyOnButton(service,charactarstic,index){
  this.ble.startNotification(this.peripheral.id, service, charactarstic).subscribe(
      buffer => {
        let data = new Uint8Array(buffer);
        this.ngZone.run(() => {
            this.charactersticData[index] = data[0] ;
            this.notifyStatus = false;
        });
})
}

onNotifyOffButton(service,charactarstic,index){
  this.ble.startNotification(this.peripheral.id, service, charactarstic).subscribe(
    () => {
      this.ngZone.run(() => {
      this.notifyStatus = true;
  });
    }
    )
}
}
  //   peripheral.charactarstics.forEach((item, index) => {

  //     this.ble.read(this.peripheral.id, item.service, item.charactarstic).then(
  //       buffer => {
  //         let data = new Uint8Array(buffer);
  //         this.ngZone.run(
  //           () => {
  //             this.charactersticData[index] = data[0];
  //           });
  //     });
  // });