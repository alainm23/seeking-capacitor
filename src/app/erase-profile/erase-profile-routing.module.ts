import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EraseProfilePage } from './erase-profile.page';

const routes: Routes = [
  {
    path: '',
    component: EraseProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EraseProfilePageRoutingModule {}
