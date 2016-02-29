import {Injectable} from 'angular2/core';
import {ExtHttp} from './authHttp.service';

@Injectable()
export class PermissionService {
    private _http: ExtHttp;

    constructor(http: ExtHttp) {
        this._http = http;
    }
    public isAuthorized(roles) {
        return new Promise<boolean>((resolve, reject) => {
            this._http
                .post("/auth/me", JSON.stringify({ roles: roles }))
                .subscribe(
                () => resolve(true),
                () => reject(false))
        })
    }
}

export const PERMISSION_SERVICE_PRIVIDERS = [
    PermissionService
];
