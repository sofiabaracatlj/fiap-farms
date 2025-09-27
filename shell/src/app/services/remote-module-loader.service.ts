import { ComponentFactory, ComponentFactoryResolver, Injectable, Type } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class RemoteModuleLoader {
    constructor(private _componentFactoryResolver: ComponentFactoryResolver) { }

    async loadRemoteModule(name: string) {
        const [scope, moduleName] = name.split('/');
        const moduleFactory = await (window as any)[scope].get('./' + moduleName);
        return moduleFactory();
    }

    getComponentFactory(component: Type<unknown>): ComponentFactory<unknown> {
        return this._componentFactoryResolver.resolveComponentFactory(component);
    }
}