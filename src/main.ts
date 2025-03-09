import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

  document.addEventListener("DOMContentLoaded", () => {
    const appRoot = document.querySelector("app-root");
    if (appRoot) {
      console.log("✅ app-root existe en el DOM");
      alert("✅ app-root existe en el DOM");
    } else {
      console.error("❌ app-root NO existe en el DOM");
      alert("❌ app-root NO existe en el DOM");
    }
  });

