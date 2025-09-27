import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { HeaderComponent } from '../header/header.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginBodyComponent } from '../login-body/login-body.component';
import { AdvantagesCardComponent } from '../advantages-card/advantages-card.component';
import { FormModalComponent } from '../form-modal/form-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    LoginComponent,
    HeaderComponent,
    LoginBodyComponent,
    AdvantagesCardComponent,
    FormModalComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class LoginModule { }
