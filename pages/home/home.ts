import { Component, NgZone } from '@angular/core';
import { AlertController, ToastController, NavController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { Diagnostic } from '@ionic-native/diagnostic';
import { DetailPage } from '../detail/detail';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  bleStatus: boolean;
  locationStatus: boolean;
  alertString: string;
  devices: any[] = [];

  constructor(public ble: BLE, private alertCtrl: AlertController,
    private diagnostic: Diagnostic, public ngZone: NgZone,
    private toastCtrl: ToastController, private navCtrl: NavController) {
    this.triggerGPSSwitch();
    this.bluetoothFunc();
  }

  ionViewDidLoad() {
    this.triggerBLESwitch();
  }

  triggerBLESwitch() {
    this.diagnostic.registerBluetoothStateChangeHandler(
      (state) => {
        if (state === this.diagnostic.bluetoothState.POWERED_ON) {
          this.ngZone.run(() => {
            this.bleStatus = true;
          });
        }
        else if (state === this.diagnostic.bluetoothState.POWERED_OFF) {
          this.ngZone.run(() => {
            this.bleStatus = false;
          });
        }
      }
    );
  }

  triggerGPSSwitch() {
    this.diagnostic.registerLocationStateChangeHandler(
      (state) => {
        if (state === this.diagnostic.locationMode.HIGH_ACCURACY) {
          this.ngZone.run(() => {
            this.locationStatus = true;
          });
        }
        else if (state === this.diagnostic.locationMode.LOCATION_OFF) {
          this.ngZone.run(() => {
            this.locationStatus = false;
          });
        }
      }
    );
  }

  bluetoothFunc() {
    this.ble.isEnabled().then(
      () => {
        this.bleStatus = true;
        this.locationFunc();
      },
      () => {
        this.bleStatus = false;
        this.alertBoxBLE();
      }
    );
  }

  enableBLE() {
    this.ble.enable().then(
      () => {
        this.bleStatus = true;
        this.locationFunc();
      },
      () => {
        this.bleStatus = false;
      }
    );
  }

  openBLESettingsPage() {
    this.diagnostic.switchToBluetoothSettings();
  }

  locationFunc() {
    this.diagnostic.isLocationEnabled().then(
      (status) => {
        if (status) {
          this.locationStatus = true;
        }
        else {
          this.locationStatus = false;
          this.alertBoxLocation();
        }
      },
      error => {
        this.locationStatus = false;
      });
  }

  openGPSSettingsPage() {
    this.diagnostic.switchToLocationSettings();
  }

  GPSDetailsAlert() {
    const alert_1 = this.alertCtrl.create({
      title: 'Location Service.',
      message: 'your phone may require the Location service to be enabled in order to scan\
 for Bluetooth LE devices.',
      cssClass: 'alertStyle',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    alert_1.present();
  }

  alertBoxBLE() {
    const alert_1 = this.alertCtrl.create({
      title: 'Enable Bluetooth.',
      cssClass: 'alertStyle',
      buttons: [
        {
          text: 'Allow',
          handler: () => {
            this.enableBLE();
          }
        },
        {
          text: 'Deny',
          role: 'cancel',
          handler: () => {
            this.bleStatus = false;
          }
        }
      ]
    });
    alert_1.present();
  }

  alertBoxLocation() {
    const alert_1 = this.alertCtrl.create({
      title: 'Enable Location.',
      cssClass: 'alertStyle',
      buttons: [
        {
          text: 'Allow',
          handler: () => {
            this.openGPSSettingsPage();
          }
        },
        {
          text: 'Deny',
          role: 'cancel',
          handler: () => {
            this.locationStatus = false;
          }
        }
      ]
    });
    alert_1.present();
  }


  onScan() {
    this.devices = [];  // clear list

    this.ble.scan([], 8).subscribe(
      device => this.onDeviceDiscovered(device),
      error => this.scanError(error)
    );
    console.log(this.devices);
  }

  onScanRefresher(event) {
    this.onScan();
    setTimeout(() => {
      event.complete();
    }, 2000);
  }

  onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      this.devices.push(device);
    });
  }

  scanError(error) {
    let toast = this.toastCtrl.create({
      message: 'Error scanning for Bluetooth low energy devices',
      position: 'middle',
      duration: 5000
    });
    toast.present();
  }

  deviceSelected(device) {
    this.navCtrl.push(DetailPage, {
      device: device, bleStatus: Boolean
    });
  }
}
