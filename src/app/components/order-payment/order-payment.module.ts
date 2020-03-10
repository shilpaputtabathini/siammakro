import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderPaymentComponent } from './order-payment.component';
import { OrderPaymentRoutingModule } from './order-payment-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

//material
import { MatToolbarModule,  
  MatIconModule,  
  MatCardModule,  
  MatButtonModule,  
  MatProgressBarModule } from '@angular/material';

@NgModule({
  declarations: [OrderPaymentComponent],
  imports: [
    CommonModule,
    OrderPaymentRoutingModule,
    SharedModule,  
    MatToolbarModule,  
    MatIconModule,  
    MatButtonModule,  
    MatCardModule,  
    MatProgressBarModule 
  ]
})
export class OrderPaymentModule { }
