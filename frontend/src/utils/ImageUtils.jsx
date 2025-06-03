import * as Symbols from '../assets/symbols';

export const getImageForRole = (role, name) => {
  switch (role) {
    case 'Promoter':
      return <img src={Symbols.promoter} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'RBS':
      return <img src={Symbols.rbs} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'CDS':
      return <img src={Symbols.cds} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'Terminator':
      return <img src={Symbols.terminator} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'Operator':
      return <img src={Symbols.operator} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'Primer-Binding-Site':
      return <img src={Symbols.primerBindingSite} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'Engineered-Region':
      return <img src={Symbols.engineeredRegion} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'Origin-Of-Transfer':
      return <img src={Symbols.originOfTransfer} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'Aptamer-DNA':
      return <img src={Symbols.aptamer} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'Aptamer-RNA':
      return <img src={Symbols.aptamer} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'Inert-DNA-Spacer':
      return <img src={Symbols.inertDNASpacer} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'Ncrna':
      return <img src={Symbols.ncrna} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'PolyA-Site':
      return <img src={Symbols.polyA} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;
    case 'Origin-Of-Replication':
      return <img src={Symbols.originOfReplication} alt={name} key={name} style={{ width: '50px', height: '50px', margin: '10px' }} />;

    default:
      return null;
  }
};
