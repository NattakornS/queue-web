import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class KioskService {

  token: any;
  httpOptions: any;
  constructor(@Inject('API_URL') private apiUrl: string, @Inject('RIGHT_URL') private rightUrl: string, @Inject('RIGHT_USER') private rightUser: string, @Inject('RIGHT_PASSWORD') private rightPassword: string, @Inject('RIGHT_ADMIN') private rightAdmin: string, private httpClient: HttpClient) {
    this.token = sessionStorage.getItem('token');
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      })
    };
  }

  nhsoCid () {
    return this.rightAdmin;
  }

  async getWuhToken() {
    const _url = `${this.rightUrl}/Authenticate/login`;
    let _httpOptions = {};
    const data = {
      username: this.rightUser,
      password: this.rightPassword
    };
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'rejectUnauthorized': 'false'
        })
      };

    return this.httpClient.post(_url, data, _httpOptions).toPromise();
  }

  async getWuhNhsoRight(token, cid) {
    const _url = `${this.rightUrl}/Nhso/GetNhso?adminIdent=${this.rightAdmin}&searchIdent=${cid}`;
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.get(_url, _httpOptions).toPromise();
  }

  async getWuhPersonRight(token, cid) {
    const _url = `${this.rightUrl}/Edp/GetPerson?citizenId=${cid}`
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.get(_url, _httpOptions).toPromise();
  }

  async getWuhStdRight(token, cid) {
    const _url = `${this.rightUrl}/Nhso/Ces/GetStudent?citizenId=${cid}`
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.get(_url, _httpOptions).toPromise();
  }

  async getInfo(token: any = null) {
    const _url = `${this.apiUrl}/info`;
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.get(_url, _httpOptions).toPromise();
  }

  async getServicePoint(token: any = null, mode: any = null, kioskId: any = '1', query: any = '') {
    const _url = `${this.apiUrl}/service-points/kios`;
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }),
        params: {
          mode: mode,
          kioskId: kioskId,
          query
        }
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.get(_url, _httpOptions).toPromise();
  }

  async print(token: any = null, data) {
    const _url = `${this.apiUrl}/print/queue/prepare/print`;
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.post(_url, data, _httpOptions).toPromise();
  }

  async register(token: any = null, data) {
    const _url = `${this.apiUrl}/queue/register`;
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.post(_url, data, _httpOptions).toPromise();
  }

  async getPatient(token: any = null, data) {
    const _url = `${this.apiUrl}/kiosk/patient/info`;
    let _httpOptions = {};
    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }
    return this.httpClient.post(_url, data, _httpOptions).toPromise();
  }

  async getNhso(token, data) {
    const _url = `${this.apiUrl}/kiosk/nhso`;
    let _httpOptions = {};
    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }
    return this.httpClient.post(_url, { data: data }, _httpOptions).toPromise();
  }

  async sendAPITRIGGER(token, type, url, hn, cid, localCode, servicePointId) {
    const _url = `${this.apiUrl}/kiosk/trigger`;
    let _httpOptions = {};
    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }
    return this.httpClient.post(_url, { url, type, hn, cid, localCode, servicePointId }, _httpOptions).toPromise();
  }

  async test(token) {
    const _url = `${this.apiUrl}/kiosk/test`;
    let _httpOptions = {};
    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }
    return this.httpClient.post(_url, _httpOptions).toPromise();
  }
}
