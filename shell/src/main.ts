import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { NgZone } from '@angular/core';


platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.then((moduleRef) => {
		const ngZone = moduleRef.injector.get(NgZone);
		ngZone.runOutsideAngular(() => {
			// Place any code here that should run outside Angular's Zone
		});
	})
	.catch((err) => console.error(err));
