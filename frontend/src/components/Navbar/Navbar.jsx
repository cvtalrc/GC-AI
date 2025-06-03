import { AppBar, Toolbar, Typography } from '@mui/material';
import logo from '../../assets/GC-AI.svg';

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: 'primary.main', mb: 2 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
        <img src={logo} alt="GC-AI Logo" width="35" style={{ marginRight: "10px" }} />
        <Typography
          variant="h5"
          sx={{ color: '#fff ', fontWeight: '700' }}
        >
          GC-AI
        </Typography>
      </Toolbar>
    </AppBar>

  );
};

export default Navbar;
