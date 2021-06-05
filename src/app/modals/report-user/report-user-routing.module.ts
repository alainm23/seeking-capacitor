import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportUserPage } from './report-user.page';

const routes: Routes = [
  {
    path: '',
    component: ReportUserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportUserPageRoutingModule {}
