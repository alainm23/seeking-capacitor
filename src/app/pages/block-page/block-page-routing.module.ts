import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BlockPagePage } from './block-page.page';

const routes: Routes = [
  {
    path: '',
    component: BlockPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlockPagePageRoutingModule {}
