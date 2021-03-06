import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Storage } from './localStorage';

@Injectable()
export class IdentityService {
    private _user: User;
    private _dispatch: ReplaySubject<User> = new ReplaySubject<User>();
    public get user(): User {
        return this._user;
    }
    public set user(value) {
        this._user = value;
    }
    public get dispatch$(): Observable<User> {
        return this._dispatch.asObservable();
    };
    constructor(private localStorage: Storage) {
        this.user = new User();
    }
    public update(identityData: User): void {
        let user = new User();
        if (!!identityData && !!identityData.token) {
            user.token = identityData.token;
        }
        this.user = user;
        this._dispatch.next(this.user);
    }
}
