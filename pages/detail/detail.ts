import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { Diagnostic } from '@ionic-native/diagnostic';

const LIGHTBULB_SERVICE = '00001523-1212-efde-1523-785feabcd123';
const SWITCH_CHARACTERISTIC = '00001525-1212-efde-1523-785feabcd123';
// const BUTTON_CHARACTERISTIC = '00001524-1212-efde-1523-785feabcd123';
// const DIMMER_CHARACTERISTIC = 'ff12';
const DIMMER_SERVICE = '00002a05-1212-efde-1523-785feabcd123';
const DIMMER_CHARACTERISTIC = '0000beef-1212-efde-1523-785feabcd123';

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
  constructor(public navCtrl: NavController, public navParams: NavParams, private ble: BLE,
    private ngZone: NgZone, private toastCtrl: ToastController) {

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
    this.connectionStatus = 'Connected';
    peripheral.forEach((item, index) => {
      this.ble.read(this.peripheral.id, item.service, item.charactarstic).then(
        buffer => {
          let data = new Uint8Array(buffer);
          this.ngZone.run(
            () => {
              this.charactersticData[index] = data[0];
            });
        }
        )
  });
    

    // var someArray = [9, 2, 5];
    // console.log(item); // 9, 2, 5
    // console.log(index); // 0, 1, 2

    // this.ble.read(this.peripheral.id, LIGHTBULB_SERVICE, SWITCH_CHARACTERISTIC).then(
    //   buffer => {
    //     let data = new Uint8Array(buffer);
    //     this.ngZone.run(() => {
    //       this.power = data[0] !== 0;
    //     });
    //   }
    // )

    // this.ble.read(this.peripheral.id, DIMMER_SERVICE, DIMMER_CHARACTERISTIC).then(
    //   buffer => {
    //     let data = new Uint8Array(buffer);
    //     this.ngZone.run(() => {
    //       this.brightness = data[0];
    //     });
    //   }
    // )
  }

  onDeviceDisconnected(peripheral) {
    this.ngZone.run(() => {
      this.connectionStatus = 'Disconnected';
    });
    let toast = this.toastCtrl.create({
      message: 'The peripheral unexpectedly disconnected',
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

  // onPowerSwitchChange(event) {
  //   let value = this.power ? 1 : 0;
  //   let buffer = new Uint8Array([value]).buffer;
  //   this.ble.write(this.peripheral.id, LIGHTBULB_SERVICE, SWITCH_CHARACTERISTIC, buffer).then(
  //     () => {
  //       e => alert('Error updating power switch');
  //     }
  //   );
  // }

  onPowerSwitchChangeDup(event) {
    let value = (this.brightness % 2) ? 1 : 0;
    let buffer = new Uint8Array([value]).buffer;
    this.ble.write(this.peripheral.id, LIGHTBULB_SERVICE, SWITCH_CHARACTERISTIC, buffer).then(
      () => {
        e => alert('Error updating power switch');
      }
    );
  }

  setBrightness(event) {
    let value = this.brightness;
    let buffer = new Uint8Array([value]).buffer;
    this.ble.write(this.peripheral.id, DIMMER_SERVICE, DIMMER_CHARACTERISTIC, buffer).then(
      () => {
        e => alert('Error updating power switch');
      }
    );
  }

}
