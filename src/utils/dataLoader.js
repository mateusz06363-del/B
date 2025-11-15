import Papa from 'papaparse';

export const loadParks = async () => {
  const response = await fetch('/parks.csv');
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parks = results.data.map(row => ({
          code: row['Park Code'],
          name: row['Park Name'],
          state: row['State'],
          acres: parseFloat(row['Acres']),
          latitude: parseFloat(row['Latitude']),
          longitude: parseFloat(row['Longitude'])
        }));
        resolve(parks);
      },
      error: (error) => reject(error)
    });
  });
};

export const loadSpecies = async () => {
  const response = await fetch('/species.csv');
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const species = results.data.map(row => ({
          id: row['Species ID'],
          parkName: row['Park Name'],
          category: row['Category'],
          order: row['Order'],
          family: row['Family'],
          scientificName: row['Scientific Name'],
          commonNames: row['Common Names'],
          recordStatus: row['Record Status'],
          occurrence: row['Occurrence'],
          nativeness: row['Nativeness'],
          abundance: row['Abundance'],
          seasonality: row['Seasonality'],
          conservationStatus: row['Conservation Status']
        }));
        resolve(species);
      },
      error: (error) => reject(error)
    });
  });
};

export const filterSpeciesByPark = (species, parkName) => {
  return species.filter(s => s.parkName === parkName);
};

export const transformToGraphData = (species) => {
  // Create nodes for each species
  const nodes = species.map(s => ({
    id: s.id,
    name: s.commonNames || s.scientificName,
    scientificName: s.scientificName,
    category: s.category,
    family: s.family,
    order: s.order,
    nativeness: s.nativeness,
    abundance: s.abundance,
    seasonality: s.seasonality,
    conservationStatus: s.conservationStatus
  }));

  // Create links between species that share the same family
  const links = [];
  const familyGroups = {};

  species.forEach((s, i) => {
    if (s.family) {
      if (!familyGroups[s.family]) {
        familyGroups[s.family] = [];
      }
      familyGroups[s.family].push(i);
    }
  });

  // Create links within families (limit to avoid too many links)
  Object.values(familyGroups).forEach(indices => {
    if (indices.length > 1 && indices.length < 50) {
      // Create a few links per family to show relationships
      for (let i = 0; i < Math.min(indices.length - 1, 5); i++) {
        links.push({
          source: species[indices[i]].id,
          target: species[indices[i + 1]].id
        });
      }
    }
  });

  return { nodes, links };
};

export const getSeasonalityData = (species) => {
  // Map seasonality to months
  const monthlyData = Array(12).fill(0);

  species.forEach(s => {
    const seasonality = s.seasonality?.toLowerCase() || '';

    if (seasonality.includes('resident')) {
      // Year-round
      for (let i = 0; i < 12; i++) monthlyData[i]++;
    } else if (seasonality.includes('breeder')) {
      // Spring/Summer (Apr-Aug)
      for (let i = 3; i < 8; i++) monthlyData[i]++;
    } else if (seasonality.includes('migratory')) {
      // Spring and Fall (Mar-May, Sep-Nov)
      for (let i = 2; i < 5; i++) monthlyData[i]++;
      for (let i = 8; i < 11; i++) monthlyData[i]++;
    } else if (seasonality.includes('summer')) {
      // Summer months (Jun-Aug)
      for (let i = 5; i < 8; i++) monthlyData[i]++;
    } else if (seasonality.includes('winter')) {
      // Winter months (Dec-Feb)
      monthlyData[11]++;
      monthlyData[0]++;
      monthlyData[1]++;
    } else if (seasonality.includes('vagrant')) {
      // Rare, don't add to monthly counts
    } else {
      // Unknown - assume year-round
      for (let i = 0; i < 12; i++) monthlyData[i]++;
    }
  });

  return monthlyData;
};

export const getAbundanceSize = (abundance) => {
  const sizes = {
    'Abundant': 20,
    'Common': 15,
    'Occasional': 12,
    'Uncommon': 10,
    'Rare': 7,
    'Unknown': 8
  };
  return sizes[abundance] || 8;
};

export const getNativenessColor = (nativeness) => {
  const colors = {
    'Native': '#22c55e',           // Green
    'Not Native': '#ef4444',        // Red
    'Unknown': '#94a3b8',           // Gray
    'Not Checked': '#64748b',       // Darker gray
    'Probably Native': '#84cc16',   // Light green
    'Probably Not Native': '#f97316' // Orange
  };
  return colors[nativeness] || '#94a3b8';
};

export const getCategoryColor = (category) => {
  const colors = {
    'Mammal': '#f59e0b',
    'Bird': '#3b82f6',
    'Reptile': '#84cc16',
    'Amphibian': '#10b981',
    'Fish': '#06b6d4',
    'Invertebrate': '#8b5cf6',
    'Insect': '#a855f7',
    'Spider/Scorpion': '#ec4899',
    'Slug/Snail': '#f43f5e',
    'Crab/Lobster/Shrimp': '#14b8a6',
    'Vascular Plant': '#22c55e',
    'Nonvascular Plant': '#65a30d',
    'Fungi': '#d946ef',
    'Algae': '#0ea5e9'
  };
  return colors[category] || '#64748b';
};
