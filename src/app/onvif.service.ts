import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {OnvifDevice, 
        OnvifDeviceDetails, 
        OnvifDeviceInfo, 
        OnvifProfileInfo, 
        OnvifVideoCodecInfo, 
        OnvifVideoSourceInfo 
    } from './onvif-device'

@Injectable()
export class OnvifService {
    constructor(private http: Http){}
    getDevices(): Observable<OnvifDevice[]>{
        return this.http.get("v1/env/onvif")
                        .map(this.extractDiscoveryData);
    }
    probeFor(url:string, auth:[string,string]): Observable<any>{
        let req:any=new Object();
        req.url=url;
        req.auth=auth;
        return this.http.post("v1/env/onvif/probe", req)
                        .map(this.extractProbeData);
    }
    private extractProbeData(res: Response){
        let body=<any>res.json();
        let r=new OnvifDeviceDetails();
        r.videoSources=new Array<OnvifVideoSourceInfo>();
        r.profiles=new Array<OnvifProfileInfo>();

        r.info=<OnvifDeviceInfo>body.info;
        for(let s in body.video_sources){
            r.videoSources.push(<OnvifVideoSourceInfo>body.video_sources[s]);
        }
        for(let p in body.profiles){
            r.profiles.push(<OnvifProfileInfo>body.profiles[p]);
        }
        return r;
    }
    private extractDiscoveryData(res: Response){
        let body=<any[]>res.json();
        return body.map(function(b: any) {
            let o=new OnvifDevice();
            o.hardware=b.scopes.hardware;
            o.location=b.scopes.location;
            o.name=b.scopes.name;
            o.url=b.xaddrs[0];
            return o;
        });
    }
    private handleError(error: Response | any){
        console.log(error);
        let errMsg: string;
        if (error instanceof Response) {
        const body = error.json() || '';
        const err = body || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}