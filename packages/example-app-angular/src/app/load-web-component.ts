import { loadRemoteComponent } from './load-remote';

export async function loadWebComponents() {
  try {
    await loadRemoteComponent(`${(window as any).env.MFE_URL}/assets/remoteEntry.js`, 'dynamic_form', './WebComponents');
  } catch (err) {
    console.error('Failed to load WebComponents:', err);
  }
}
