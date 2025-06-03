import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/home/Home';
import NameProvider from './context/NameProvider';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { CssBaseline, ThemeProvider, Box } from '@mui/material';
import theme from './theme/theme';

import '@fontsource/noto-kufi-arabic/400.css';
import '@fontsource/noto-kufi-arabic/700.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NameProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box sx={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </NameProvider>
    </ThemeProvider>
  );
}

export default App;
