/* eslint-disable react/prop-types */
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingScreen = ({message}) => {
    
  const messages = {
    prediction: "Processing your circuit, please wait...",
    sbolGeneration: "Generating SBOL3.1 file...",
    conversion: "Converting files, this might take a moment...",
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh" }}>
      <CircularProgress size={60} />
      <Typography variant='subtitle1' sx={{ mt: 6, textAlign: "center" }}>{messages[message] || "Loading..."}</Typography>
    </Box>
  );
};

export default LoadingScreen;
