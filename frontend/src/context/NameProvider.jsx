/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from 'react';
import NameContext from './NameContext';
import { Box, Container, Paper } from '@mui/material';
import Navbar from '../components/Navbar/Navbar';
import LoadingScreen from '../components/LoadingScreen/LoadingScreen';
import Footer from '../components/Footer/Footer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NameProvider = ({ children }) => {
  const [namesCache, setNamesCache] = useState(null);
  const roles = useMemo(() => [
    'Aptamer-RNA', 'Aptamer-DNA', 'Inert-DNA-Spacer', 'Ncrna', 'PolyA-Site',
    'Promoter', 'CDS', 'RBS', 'Operator',
    'Primer-Binding-Site', 'Origin-Of-Transfer', 'Origin-Of-Replication', 'Terminator', 'Engineered-Region',
  ], []);

  useEffect(() => {
    const fetchAllNames = async () => {
      try {
        const responses = await Promise.all(
          roles.map(role =>
            fetch(`${API_BASE_URL}/component/names?role=${role}`)
              .then(res => res.ok ? res.json() : Promise.reject('Server Error'))
          )
        );

        const newCache = roles.reduce((acc, role, index) => {
          acc[role] = responses[index];
          return acc;
        }, {});

        setNamesCache(newCache);
      } catch (error) {
        console.error('Error fetching names:', error);
        setNamesCache({});
      }
    };

    fetchAllNames();
  }, [roles]);

  if (namesCache === null || Object.keys(namesCache).length === 0) {
    return (

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Container maxWidth="md" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={3} sx={{ p: 5, mt: 2, width: '100%', border: '3px solid #1b4a3b', borderRadius: 2, boxShadow: '1px 1px 15px 5px #1b4a3b', mb: 2, height: '100%' }}>
            <LoadingScreen message={'data'} />
          </Paper>
        </Container>
        <Footer />
      </Box>

    );
  }

  return (
    <NameContext.Provider value={{ namesCache, roles }}>
      {children}
    </NameContext.Provider>
  );
};

export default NameProvider;
