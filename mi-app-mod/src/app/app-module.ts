import { NgModule, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEsCL from '@angular/common/locales/es-CL';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';


import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ProductComponent } from './features/products/components/product/product';
import { ProductListComponent } from './features/products/components/product-list/product-list';
import { StarComponent } from './features/products/components/product-list/star/star';
import { ModalAddComponent } from './features/products/components/modal-add/modal-add';
import { ImagePipe } from './shared/image.pipe';
import { WelcomeComponent } from './features/home/welcome/welcome';
import { PageNotFoundComponent } from './features/not-found/page-not-found';
import { LoginComponent } from './features/auth/components/login/login';
import { User } from './features/users/components/user/user';
import { ProductPagination } from './features/products/components/product-pagination/product-pagination';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxBootstrapIconsModule, allIcons } from 'ngx-bootstrap-icons';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapComponent } from './features/maps/components/map/map';

registerLocaleData(localeEsCL, 'es-CL');

@NgModule({
  declarations: [
    App,
    ProductComponent,
    ProductListComponent,
    StarComponent,
    ModalAddComponent,
    ImagePipe,
    WelcomeComponent,
    PageNotFoundComponent,
    LoginComponent,
    User,
    ProductPagination,
    MapComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule,
    ScrollingModule,
    NgxPaginationModule,
    NgxBootstrapIconsModule.pick(allIcons),
    GoogleMapsModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es-CL' },
    provideHttpClient()
  ],
  bootstrap: [App]
})
export class AppModule { }
