import { Directive, Injector, Input, ViewContainerRef } from "@angular/core";
import { RemoteModuleLoader } from "./services/remote-module-loader.service";

@Directive({
    selector: '[remoteComponentRenderer]'
})
export class RemoteComponentRenderer {
    private _moduleName!: string;
    private _componentName!: string;

    constructor(
        private remoteModuleLoaderService: RemoteModuleLoader,
        private viewContainerRef: ViewContainerRef,
        private injector: Injector
    ) { }

    @Input() set remoteComponentRenderer(componentName: string) {
        this._componentName = componentName;
        this.renderComponent();
    }

    @Input() set remoteComponentRendererModule(moduleName: string) {
        this._moduleName = moduleName;
        this.renderComponent();
    }

    private async renderComponent() {
        if (!this._moduleName || !this._componentName) return;

        const module = await this.remoteModuleLoaderService.loadRemoteModule(this._moduleName);
        const componentFactory = this.remoteModuleLoaderService.getComponentFactory(module[this._componentName]);
        this.viewContainerRef.createComponent(componentFactory, undefined, this.injector);
    }
}