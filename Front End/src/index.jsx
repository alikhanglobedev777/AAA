import React from 'react';
import ReactDOM from 'react-dom/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import './index.css';
import App from './App';
import { queryClient, queryPersister } from './lib/queryClient';
// import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 30 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateQuery: ({ queryKey, state }) =>
            state.status === 'success' &&
            ['businesses', 'service-categories'].includes(queryKey[0]),
        },
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
