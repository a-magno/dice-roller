import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { SheetManagerPage } from './pages/SheetManagerPage';
import { DocsPage } from './pages/DocsPage';
import { LibraryBrowserPage } from './pages/LibraryBrowserPage';
import { SheetListPage } from './pages/SheetListPage';
import { ProfilePage } from './pages/ProfilePage'; // New Import

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sheets" element={<SheetListPage />} />
          <Route path="/sheet/:sheetId" element={<SheetManagerPage />} />
          <Route path="/library" element={<LibraryBrowserPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/profile" element={<ProfilePage />} /> {/* New Route */}
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
