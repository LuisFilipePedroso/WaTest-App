import { Observable } from 'rxjs';
import { IOrder } from '~/interfaces/models/order';

import apiService, { ApiService } from './api';

export class OrderService {
  constructor(private apiService: ApiService) {}

  public save(model: IOrder, refresh?: boolean): Observable<IOrder> {
    return this.apiService.post<IOrder>('order', model);
  }
}

const orderService = new OrderService(apiService);
export default orderService;
