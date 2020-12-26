import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { EntityDataModule } from '@ngrx/data';
import { ActionReducerMap, StoreModule } from '@ngrx/store';
import { routerReducer, RouterState, StoreRouterConnectingModule } from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';


import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full'
  },
  {
    path: 'map',
    loadChildren: () => import('./features/map/map.module').then(m => m.MapModule)
  },
];

export interface AppState {}

export const reducers: ActionReducerMap<AppState> = {
  router: routerReducer
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production}),
    StoreModule.forRoot(reducers),
    EntityDataModule.forRoot({}),
    EffectsModule.forRoot([]),
    StoreRouterConnectingModule.forRoot({
      stateKey: 'router',
      routerState: RouterState.Minimal
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
