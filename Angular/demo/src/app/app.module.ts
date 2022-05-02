// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PowerBIEmbedModule } from 'powerbi-client-angular';
import { AppComponent } from './app.component';
import { PopupfunComponent } from './popupfun/popupfun.component';
import { DcpopupComponent } from './dcpopup/dcpopup.component';

@NgModule({
  declarations: [AppComponent, PopupfunComponent, DcpopupComponent],
  imports: [BrowserModule, HttpClientModule, PowerBIEmbedModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
