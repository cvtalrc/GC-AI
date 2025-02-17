/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Checkbox, FormControlLabel, FormGroup, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ConversionDialog = ({ open, handleClose, handleConvert }) => {
  const [selectedFormats, setSelectedFormats] = useState({
    fasta: false,
    genbank: false,
  });

  const handleCheckboxChange = (event) => {
    setSelectedFormats({
      ...selectedFormats,
      [event.target.name]: event.target.checked,
    });
  };

  const handleConfirm = () => {
    handleConvert(selectedFormats);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="conversion-dialog-title"
      aria-describedby="conversion-dialog-description"
    >
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <CheckCircleOutlineIcon sx={{ fontSize: 35, color: 'secondary.main', ml: 2.5, mt: 2, mb: 0 }} />
      <DialogTitle sx={{ mt: .3 }} id="conversion-dialog-title">
        {"Convert SBOL 3.1 File"}
      </DialogTitle>
      </Box>
      <DialogContent>
        <DialogContentText id="conversion-dialog-description">
          The SBOL 3.1 file has been successfully downloaded. Would you like to convert this file into another format? You can select multiple options.
        </DialogContentText>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={selectedFormats.fasta} onChange={handleCheckboxChange} name="fasta" />}
            label="Convert to FASTA"
          />
          <FormControlLabel
            control={<Checkbox checked={selectedFormats.genbank} onChange={handleCheckboxChange} name="genbank" />}
            label="Convert to GENBANK"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions sx={{display:'flex', justifyContent:'center', p: 2}}>
        <Button onClick={handleClose} color="primary" variant='outlined' fullWidth>
          No, Thanks
        </Button>
        <Button onClick={handleConfirm} color="primary" variant='contained' fullWidth disabled={!selectedFormats.fasta && !selectedFormats.genbank}>
          Convert
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConversionDialog;
