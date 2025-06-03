/* eslint-disable react/prop-types */
import { Box, TextField, Typography } from '@mui/material';

export default function NamespaceInput({ namespace, setNamespace, error, helperText }) {
  const handleNamespaceChange = (event) => {
    setNamespace(event.target.value);
  };
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontWeight: 600, mb: 2 }}>Define the base namespace (Optional)</Typography>
      <Typography></Typography>
      <TextField
        size='small'
        focused
        placeholder="https://example.com/"
        label="Namespace"
        name="namespace"
        value={namespace}
        helperText={helperText}
        error={error}
        fullWidth
        sx={{ mt: 1, mb: 1 }}
        onChange={handleNamespaceChange}
      />
    </Box>
  );
}