/* eslint-disable no-unused-vars */
import { useState, useContext, useRef, useEffect } from 'react';
import { Container, Paper, Box, Button, Typography } from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import NameContext from '../../context/NameContext';
import CameraCapture from '../../components/CameraCapture/CameraCapture';
import FileUpload from '../../components/FileUpload/FileUpload';
import ImageDisplay from '../../components/ImageDisplay/ImageDisplay';
import NamespaceInput from '../../components/NamespaceInput/NamespaceInput';
import PredictionSection from '../../components/PredictionSection/PredictionSection';
import FunctionalSystem from '../../components/FunctionalSystem/FunctionalSystem';
import { updatePredictions } from '../../utils/PredictionUtils';
import { getImageForRole } from '../../utils/ImageUtils.jsx';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import ConversionDialog from '../../components/ConversionDialog/ConversionDialog';
import { validateForm } from '../../utils/ValidationUtils.jsx';
import JSZip from 'jszip';
import ErrorAlertDialog from '../../components/ErrorAlertDialog/ErrorAlertDialog.jsx';
import Welcome from '../../components/Welcome/Welcome.jsx';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen.jsx';
import GenericModal from '../../components/GenericModal/GenericModal.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [namespace, setNamespace] = useState("");
  const [expressions, setExpressions] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [eds, setEds] = useState([]);

  const [errors, setErrors] = useState({});

  const [imageElement, setImageElement] = useState(null);

  const { namesCache } = useContext(NameContext);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const containerRef = useRef(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConversionDialog, setOpenConversionDialog] = useState(false);
  const [pathDownloadedFile, setPathDownloadedFile] = useState(null);
  const [openDialogAlert, setOpenDialogAlert] = useState(false);
  const isButtonVisible = true;

  const [participantRoles, setParticipantRoles] = useState({});
  const [hasPredictions, setHasPredictions] = useState(false);

  const [predictionName, setPredictionName] = useState(null);

  const [modalConfig, setModalConfig] = useState({ open: false, title: "", message: "", type: "info" });

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current) {
        const { scrollWidth, clientWidth } = containerRef.current;
        setIsScrollable(scrollWidth > clientWidth);
      }
    };
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    };
  }, [stream]);

  const showModal = (title, message, type) => {
    setModalConfig({ open: true, title, message, type });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, open: false });
  };

  const handleDialogAlertClose = () => {
    setOpenDialogAlert(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmSubmit = () => {
    handleCloseDialog();
    handleSubmit();
  };

  const handleSubmit = async () => {

    if (expressions.length === 0) {
      interactions.length = 0
      eds.length = 0
    }

    const validationErrors = validateForm({ namespace, prediction, expressions, interactions, eds }, participantRoles);

    if (validationErrors) {
      setErrors(validationErrors);
      setOpenDialogAlert(true);

      setTimeout(() => {
        setOpenDialogAlert(false);
      }, 3000);

      return;
    } else {
      setErrors({});
    }

    setLoading("sbolGeneration");

    const processedComponents = prediction.map(({ availableNames, ...rest }) => rest);

    const concatenateNameAndInstanceId = (items) => {
      return items.map((item) => {
        const updatedComponents = item.components.map((component) => {
          return `${component.name}_${component.instance_id || 1}`;
        });

        const updatedUnions = item.unions.map((union) => ({
          from: union.from.name
            ? `${union.from.name}_${union.from.instance_id || 1}`
            : union.from,
          to: union.to.name
            ? `${union.to.name}_${union.to.instance_id || 1}`
            : union.to,
          type: union.type,
        }));

        return {
          ...item,
          components: updatedComponents,
          unions: updatedUnions,
        };
      });
    };

    const updatedExpressions = concatenateNameAndInstanceId(expressions);

    const concatenateInteractionsNameAndInstanceId = (interactions, eds) => {
      return interactions.map((interaction) => {
        const updatedParticipants = Object.fromEntries(
          Object.entries(interaction.participants).map(([role, participants]) => {
            const formattedParticipants = participants.map((participant) => {
              const isEd = eds.some(ed => ed.name === participant.name);

              return isEd ? participant.name : `${participant.name}_${participant.instance_id || 1}`;
            });
            return [role, formattedParticipants];
          })
        );

        return {
          ...interaction,
          participants: updatedParticipants,
        };
      });
    };

    const updatedInteractions = concatenateInteractionsNameAndInstanceId(interactions, eds);

    const dataToSend = {
      namespace,
      components: processedComponents,
      expressions: updatedExpressions,
      interactions: updatedExpressions && updatedExpressions.length > 0 ? updatedInteractions : [],
      eds: updatedExpressions && updatedExpressions.length > 0 ? eds : [],
    };

    try {
      const response = await fetch(`${API_BASE_URL}/file/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', prediction[0].name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setOpenConversionDialog(true);
        const filePathStructural = response.headers.get('file_path_structural');
        setPathDownloadedFile(filePathStructural);
        setLoading(null);
      } else {
        setLoading(null);
        showModal("Error", "An error occurred while creating the file. Please try again.", "error");
      }
    } catch (error) {
      setLoading(null);
      showModal("Error", "Database connection error. Please try again later.", "error");
    } finally {
      setPredictionName(prediction[0].name)
      setPrediction(null);
      setNamespace("");
      setExpressions([]);
      setInteractions([]);
      setEds([]);
      setLoading(null);
    }
  };

  const handleConvert = async (formats, pathFile) => {
    setLoading('conversion');
    setOpenConversionDialog(false);

    try {
      const data = {
        file_path: pathFile,
        ...formats,
      };

      const jsonData = JSON.stringify(data);

      const response = await fetch(`${API_BASE_URL}/file/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData,
        timeout: 10000
      });

      if (response.ok) {
        const blob = await response.blob();

        if (blob.size === 0) {
          setLoading(null);
          showModal("Error", "An error occurred while converting the files. Please try again.", "error");
          return;
        }

        if (blob.type !== "application/zip") {
          setLoading(null);
          showModal("Error", "An error occurred while converting the files. Please try again.", "error");

          return;
        }

        try {
          const zip = await JSZip.loadAsync(blob);
          const files = Object.keys(zip.files);

          const newFastaName = `${predictionName}.fasta`;
          const newGbName = `${predictionName}.gb`;

          for (const filename of files) {
            const fileData = await zip.files[filename].async('blob');
            const url = window.URL.createObjectURL(fileData);
            const link = document.createElement('a');
            link.href = url;

            if (filename.endsWith('.fasta')) {
              link.setAttribute('download', newFastaName);
            } else if (filename.endsWith('.gb')) {
              link.setAttribute('download', newGbName);
            } else {
              link.setAttribute('download', filename);
            }

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setLoading(null);
            showModal("Success", "File converted successfully!", "success");
          }
        } catch (error) {
          setLoading(null);
          showModal("Error", "An error occurred while converting the files. Please try again.", "error");
        }
      } else {
        setLoading(null);
        showModal("Error", "An error occurred while converting the files. Please try again.", "error");
      }
    } catch (error) {
      setLoading(null);
      showModal("Error", "Database connection error. Please try again later.", "error");
    } finally {
      setPredictionName(null);
      setPrediction(null);
      setNamespace("");
      setExpressions([]);
      setInteractions([]);
      setEds([]);
      setLoading(null);

    }
  };

  return (
    <>
      {(<Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Paper elevation={3} sx={{ p: 5, mt: 2, width: '100%', border: '3px solid #1b4a3b', borderRadius: 2, boxShadow: '1px 1px 15px 5px #1b4a3b', mb: 2, height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {loading && <LoadingScreen message={loading} />}
            {!loading && !prediction && !stream && <Welcome />}
            {!loading && (
              <>
                <CameraCapture
                  setLoading={setLoading}
                  setImageElement={setImageElement}
                  stream={stream}
                  setStream={setStream}
                  setHasPredictions={setHasPredictions}
                  prediction={prediction}
                  setPrediction={setPrediction}
                  setNamespace={setNamespace}
                  setExpressions={setExpressions}
                  setEds={setEds}
                  setErrors={setErrors}
                  setInteractions={setInteractions}
                  updatePredictions={updatePredictions}
                  showModal={showModal}
                  API_BASE_URL={API_BASE_URL}
                />
                <FileUpload
                  setLoading={setLoading}
                  setHasPredictions={setHasPredictions}
                  setImageElement={setImageElement}
                  prediction={prediction}
                  setPrediction={setPrediction}
                  stream={stream}
                  setNamespace={setNamespace}
                  setExpressions={setExpressions}
                  setEds={setEds}
                  setErrors={setErrors}
                  setInteractions={setInteractions}
                  updatePredictions={updatePredictions}
                  showModal={showModal}
                  API_BASE_URL={API_BASE_URL}
                />
              </>
            )}

            {!loading && prediction && imageElement && Object.keys(namesCache).length > 0 && (
              <>
                <ImageDisplay
                  imageElement={imageElement}
                  prediction={prediction}
                  getImageForRole={getImageForRole}
                  containerRef={containerRef}
                  isScrollable={isScrollable}
                  hasPredictions={hasPredictions}
                />

                <NamespaceInput
                  namespace={namespace}
                  setNamespace={setNamespace}
                  error={Boolean(errors.namespace)}
                  helperText={errors.namespace}
                />

                <PredictionSection
                  prediction={prediction}
                  setPrediction={setPrediction}
                  error={Boolean(errors.prediction)}
                  helperText={errors.prediction}
                  setErrors={setErrors}
                  showModal={showModal}
                  API_BASE_URL={API_BASE_URL}
                />
                <FunctionalSystem
                  expressions={expressions}
                  setExpressions={setExpressions}
                  interactions={interactions}
                  setInteractions={setInteractions}
                  eds={eds}
                  setEds={setEds}
                  participantRoles={participantRoles}
                  setParticipantRoles={setParticipantRoles}
                  prediction={prediction}
                  error={Boolean(errors)}
                  helperText={errors}
                  setErrors={setErrors}
                  showModal={showModal}
                  API_BASE_URL={API_BASE_URL}
                />
                <Box>
                  {isButtonVisible && (
                    <Button variant="contained" color="primary" onClick={handleOpenDialog} startIcon={<NoteAddIcon />} sx={{ mt: 2.5, p: 1 }} fullWidth>
                      Create SBOL 3.1 File
                    </Button>
                  )}
                </Box>
              </>
            )}
          </Box>

        </Paper>

        <ConfirmationDialog
          open={openDialog}
          handleClose={handleCloseDialog}
          handleConfirm={handleConfirmSubmit}
        />

        <ConversionDialog
          open={openConversionDialog}
          handleClose={() => setOpenConversionDialog(false)} handleConvert={(format) => handleConvert(format, pathDownloadedFile)}
        />

        <ErrorAlertDialog
          open={openDialogAlert}
          onClose={handleDialogAlertClose}
        />

        <GenericModal
          open={modalConfig.open}
          onClose={closeModal}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
        />

      </Container>)}
    </>

  );

}
