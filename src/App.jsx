import React, { useState, useEffect } from 'react';
import GalaxyVisualization from './components/GalaxyVisualization';
import SpeciesClock from './components/SpeciesClock';
import {
  loadParks,
  loadSpecies,
  filterSpeciesByPark,
  transformToGraphData
} from './utils/dataLoader';
import './App.css';

function App() {
  const [parks, setParks] = useState([]);
  const [allSpecies, setAllSpecies] = useState([]);
  const [selectedPark, setSelectedPark] = useState(null);
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colorMode, setColorMode] = useState('nativeness');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [parksData, speciesData] = await Promise.all([
          loadParks(),
          loadSpecies()
        ]);

        setParks(parksData.sort((a, b) => a.name.localeCompare(b.name)));
        setAllSpecies(speciesData);

        // Select first park by default
        if (parksData.length > 0) {
          setSelectedPark(parksData[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load park and species data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedPark && allSpecies.length > 0) {
      const parkSpecies = filterSpeciesByPark(allSpecies, selectedPark.name);

      // Limit to 500 species for performance
      const limitedSpecies = parkSpecies.slice(0, 500);
      setFilteredSpecies(limitedSpecies);

      const graph = transformToGraphData(limitedSpecies);
      setGraphData(graph);
    }
  }, [selectedPark, allSpecies]);

  const handleParkChange = (event) => {
    const parkName = event.target.value;
    const park = parks.find(p => p.name === parkName);
    setSelectedPark(park);
  };

  const handleColorModeToggle = () => {
    setColorMode(prev => prev === 'nativeness' ? 'category' : 'nativeness');
  };

  if (loading) {
    return <div className="loading">Loading park data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Species Galaxy</h1>
        <p>Explore biodiversity across America's National Parks - One glance to see what lives here</p>
      </header>

      <div className="park-selector">
        <label htmlFor="park-select">Select a Park:</label>
        <select
          id="park-select"
          value={selectedPark?.name || ''}
          onChange={handleParkChange}
        >
          {parks.map(park => (
            <option key={park.code} value={park.name}>
              {park.name} ({park.state})
            </option>
          ))}
        </select>

        <button
          onClick={handleColorModeToggle}
          style={{
            marginLeft: '1rem',
            padding: '0.5rem 1rem',
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Color by: {colorMode === 'nativeness' ? 'Nativeness' : 'Category'}
        </button>

        {selectedPark && (
          <span style={{ marginLeft: '1rem', color: '#94a3b8' }}>
            Showing {filteredSpecies.length} species
            {filteredSpecies.length >= 500 && ' (limited to 500 for performance)'}
          </span>
        )}
      </div>

      <div className="main-content">
        <div className="galaxy-container">
          {graphData && (
            <GalaxyVisualization
              graphData={graphData}
              colorMode={colorMode}
            />
          )}
        </div>

        <div className="species-clock-container">
          {filteredSpecies.length > 0 && (
            <SpeciesClock species={filteredSpecies} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
