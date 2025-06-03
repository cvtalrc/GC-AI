/* eslint-disable react/prop-types */
import { Dialog, DialogTitle, DialogContent, Box, DialogContentText } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const GenericModal = ({ open, onClose, title, message, type }) => {
  const isError = type === "error";
  const isSuccess = type === "success";

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          {isError ? (
            <>
              <ErrorOutlineIcon sx={{ fontSize: 35, color: 'rgba(169, 39, 39, 1)', ml: 2.5, mt: 2, mb: 0 }} />
              <DialogTitle sx={{ mt: .3 }}>{title}</DialogTitle>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircleOutlineIcon sx={{ fontSize: 35, color: 'secondary.main', ml: 2.5, mt: 2, mb: 0 }} />
              <DialogTitle sx={{ mt: .3 }}>{title}</DialogTitle>
            </>
          ) : null}

        </Box>
        <DialogContent sx={{ mt: 0 }}>
          <DialogContentText sx={{ mt: 0 }}>
            {message}
          </DialogContentText>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default GenericModal;
