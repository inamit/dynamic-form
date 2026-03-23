// A simple script to load a module from Vite Module Federation in an Angular app.
// It effectively mimics what the host Vite app does.
// Since Vite module federation produces an ES module, we can try to dynamically import the remote component.

export async function loadRemoteComponent(url: string, scope: string, module: string) {
  // Vite federation sets `window[scope]` if it's UMD/SystemJS, but since Vite federation targets ESM
  // we can use dynamic import directly to the remoteEntry.js.

  // Actually, Vite's federation plugin generates a specific init pattern.
  // The easiest way to consume it in a non-Vite shell (like Webpack/Angular) is to manually
  // inject a script tag, or since modern browsers support dynamic import, just import the remoteEntry.

  // Wait for the script to load
  return new Promise((resolve, reject) => {
    // Vite output is ESM. Let's try dynamic import.
    import(/* @vite-ignore */ url)
      .then((remoteEntry: any) => {
        // The remote entry from originjs exposes `get(moduleName)` and `init(sharedScope)`
        if (!remoteEntry) {
          return reject(new Error(`Failed to load remote entry from ${url}`));
        }

        try {
          // Initialize sharing (we can pass an empty object or our local react)
          remoteEntry.init({});
        } catch (e) {
          // It's fine if it's already initialized
        }

        // get the module factory
        remoteEntry.get(module)
          .then((factory: any) => {
            const Component = factory();
            resolve(Component.default || Component);
          })
          .catch(reject);
      })
      .catch(reject);
  });
}
