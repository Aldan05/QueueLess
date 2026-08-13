import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './utils/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <DatabaseProvider>
        <AuthProvider>
          <Toaster position="bottom-right" />
          <ScrollToTop />
          <AppRoutes />
        </AuthProvider>
      </DatabaseProvider>
    </BrowserRouter>
  );
}

export default App;
