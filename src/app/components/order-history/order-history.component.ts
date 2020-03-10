import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/core/services/order.service';
import { ActivatedRoute } from '@angular/router';
import { ORDER_TYPES } from 'src/app/core/constants/order-types.constant';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {
  orderHistory: any;
  cancelledList: any;
  orderTypes = ORDER_TYPES;
  selectedTab: any = ORDER_TYPES.DELIVERED_ORDERS;

  constructor(
    private _orderService: OrderService,
    private _route: ActivatedRoute
  ) {
    this._route.queryParams.subscribe(params => {
      if (params && params['orderType'] && params['orderType'] === ORDER_TYPES.CANCELLED_ORDERS) {
        this.selectedTab = ORDER_TYPES.CANCELLED_ORDERS;
      } else {
        this.selectedTab = ORDER_TYPES.DELIVERED_ORDERS;
      }
    });
  }

  ngOnInit() {
    this.getSelectedTabTd(this.selectedTab);
  }

  getSelectedTabTd(type) {
    this.selectedTab = type;
    this.orderHistory = [];
    this._orderService.getOrderHistoryList(type).subscribe(data => {
      this.orderHistory = data['data'].orders;
    });
  }

}
