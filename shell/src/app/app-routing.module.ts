import { loadRemoteModule } from '@angular-architects/module-federation';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// loadRemoteModule({
//   type: 'module',
//   remoteEntry: 'http://localhost:4201/remoteEntry.js',
//   exposedModule: './TransactionModule',
// }).then(m => {
//   m.

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirect root to /home
  {
    path: 'home', loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost:4201/remoteEntry.js',
      exposedModule: './web-components',
    }).then(m => {
      console.log('Loaded module:', m);
      return m.TransactionModule;
    }).catch(err => {
      console.log('Error loading module:', err);
    }
    )
  }, // Lazy-load HomeModule
  { path: '**', redirectTo: 'login' }, // Redirect unknown routes to /home
  {
    path: 'login', loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4202/remoteEntry.js',
        exposedModule: './web-components',
      }).then(m => {
        console.log('Loaded module:', m);
        return m.TransactionModule;
      }).catch(err => {
        console.log('Error loading module:', err);
      }
      )
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
