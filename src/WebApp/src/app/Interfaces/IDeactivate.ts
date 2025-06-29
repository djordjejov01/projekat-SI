import { Observable } from "rxjs";

export interface IDeactivate{
    canExit: () => boolean | Observable<boolean> | Promise<boolean>;
}