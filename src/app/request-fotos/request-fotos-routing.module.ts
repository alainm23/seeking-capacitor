import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestFotosPage } from './request-fotos.page';

const routes: Routes = [
  {
    path: '',
    component: RequestFotosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestFotosPageRoutingModule {}
