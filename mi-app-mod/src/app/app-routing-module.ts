import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './features/home/welcome/welcome';
import { ProductComponent } from './features/products/components/product/product';
import { PageNotFoundComponent } from './features/not-found/page-not-found';
import { LoginComponent } from './features/auth/components/login/login';
import { loginGuard } from './features/auth/guards/login-guard';
import { User } from './features/users/components/user/user';
import { ProductPagination } from './features/products/components/product-pagination/product-pagination';
import { MapComponent } from './features/maps/components/map/map';

const routes: Routes = [
  { path: 'login',               component: LoginComponent },
  { path: 'home',                component: WelcomeComponent,     canActivate: [loginGuard] },
  { path: 'products',            component: ProductComponent,      canActivate: [loginGuard] },
  { path: 'users',               component: User,                  canActivate: [loginGuard] },
  { path: 'products-pagination', component: ProductPagination,     canActivate: [loginGuard] },
  { path: 'maps',                component: MapComponent,          canActivate: [loginGuard] },
  { path: '',                    redirectTo: 'home', pathMatch: 'full' },
  { path: '**',                  component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
