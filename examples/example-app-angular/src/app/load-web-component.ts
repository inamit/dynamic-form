import { loadRemoteComponent } from './load-remote';
import { environment } from '../environments/environment';

export async function loadWebComponents() {
  try {
    await Promise.all([
      loadRemoteComponent(environment.mfeListUrl, 'dynamic_list', './WebComponents').catch(err => {
        console.error('Failed to load List WebComponents:', err);
      }),
      loadRemoteComponent(environment.mfeFormUrl, 'dynamic_form', './WebComponents').catch(err => {
        console.error('Failed to load Form WebComponents:', err);
      })
    ]);
  } catch (err) {
    console.error('Failed to load WebComponents:', err);
  }
}
