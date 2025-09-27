import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { RemoteModuleLoader } from './services/remote-module-loader.service';

@NgModule({
  declarations: [
    AppComponent,
    // Add other components here
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule
    // Do not import HomeModule here since it is lazy-loaded
  ],
  providers: [RemoteModuleLoader],
  bootstrap: [AppComponent],
})
export class AppModule { }
