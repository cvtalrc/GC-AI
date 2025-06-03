/* eslint-disable no-unused-vars */
export const updatePredictions = (predictionData, namesCache) => {
  let newPredictions = predictionData.pred_classes.map((role, index) => {
    role = role.toLowerCase();
    const standardizedRole = {
      'promoter': 'Promoter',
      'terminator': 'Terminator',
      'cds': 'CDS',
      'ribosome-entry-site': 'RBS',
      'engineered-region': 'Engineered-Region',
      'operator': 'Operator',
      'primer-binding-site': 'Primer-Binding-Site',
      'origin-of-transfer': 'Origin-Of-Transfer',
      'origin-of-replication': 'Origin-Of-Replication',
      'polya': 'PolyA-Site',
      'aptamer': 'Aptamer-DNA',
      'inert-dna-spacer': 'Inert-DNA-Spacer',
      'ncrna': 'Ncrna'
    }[role] || role;

    return {
      id: `${role}-${index}`,
      uri: 'http://parts.igem.org/',
      new: false,
      identifier: '',
      name: '',
      description: '',
      role: standardizedRole,
      sequence: '',
      sequence_length: '',
      availableNames: namesCache[standardizedRole] || [],
      coordinates: predictionData.draw_boxes[index]
    };
  });

  const principalComponent = {
    id: 'component-principal',
    uri: 'http://parts.igem.org/',
    new: false,
    identifier: '',
    name: '',
    description: '',
    role: '',
    availableNames: []
  };
  newPredictions.unshift(principalComponent);

  newPredictions = newPredictions.slice(1).sort((a, b) => a.coordinates[0] - b.coordinates[0]);

  newPredictions.unshift(principalComponent);

  newPredictions = newPredictions.map(prediction => {
    const { coordinates, ...rest } = prediction;
    return rest;
  });

  return newPredictions;
};
