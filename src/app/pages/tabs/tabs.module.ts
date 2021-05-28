import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TabsPage } from './tabs.page';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import ('../home/home.module').then (m => m.HomePageModule)
      }, {
        path: 'inbox',
        loadChildren: () => import ('../inbox/inbox.module').then (m => m.InboxPageModule)
      }, {
        path: 'favorites',
        loadChildren: () => import ('../favorites/favorites.module').then (m => m.FavoritesPageModule)
      }, {
        path: 'profile-menu',
        loadChildren: () => import ('../profile-menu/profile-menu.module').then (m => m.ProfileMenuPageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home'
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild (routes)
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}