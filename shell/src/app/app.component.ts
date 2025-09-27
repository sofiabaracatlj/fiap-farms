import { Component, NgZone, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'shell';

  constructor(private ngZone: NgZone, private router: Router) {
    // this.ngZone.runOutsideAngular(() => {
    //   // Initialize third-party library here
    // });
  }

  ngOnInit() {
    addEventListener('navigate', (event: Event) => {
      event.preventDefault();
      const customEvent = event as CustomEvent;
      console.log('Received event:', customEvent.detail.path);
      // this.ngZone.run(() => {
      this.router.navigate([customEvent.detail.path]);
      // });
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('NavigationEnd:', event.url);
        console.log('navi', window.location.toString());
      }
    });
  }
}
