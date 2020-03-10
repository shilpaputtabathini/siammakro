import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Event, NavigationStart, NavigationEnd } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
declare var $: any;

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit, OnDestroy {
  activateDocument = false;
  activateCamera = false;
  activateHome = false;
  activateSignature = false;
  activateOrders = false;
  orderId: number;
  /* barcode */
  showBarcodeScanner = false;
  qrResultString: string;
  tryHarder = false;
  torchEnabled = false;
  hasDevices: boolean;
  hasPermission: boolean;
  availableDevices: MediaDeviceInfo[];
  currentDevice: MediaDeviceInfo = null;
  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
  ];
  torchAvailable$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    const url = this._router.url;
    this._router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (url.indexOf('dashboard') > -1) {
          this.activateHome = true;
        } else if (url.indexOf('orders-list') > -1 || url.indexOf('order-history') > -1) {
          // console.log('url', url);
          this.activateOrders = true;
        } else if (url.indexOf('order-payment') > -1 || url.indexOf('draw-signature') > -1) {
          this.activateDocument = true;
          this.activateCamera = true;
          this.activateSignature = true;
        }
      }
    });


    this._route.params.subscribe(params => {
      this.orderId = +params['id'] || null;
    });
  }

  ngOnInit() {
  }

  resetFlags() {
    this.activateDocument = false;
    this.activateCamera = false;
    this.activateHome = false;
    this.activateSignature = false;
    this.activateOrders = false;
  }

  navigateToSignatureScreen() {
    if (this.activateSignature && this.orderId) {
      this._router.navigate(['/draw-signature', this.orderId]);
    }
  }


  toggleBarcodeScanner() {
    this.showBarcodeScanner = !this.showBarcodeScanner;
  }

  /* barcode */
  
  clearResult(): void {
    this.qrResultString = null;
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onDeviceSelectChange(selected: string) {
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.currentDevice = device || null;
  }

  openFormatsDialog() {
    const data = {
      formatsEnabled: this.formatsEnabled,
    };
  }

  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  openInfoDialog() {
    const data = {
      hasDevices: this.hasDevices,
      hasPermission: this.hasPermission,
    };
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }

  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
  }

  toggleTryHarder(): void {
    this.tryHarder = !this.tryHarder;
  }

  onCodeResult(resultString: string) {
    this.qrResultString = resultString;
    //form data for qrcode
    const formData = new FormData();
    formData.append('barcode', this.qrResultString);

    this.showBarcodeScanner = false;
    alert(this.qrResultString)
    // this.orderService.getBarcodeScanner(this.orderId, formData).subscribe(res => {
    //   this.ngAfterViewInit();
    //   this.checkBarcodeMatchprod(this.qrResultString);
    // }, err => {
    //   this.ngAfterViewInit();
    //   this.selectedIndex = -1;
    //   $("#productNotFound").modal("show");
    //   setTimeout(function(){
    //     $("#productNotFound").modal("hide");
    //   }, 1500);
    //   //alert(err.error.message);
    // })
  }
  /* barcode */

  ngOnDestroy() {
    this.resetFlags();
  }
}
