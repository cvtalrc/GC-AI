/* eslint-disable react/prop-types */
import { Dialog, DialogTitle, DialogContent, Box, DialogContentText } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
export default function ErrorAlertDialog({ open, handleClose }) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <ErrorOutlineIcon sx={{ fontSize: 35, color: 'rgba(169, 39, 39, 1)', ml: 2, mt: 2, mb: 0 }} />
          <DialogTitle sx={{ mt: .3 }}>Error</DialogTitle>
        </Box>
        <DialogContent sx={{ mt: 0 }}>
          <DialogContentText sx={{ mt: 0 }}>
            Some fields contain errors. Please check them and try again.
          </DialogContentText>
        </DialogContent>
      </Box>
    </Dialog>
  );
}