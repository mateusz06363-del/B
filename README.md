# Species Galaxy - National Parks Biodiversity Visualization

An interactive visualization platform that showcases biodiversity across America's National Parks. Experience the "Species Galaxy" - a force-directed graph that reveals what lives in each park at a glance.

## Features

### 1. Interactive Force-Directed Graph (Species Galaxy)
- **Nodes**: Each species represented as a node
- **Size**: Scaled by abundance (Rare → Uncommon → Common → Abundant)
- **Color**: Colored by nativeness (Native/Non-Native) or taxonomic category
- **Links**: Connections show shared family/order relationships
- **Interactions**:
  - Hover over nodes to see detailed species information
  - Drag nodes to explore relationships
  - Zoom and pan to navigate large datasets

### 2. Circular Species Clock
- **12 Segments**: One for each month of the year
- **Arc Length**: Represents number of species active in that month
- **Seasonal Patterns**: Visualize breeding seasons, migratory patterns, and year-round residents
- **Interactive**: Click segments to filter species by month

### 3. Park Selection
- Select from 57 National Parks
- View species statistics and biodiversity metrics
- Toggle between nativeness and category color modes

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization library
  - `d3.forceSimulation()` - Force-directed graph layout
  - `d3.arc()` - Circular species clock
- **PapaParse** - CSV parsing

## Data

The visualization uses real data from National Parks:
- **parks.csv**: 57 National Parks with location and size data
- **species.csv**: 119,259 species records with taxonomic and ecological information

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Visualization Details

### Galaxy Graph
The force-directed graph uses several D3.js forces:
- **Link Force**: Connects species in the same family
- **Charge Force**: Repels nodes to prevent overlap
- **Center Force**: Keeps the graph centered
- **Collision Force**: Prevents nodes from overlapping based on size

### Color Modes

**Nativeness Mode:**
- Green: Native species
- Red: Non-native/invasive species
- Gray: Unknown status

**Category Mode:**
- Each taxonomic category (Mammals, Birds, Fish, etc.) has a unique color
- 14 different categories represented

### Performance

To ensure smooth interactions:
- Limited to 500 species per park for optimal performance
- Efficient force simulation with optimized parameters
- Responsive design adapts to different screen sizes

## Project Structure

```
├── public/
│   ├── parks.csv           # Parks data
│   └── species.csv         # Species data
├── src/
│   ├── components/
│   │   ├── GalaxyVisualization.jsx  # Force-directed graph
│   │   └── SpeciesClock.jsx         # Circular calendar
│   ├── utils/
│   │   └── dataLoader.js            # Data loading and transformation
│   ├── App.jsx             # Main application
│   ├── App.css             # Styles
│   └── main.jsx            # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Future Enhancements

- Photo gallery for each species
- Advanced filtering (by category, conservation status, abundance)
- Month-based filtering from the species clock
- Search functionality
- Export visualizations as images
- Mobile-responsive design improvements

## License

ISC
