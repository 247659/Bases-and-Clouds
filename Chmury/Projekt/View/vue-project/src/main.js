import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { Amplify } from 'aws-amplify';
import amplifyconfig from './amplifyconfiguration';
Amplify.configure(amplifyconfig);


const existingConfig = Amplify.getConfig();

// Add existing resource to the existing configuration.
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: {
      ...existingConfig.API?.REST,
      YourAPIName: {
        endpoint:
          'https://tnvswpmu22.execute-api.eu-north-1.amazonaws.com/Stage1',
        region: 'ue-north-1' // Optional
      }
    }
  }
});

createApp(App).mount('#app')
