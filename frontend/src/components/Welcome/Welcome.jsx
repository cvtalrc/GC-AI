import { Box, Typography } from '@mui/material';
import SBOLLogo from '../../assets/SBOL-Logo-Full.svg';

export default function Welcome() {
    return (
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <Typography
            variant="h2"
            sx={{ mb: 5, mt: 1, textAlign: 'center', fontWeight: 700 }}
        >
            Welcome to GC-AI!
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'justify', mb: 5 }}>
            A smart tool for designing and documenting genetic circuits. Upload images with synthetic biology symbols, and GC-AI will automatically identify and predict the components. Connect with the iGEM database to use existing parts or create your own, while visualizing your circuit in real-time.
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'justify', mb: 2 }}>
            When everything is ready, generate SBOL 3.1 files and convert them to formats like FASTA or GenBank. Make your projects easier and more accurate with GC-AI!
        </Typography>
        <Box sx={{ mb:2 }}>
        <img src={SBOLLogo} alt="SBOL Logo" style={{ width: 220, height: 220 }} />
        </Box>
    </Box>
    );
  }