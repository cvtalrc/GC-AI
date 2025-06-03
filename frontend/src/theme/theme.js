import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1b4a3b',
    },
    secondary: {
      main: '#4caf50',
      default: '#dae1e1'
    },
  },
  typography: {
    fontFamily: 'Noto Kufi Arabic, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          background: 'linear-gradient(140deg, #1b4a3b 20%, #4caf50 70%, #4caf50 100%)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',

        },
      },
    },
  },
});

export default theme;
