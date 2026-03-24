import { loadRemoteComponent } from './load-remote';

export async function loadWebComponents() {
  try {
    await loadRemoteComponent('http://localhost:5001/assets/remoteEntry.js', 'dynamic_form', './WebComponents');
  } catch (err) {
    console.error('Failed to load WebComponents:', err);
  }
}
