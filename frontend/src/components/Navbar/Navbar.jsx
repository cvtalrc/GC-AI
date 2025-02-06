import { AppBar, Toolbar, Typography } from '@mui/material';

const Navbar = () => {
    return (
        <AppBar position="static" sx={{ backgroundColor: 'primary.main', mb: 2 }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
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
