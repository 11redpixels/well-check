import { Toaster } from 'sonner';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext'; // V11.4: Theme Engine
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ThemeProvider>
  );
}