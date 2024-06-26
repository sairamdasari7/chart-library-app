import React from 'react';
import ChartComponent from './components/ChartComponent';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Charting Example</h1>
      </header>
      <main>
        <ChartComponent />
      </main>
    </div>
  );
};

export default App;
