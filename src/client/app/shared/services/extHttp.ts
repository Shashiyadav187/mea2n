import {Injectable} from '@angular/core';
import {ServerResponseHandler} from "./serverResponseHandler";
import {IdentityService} from "./identity"
import {Http, Headers, RequestOptions, RequestOptionsArgs, Response, RequestMethod, Request} from '@angular/http';
import {Subject, Observable} from 'rxjs';

export enum Action { QueryStart, QueryStop };

export interface ExtRequestOptionsArgs extends RequestOptionsArgs {
    handle?: boolean,
    authHeaders?: boolean
}

@Injectable()
export class ExtHttp {
    process: Subject<any> = new Subject<any>();
    constructor(private _http: Http,
        private serverHandler: ServerResponseHandler,
        private identity: IdentityService) {
    }

    private _createJsonHeaders(): Headers {
        return new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        });
    }

    private _createAuthHeaders(): Headers {
        let identityData = this.identity.user;
        let headers = this._createJsonHeaders();
        if (!!identityData && identityData.token) {
            headers.append('Authorization', `Bearer ${identityData.token}`)
        }
        return headers;
    }

    public get(url: string, reqOptions?: ExtRequestOptionsArgs) {
        return this._request(RequestMethod.Get, url, null, reqOptions);
    }

    public post(url: string, body: string, reqOptions?: ExtRequestOptionsArgs) {
        return this._request(RequestMethod.Post, url, body, reqOptions);
    }

    public put(url: string, body: string, reqOptions?: ExtRequestOptionsArgs) {
        return this._request(RequestMethod.Put, url, body, reqOptions);
    }

    public delete(url: string, reqOptions?: ExtRequestOptionsArgs) {
        return this._request(RequestMethod.Delete, url, null, reqOptions);
    }

    private _request(method: RequestMethod, url: string, body?: string, reqOptions?: ExtRequestOptionsArgs): Observable<any> {
        let requestOptions = new RequestOptions(Object.assign({
            method: method,
            url: url,
            body: body,
            // by default every request is secured
            headers: reqOptions && reqOptions.authHeaders !== false ? this._createAuthHeaders() : this._createJsonHeaders()
        }, reqOptions));

        return Observable.create((observer) => {
            this.process.next(Action.QueryStart);
            this._http.request(new Request(requestOptions))
                .finally(() => {
                    this.process.next(Action.QueryStop);
                })
                .subscribe(
                (res) => {
                    observer.next(res);
                    observer.complete();
                },
                (err) => {
                    // by default responce errors are passed to the serverHandler service
                    if (reqOptions && reqOptions.handle !== false) {
                        switch (err.status) {
                            case 401:
                                this.serverHandler.handle401();
                                observer.complete();
                                break;
                            case 500:
                                this.serverHandler.handle500();
                                observer.complete();
                                break;
                            default:
                                observer.error(err);
                                break;
                        }
                    } else {
                        observer.error(err);
                    }
                })
        })
    }
}
