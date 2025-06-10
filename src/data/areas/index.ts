import { AreaData, Lead } from '../../types';

// Import all area data files explicitly
// This allows us to add/remove area files without breaking the app
const areaModules = import.meta.glob('./*.ts', { eager: true });

// Filter out the index.ts file itself
const areaData: AreaData[] = Object.entries(areaModules)
  .filter(([path]) => !path.endsWith('index.ts'))
  .map(([path, module]) => {
    // Extract area name from file path
    const areaId = path.replace('./', '').replace('.ts', '');
    const areaName = areaId.charAt(0).toUpperCase() + areaId.slice(1);
    
    // Find the leads array in the module
    const leadsExport = Object.entries(module).find(([key]) => 
      key.toLowerCase().includes('leads')
    );
    
    const leads = leadsExport ? leadsExport[1] as Lead[] : [];
    
    return {
      id: areaId,
      name: areaName,
      leads
    };
  });

export { areaData };