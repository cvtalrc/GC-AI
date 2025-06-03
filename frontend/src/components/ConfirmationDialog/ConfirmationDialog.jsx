/* eslint-disable react/prop-types */
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const ConfirmationDialog = ({ open, handleClose, handleConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <HelpOutlineIcon sx={{ fontSize: 35, color: 'primary.main', ml: 2.5, mt: { xs: 4, md: 2, sm: 2 }, mb: 0 }} />
        <DialogTitle sx={{ mt: .3, width: { xs: '60vw' } }} id="alert-dialog-title" >
          {"Confirm Creation of SBOL3.1 File"}
        </DialogTitle>
      </Box>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to create the SBOL3.1 file? This will save the current configuration and create a downloadable XML file.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Button onClick={handleClose} color="primary" variant='outlined' fullWidth>
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" variant='contained' fullWidth autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
