import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { persistor, store } from './store';
import { queryClient } from './queryClient';
import { AppRouter } from './router';
import ThemeSync from '@/features/theme/ThemeSync';

export function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeSync />
          <AppRouter />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
