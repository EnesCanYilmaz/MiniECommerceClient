import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { Create_Product } from 'src/app/contracts/products/create_product';
import { List_Product } from 'src/app/contracts/products/list_product';
import { List_Product_Image } from 'src/app/contracts/products/list_product_image';
import { HttpClientService } from '../http-client.service';
import { AlertifyMessageType, AlertifyPosition, AlertifyService } from '../../admin/alertify.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private httpClientService: HttpClientService, private alertifyService: AlertifyService) { }

  create(product: Create_Product, onSuccess?: () => void, onError?: (errorMessage: string) => void) {
    this.httpClientService.post({
      controller: "products",
      headers: new HttpHeaders().set('Authorization', localStorage.getItem("accessToken"))
    }, product).subscribe(
      {
        next: (response) => {
          onSuccess();
        },
        error: (err) => {
          const _error: Array<{ key: string, value: Array<string> }> = err.error;
          let message = "";
          _error.forEach((v, index) => {
            v.value.forEach((_v, _index) => {
              message += `${_v}<br>`;
            });
          });
          onError(message);
        }
      }
    );
  }

  async list(page: number = 0, size: number = 5, successCallBack?: () => void,
    errorCallBack?: (errorMessage: string) => void): Promise<{ totalProductCount: number; products: List_Product[] }> {
    const promiseData: Promise<{ totalProductCount: number; products: List_Product[] }> = this.httpClientService.get<{ totalProductCount: number; products: List_Product[] }>({
      controller: "products",
      queryString: `page=${page}&size=${size}`
    }).toPromise();

    promiseData.then(d => successCallBack()).
      catch((errorResponse: HttpErrorResponse) => errorCallBack(errorResponse.message));

    return await promiseData;
  }
  async delete(id: string) {
    const deleteObservable: Observable<any> = this.httpClientService.delete<any>({
      controller: "products"
    }, id);
    await firstValueFrom(deleteObservable);
  }

  async readImages(id: string): Promise<List_Product_Image[]> {
    const getObservable: Observable<List_Product_Image[]> = this.httpClientService.get<List_Product_Image[]>({
      action: "getproductimages",
      controller: "products"
    }, id);
    return await firstValueFrom(getObservable);
  }


  async deleteImage(id: string, imageId: string, successCallBack?: () => void) {
    const deleteObservable = this.httpClientService.delete({
      action: "deleteproductimage",
      controller: "products",
      queryString: `imageId=${imageId}`
    }, id)
    await firstValueFrom(deleteObservable);
    successCallBack();
  }
}
