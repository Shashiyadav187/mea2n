import { it, xit, describe, afterEach,
    beforeEach, async, inject, beforeEachProviders } from '@angular/core/testing';
import {SignInComponent} from "../components/signin/signin";
import {AuthApiService} from "../services/authApi";
import { User } from "../../shared/models/user.model"
import {
    IdentityService,
    APP_SERVICES_PROVIDERS,
    ServerResponseHandler}
from '../../shared/services'
import { setBaseTestProviders } from '@angular/core/testing';

import {App} from '../../app';


import {provide, ApplicationRef, Component, PLATFORM_DIRECTIVES } from '@angular/core';

import { REACTIVE_FORM_DIRECTIVES, FormBuilder, provideForms, disableDeprecatedForms } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { By } from '@angular/platform-browser';

import {
    ComponentFixture,
    TestComponentBuilder
} from '@angular/compiler/testing';

import {Subject, Observable} from 'rxjs';


let externalAuthSpy: jasmine.Spy;

@Component({
    selector: 'test-cmp',
    directives: [SignInComponent],
    template: '<div><signin></signin></div>'
})
class TestComponent { }

let fake_signin_obj = { username: "John", password: "Doe" };
let fakeToken = { token: "The strongest token" };
describe('Authorization module tests', () => {

    class MockIdentityService {
        update() { }
    }
    class MockAuthService {
        signIn() { return Observable.of(fakeToken) };
    }
    class MockRouter {
        navigate(value) { }
    }
    class MockActivatedRouter {
        get snapshot() {
            return {
                params: {
                    from: '/test'
                }
            }
        }
    }
    class MockResponseHandler {
        handleError(er) { return er.toString() }
    }

    var authSpy;
    describe("Signin component tests", () => {
        beforeEachProviders(() => [
            disableDeprecatedForms(),
            provideForms(),
            APP_SERVICES_PROVIDERS,
            provide(Router, { useFactory: () => new MockRouter() }),
            provide(ActivatedRoute, { useFactory: () => new MockActivatedRouter() }),
            // provide activated router
            provide(IdentityService, { useFactory: () => new MockIdentityService() }),
            provide(AuthApiService, { useFactory: () => new MockAuthService() }),
            provide(ServerResponseHandler, { useClass: MockResponseHandler }),
        ]);

        beforeEach(inject([IdentityService, Router, AuthApiService], (identity, router, auth) => {
            identity.user = new User();
            authSpy = spyOn(auth, "signIn").and.callThrough();
            spyOn(identity, "update");
            spyOn(router, "navigate");
        }));
        beforeEach(inject([ServerResponseHandler], (responceHandler) => {
            spyOn(responceHandler, "handleError").and.callThrough();
        }));

        let component: any;
        beforeEach(async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
            return tcb
                .overrideTemplate(SignInComponent, "<div>{{error}}</div>")
                .createAsync(SignInComponent)
                .then(f => {
                    component = f.componentInstance;
                    spyOn(component, 'onSuccess').and.callThrough();
                    spyOn(component, 'onError').and.callThrough();
                });
        })));

        it("Should handle successful signin ", () => {
            component.onSubmit(fake_signin_obj);
            expect(component.authService.signIn).toHaveBeenCalledWith(fake_signin_obj);
            expect(component.onSuccess).toHaveBeenCalledWith(fakeToken);
        });

        it('Should update identity data', async(inject([AuthApiService], (authService) => {
            component.onSubmit(fakeToken);
            return authService.signIn().toPromise().then((result) => {
                expect(result).toBe(fakeToken);
                expect(component.identity.update).toHaveBeenCalledWith(fakeToken);
            });
        })));

        it('Should handle error respond', async(inject([AuthApiService], (authService) => {
            authSpy.and.returnValue(Observable.throw(401));
            component.onSubmit(fakeToken);
            return authService.signIn().toPromise().then((result) => {
            }, (err) => {                
                expect(component.onError).toHaveBeenCalledWith(401);
            });
        })));

        it('Should show error message', async(inject([AuthApiService, TestComponentBuilder], (authService, tcb: TestComponentBuilder) => {
            authSpy.and.returnValue(Observable.throw(401));
            return tcb
                .createAsync(SignInComponent).then((fixture: ComponentFixture<SignInComponent>) => {
                    fixture.componentInstance.onSubmit(fake_signin_obj);
                    fixture.detectChanges();
                    var compiled = fixture.debugElement.nativeElement;
                    expect(compiled.querySelector('div').innerText).toBe("401");
                });
        })));
    });
});