import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GraciasProfilePage } from './gracias-profile.page';

const routes: Routes = [
  {
    path: '',
    component: GraciasProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GraciasProfilePageRoutingModule {}
