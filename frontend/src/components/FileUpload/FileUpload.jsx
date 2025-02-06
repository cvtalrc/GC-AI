/* eslint-disable react/prop-types */
import { Button } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

export default function FileUpload({setLoading, setHasPredictions, setImageElement, setPrediction, setNamespace, setExpressions, setEds, setInteractions, setErrors, updatePredictions, namesCache, API_BASE_URL, showModal }) {
  const handleFileUpload = async (event) => {
    setLoading('prediction');
    const file = event.target.files[0];
    let url = `${API_BASE_URL}/inference/`;
    let formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        let res = await response.json();
        setHasPredictions(res.has_predictions)
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

  return (
    <>
      <input accept="image/*" style={{ display: 'none' }} id="file-input" type="file" onChange={handleFileUpload}/>
      <label htmlFor="file-input">
        <Button variant="contained" component="span" sx={{ mt: 1, p: 1, mb: 2 }} size='small' fullWidth>
          <ImageIcon sx={{ pr: 1 }} />
          Upload Image
        </Button>
      </label>
    </>
  );
}
