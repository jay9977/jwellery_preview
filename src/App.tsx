import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ContentProvider } from './contexts/ContentContext';
import { CartProvider } from './contexts/CartContext';
import { Landing } from './pages/Landing';
import { Admin } from './pages/Admin';

export function App() {
  return (
    <ContentProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ContentProvider>);

}