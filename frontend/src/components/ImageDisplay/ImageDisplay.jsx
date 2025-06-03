/* eslint-disable react/prop-types */
import { Box, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

export default function ImageDisplay({ imageElement, prediction, getImageForRole, containerRef, isScrollable, hasPredictions }) {
  return (
    <>
      <Typography sx={{ mt: 4, fontWeight: 700, textAlign: 'justify' }}>Prediction</Typography>
      <Typography sx={{ textAlign: 'justify' }}>Symbols identified from the uploaded or captured image. To modify, add, or remove components from the prediction, please use the section below.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, mt: 4, width: '100%' }}>
        <Box
          component="img"
          src={imageElement.src}
          sx={{ width: '100%', height: '100%', maxHeight: { xs: '100%', md: '60vw' }, maxWidth: { xs: '100%', md: '35vw' }, borderRadius: 2 }}
        />
      </Box>

      {!hasPredictions ?
        <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2, mb: 2 }}>
          <WarningIcon sx={{ color: 'rgba(169, 39, 39, 1)' }} />
          <Typography sx={{ color: 'rgba(169, 39, 39, 1)', ml: 1 }}>No predictions found. Please add components in the section below.</Typography>

        </Box> : ''}

      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
        <Typography sx={{ fontWeight: 600, textAlign: 'justify' }}>Structural System</Typography>
        <Typography sx={{ textAlign: 'justify' }}>Visual representation of the structural circuit.</Typography>
        <Box
          ref={containerRef}
          sx={{ display: 'flex', overflowX: 'auto', justifyContent: isScrollable ? 'flex-start' : 'center', padding: '10px' }}
        >
          {prediction.map(
            (item, index) =>
              index > 0 && (
                <div
                  key={item.id}
                  style={{ textAlign: 'center', width: 'auto', scrollSnapAlign: 'start' }}
                >
                  {getImageForRole(item.role, item.name)}
                </div>
              )
          )}
        </Box>
      </Box>
    </>
  );
}
