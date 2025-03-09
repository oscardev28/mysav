import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log("✅ Bootstrap de Angular completado");
    alert("✅ Bootstrap de Angular completado");
  })
  .catch(err => {
    console.error("❌ Error en Bootstrap:", err);
    alert("❌ Error en Bootstrap: " + err.message);
  });


