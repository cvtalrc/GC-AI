/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from 'react';
import NameContext from './NameContext';

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

    if (!namesCache || Object.keys(namesCache).length === 0) {
        return null;
    }

    return (
        <NameContext.Provider value={{ namesCache, roles }}>
            {children}
        </NameContext.Provider>
    );
};

export default NameProvider;
