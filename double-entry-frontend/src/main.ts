import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config'; // ✅ Use this instead of hardcoding providers

bootstrapApplication(App, appConfig)
  .catch(err => console.error(err));
