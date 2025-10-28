(() => {
  // Register the service worker for PWA capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Corrected typo: serviceWorker is one word with a capital W
      navigator.serviceWorker.register('./service-worker.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
  
  const App = window.MySelvam.components.App;
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
})();
