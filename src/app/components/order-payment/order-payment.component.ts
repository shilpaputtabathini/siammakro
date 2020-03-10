import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subscription, interval, Subject } from 'rxjs';

import { IAppState } from 'src/app/app.reducer';
import { DomService } from 'src/app/core/services/dom.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrderService } from 'src/app/core/services/order.service';
import { GetOrderDetailsStart, EOrderDetailsActions } from '../order-details/order-details.actions';
import { PaymentUpdateOrderStart, EOrderPaymentActions } from './order-payment.actions';
import { environment } from 'src/environments/environment';
import { takeUntil } from 'rxjs/operators';
import { ECurrencies } from 'src/app/core/enums/currency.enum';

import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';  
import { catchError, map } from 'rxjs/operators';  
import { UploadService } from  'src/app/core/services/upload-document.service';

declare var $: any;

@Component({
  selector: 'app-order-payment',
  templateUrl: './order-payment.component.html',
  styleUrls: ['./order-payment.component.scss']
})
export class OrderPaymentComponent implements OnInit, OnDestroy {
  orderId: number;
  authToken: string;
  orderNumber: string;
  isOrderConfirmed = false;
  isOrderWaiting = false;
  actionsSubjectSubscription: Subscription;
  orderDetails: any;
  paymentUrl: any;
  payment_status: string;
  private sub: Subscription;
  isReturnOrder = false;
  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef;files  = [];  
  private _destroy$ = new Subject();
  currencies = ECurrencies;
  orderCurrency = this.currencies.THB;

    
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _actionsSubject: ActionsSubject,
    private _store: Store<IAppState>,
    private _authService: AuthService,
    private _domService: DomService,
    private orderService: OrderService,
    private hostElement: ElementRef,
    private _route: Router,
    private _orderService: OrderService,
    private _uploadService: UploadService
  ) {
    this._activatedRoute.params.subscribe(params => {
      this.orderId = +params['id'] || null;
    });

    

    this.actionsSubjectSubscription = this._actionsSubject.subscribe((action: any) => {
      switch (action.type) {
        case EOrderDetailsActions.GetOrderDetailsStart:
          break;
        case EOrderDetailsActions.GetOrderDetailsSuccess:
          this.orderDetails = action.payload.data.data.order || null;
          this.orderCurrency = this.orderService.getCurrency(this.orderDetails);
          this.orderNumber = this.orderDetails.order_number;
          this.authToken = this.orderDetails.auth_token;
          this.payment_status = action.payload.data.data.order.payment_status;
          this.isReturnOrder = this._orderService.checkIfReturnOrder(this.orderDetails);
          // if (this.payment_status == 'paid') {
          //   let orderId = this.orderId;
          //   this._route.navigate(['/draw-signature', orderId]);
          // }
          break;
        case EOrderDetailsActions.GetOrderDetailsFailure:
          break;
        case EOrderPaymentActions.PaymentUpdateOrderStart:
          break;
        case EOrderPaymentActions.PaymentUpdateOrderSuccess:
          this.paymentUrl = action.payload.data.payment_url;
          this.isOrderWaiting = true;
          $('#payment-modal').modal('show');
          const iframe = this.hostElement.nativeElement.querySelector('iframe');
          iframe.src = environment.paymentUrl + this.paymentUrl;
          this.startPolling();
          break;
        case EOrderPaymentActions.PaymentUpdateOrderFailure:
          break;
      }
    })
  }

  ngOnInit() {
    let orderId = this.orderId;
    this._store.dispatch(new GetOrderDetailsStart({ data: { orderId } }));
  }

  confirm() {
    let orderId = this.orderId;
    this._store.dispatch(new PaymentUpdateOrderStart({ data: { orderId } }))
  }

  startPolling() {
    interval(5000).pipe(takeUntil(this._destroy$)).subscribe(x => {
      if (this.payment_status == 'not_paid' || this.payment_status == 'waiting_for_payment') {
        this.sub = this.orderService.getCurrentPaymentStatus(this.orderId).subscribe((data: any) => {
          this.payment_status = data.data.order.payment_status;
        });
      } else {
        $('#payment-modal').modal('hide');
        this.sub.unsubscribe();
        this._destroy$.next();
        this.isOrderWaiting = false;
        let orderId = this.orderId;
        this._route.navigate(['/draw-signature', orderId]);
      }
    });
  }

  uploadFile(file) {  
    const formData = new FormData();  
    formData.append('file', file.data);  
    file.inProgress = true;  
    this._uploadService.upload(formData).pipe(  
      map(event => {  
        switch (event.type) {  
          case HttpEventType.UploadProgress:  
            file.progress = Math.round(event.loaded * 100 / event.total);  
            break;  
          case HttpEventType.Response:  
            return event;  
        }  
      }),  
      catchError((error: HttpErrorResponse) => {  
        file.inProgress = false;  
        return of(`${file.data.name} upload failed.`);  
      })).subscribe((event: any) => {  
        if (typeof (event) === 'object') {  
          console.log(event.body);  
        }  
      });  
  }

  private uploadFiles() {  
    this.fileUpload.nativeElement.value = '';  
    this.files.forEach(file => {
      this.uploadFile(file);
    })
  }

  onClick() {  
    const fileUpload = this.fileUpload.nativeElement;fileUpload.onchange = () => {  
    for (let index = 0; index < fileUpload.files.length; index++)  
    {  
     const file = fileUpload.files[index];  
     this.files.push({ data: file, inProgress: false, progress: 0}); 
     console.log(this.files)
     
    }  
      this.uploadFiles();  
    };  
    fileUpload.click();  
}




  ngOnDestroy() {
    this.actionsSubjectSubscription.unsubscribe();
    this._destroy$.next();
    if (this.isOrderWaiting == true) {
      console.log('xxxxxxxxx')
      this.sub.unsubscribe();
    }
  }
}
