import { Box, Typography } from '@mui/material';
import SBOLLogo from '../../assets/SBOL-Logo-Full.svg';
import logo from '../../assets/GC-AI.svg';

export default function Welcome() {
  return (
    <Box sx={{ maxWidth: '1100px', pl: 4, pr: 4 }}>
      <Typography sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }, mb: { xs: 4, md: 6 }, textAlign: 'center', fontWeight: 700 }}> Welcome to GC-AI! </Typography>

      <Box sx={{ '&::after': { content: '""', display: 'table', clear: 'both' } }}>
        <Box component="img" src={logo} alt="GC-AI Logo" sx={{ display: 'block', width: { xs: '200px', sm: '300px', md: '320px' }, float: { xs: 'none', md: 'left' }, margin: { xs: '0 auto 32px auto', md: '0 32px 32px 0' } }}
        />
        <Typography variant="h6" sx={{ textAlign: 'justify', mb: 3 }}>
          A smart tool for designing and documenting genetic circuits. Upload images with synthetic biology symbols, and GC-AI will automatically identify and predict the components. Connect with the iGEM database to use existing parts or create your own, while visualizing your circuit in real-time.
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'justify', mb: 4 }}>
          When everything is ready, generate SBOL 3.1 files and convert them to formats like GenBank or FASTA. Make your projects easier and more accurate with GC-AI!
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row', sm: 'row' }, gap: { xs: 2, md: 14, sm: 6 }, alignItems: 'center', justifyContent: 'center', mb: { xs: 4 }, mt: 2 }}
      >
        <Box>
          <Box component="img" src={SBOLLogo} alt="SBOL Logo" sx={{ width: 100, height: 40 }}
          />
        </Box>
        <Box>
          <Typography variant='h5' fontWeight={600} textAlign="center"
          > GenBank </Typography>
        </Box>
        <Box>
          <Typography variant='h5' fontWeight={600} textAlign="center"
          > FASTA </Typography>
        </Box>
      </Box>
    </Box>
  );
}