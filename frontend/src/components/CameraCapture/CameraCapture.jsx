/* eslint-disable react/prop-types */

import { Button, Box, IconButton } from '@mui/material';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import { useContext, useRef, useState } from 'react';
import NameContext from '../../context/NameContext';

export default function CameraCapture({ API_BASE_URL, setLoading, setImageElement, stream, setStream, setHasPredictions, prediction, setPrediction, setNamespace, setExpressions, setEds, setInteractions, setErrors, updatePredictions, showModal }) {
  const { namesCache } = useContext(NameContext);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleCapturePhoto = async () => {
    setLoading('prediction');
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageUrl = canvas.toDataURL('image/png');

    const img = new Image();
    img.onload = () => {
      setImageElement(img);
    };
    img.src = imageUrl;

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    video.srcObject = null;
    setIsCameraOpen(false);

    try {
      const blob = await fetch(imageUrl).then(res => res.blob());
      const formData = new FormData();
      formData.append('image', blob, 'captured-image.png');

      const response = await fetch(`${API_BASE_URL}/inference/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        let res = await response.json();
        setHasPredictions(res.has_predictions);
        if (res.pred_classes && Array.isArray(res.pred_classes)) {
          const base64Image = `data:image/png;base64, ${res.result_image}`;

          const img = new Image();
          img.onload = () => {
            setImageElement(img);
          };
          img.src = base64Image;

          setPrediction(updatePredictions(res, namesCache));

          setNamespace("")
          setExpressions([])
          setEds([])
          setInteractions([])
          setErrors({})

        } else {
          setLoading(null);
          showModal("Error", "An error occurred while uploading the file. Please try again later.", "error");
        }
      } else {
        setLoading(null);
        showModal("Error", "An error occurred while uploading the file. Please try again later.", "error");
      }
    } catch (error) {
      setLoading(null);
      showModal("Error", "Database connection error. Please try again later.", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleCameraToggle = async () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      document.getElementById('native-camera-input').click();
    } else {
      if (!isCameraOpen) {
        try {
          setIsCameraOpen(true);
          const userMediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              facingMode: 'environment',
            },
          });
          videoRef.current.srcObject = userMediaStream;
          setStream(userMediaStream);
        } catch (error) {
          showModal("Error", "Error accessing the camera.", "error");
          setIsCameraOpen(false);
        }
      } else {
        setIsCameraOpen(false);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
          videoRef.current.srcObject = null;
        }
      }
    }
  };

  return (
    <Box sx={{ pr: !prediction && !stream ? 4 : 0, pl: !prediction && !stream ? 4 : 0, pt: !prediction ? 2 : 0 }}>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        id="native-camera-input"
        style={{ display: 'none' }}
      />

      {!isCameraOpen && (
        <Button
          variant="contained"
          onClick={handleCameraToggle}
          sx={{ p: 1 }}
          size="small"
          fullWidth
        >
          <CameraAltIcon sx={{ pr: 1 }} />
          Capture Image
        </Button>
      )}

      {isCameraOpen && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && (
        <Box sx={{ position: 'relative', textAlign: 'center' }}>
          <video ref={videoRef} width="100%" autoPlay />

          <IconButton
            onClick={() => handleCameraToggle(false)}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: 'primary.main',
              borderRadius: '50%',
              color: 'white',
              boxShadow: 2,
              p: 0.05,
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
            }}
          >
            <CancelIcon />
          </IconButton>

          <Button
            variant="contained"
            onClick={handleCapturePhoto}
            sx={{ p: 1, mt: 2 }}
            size="small"
            fullWidth
          >
            <CenterFocusStrongIcon sx={{ pr: 1 }} />
            Capture Photo
          </Button>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Box>
      )}
    </Box>
  );
}
