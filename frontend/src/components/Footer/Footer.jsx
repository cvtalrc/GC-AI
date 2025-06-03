import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{
      width: '100%',
      textAlign: 'center',
      py: 3,
      px: 2,
      mt: 2,
      backgroundColor: 'secondary.main',
      bottom: 0,
      left: 0,
      color: '#fff',
      boxShadow: '1px 1px 15px 1px #1b4a3b'
    }}>
      <Typography variant="body1">
        © {new Date().getFullYear()} GC-AI. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
