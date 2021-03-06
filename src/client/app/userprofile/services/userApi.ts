import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExtHttp }  from '../../shared/services';

@Injectable()
export class UserApiService {
    private _http: ExtHttp;
    constructor(http: ExtHttp) {
        this._http = http;
    }
    public updateUserAccount(accountData): Observable<any> {
        return this._http
            .post("/api/updateaccount", JSON.stringify({ account: accountData }))
         //   .map(res => res.json())
    }
    public getUserAccount(): Observable<any> {
        return this._http
            .post("/api/account", null)
         //   .map(res => res.json())
    }
    public updateProfile(userProfile: any): Observable<any> {
        return this._http
            .put("/api/profile", JSON.stringify({ profile: userProfile }))
         //   .map(res => res.json());
    }
    public getProfile(): Observable<any> {
        return this._http
            .post("/api/profile", null)
        //    .map(res => res.json());
    }
}
