import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'request-gps/:id',
    loadChildren: () => import('./pages/request-gps/request-gps.module').then( m => m.RequestGpsPageModule)
  },
  {
    path: 'registro/:id/:location',
    loadChildren: () => import('./pages/registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'verify-email',
    loadChildren: () => import('./pages/verify-email/verify-email.module').then( m => m.VerifyEmailPageModule)
  },
  {
    path: 'purchase-message/:id/:data',
    loadChildren: () => import('./pages/purchase-message/purchase-message.module').then( m => m.PurchaseMessagePageModule)
  },
  {
    path: 'profile/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'edit-profile',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'request-notification',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/request-notification/request-notification.module').then( m => m.RequestNotificationPageModule)
  },
  {
    path: 'block-page/:data',
    loadChildren: () => import('./pages/block-page/block-page.module').then( m => m.BlockPagePageModule)
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import ('./pages/tabs/tabs.module').then (m => m.TabsPageModule)
  },
  {
    path: 'request-fotos',
    loadChildren: () => import('./request-fotos/request-fotos.module').then( m => m.RequestFotosPageModule)
  },
  {
    path: 'restore-password',
    loadChildren: () => import('./pages/restore-password/restore-password.module').then( m => m.RestorePasswordPageModule)
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import ('./pages/tabs/tabs.module').then (m => m.TabsPageModule)
  },
  {
    path: 'erase-profile',
    loadChildren: () => import('./erase-profile/erase-profile.module').then( m => m.EraseProfilePageModule)
  },
  {
    path: 'gracias-profile',
    loadChildren: () => import('./gracias-profile/gracias-profile.module').then( m => m.GraciasProfilePageModule)
  },
  {
    path: 'gracias-profile',
    loadChildren: () => import('./gracias-profile/gracias-profile.module').then( m => m.GraciasProfilePageModule)
  },
  /*{
    path: 'selector',
    loadChildren: () => import('./modals/selector/selector.module').then( m => m.SelectorPageModule)
  },*/
  {
    path: 'settings-notifications',
    loadChildren: () => import('./settings-notifications/settings-notifications.module').then( m => m.SettingsNotificationsPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
