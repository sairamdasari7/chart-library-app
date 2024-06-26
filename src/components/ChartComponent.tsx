import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import { parseISO, startOfWeek, startOfMonth, format } from 'date-fns';
import './ChartComponent.css';

interface DataPoint {
  timestamp: string;
  value: number;
}

const ChartComponent: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [timeframe, setTimeframe] = useState('daily');
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => setData(data))
      .catch(error => console.error('Fetching data failed:', error));
  }, []);

  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      alert(`Timestamp: ${data.activeLabel}\nValue: ${data.activePayload[0].value}`);
    } else {
      console.error('Invalid data passed to handleClick:', data);
    }
  };

  const filterDataByTimeframe = (data: DataPoint[], timeframe: string): DataPoint[] => {
    if (timeframe === 'daily') {
      return data;
    }

    const groupedData = data.reduce((acc: { [key: string]: { timestamp: string; value: number; count: number } }, current) => {
      const date = parseISO(current.timestamp);
      let key: string;

      if (timeframe === 'weekly') {
        key = format(startOfWeek(date), 'yyyy-MM-dd');
      } else if (timeframe === 'monthly') {
        key = format(startOfMonth(date), 'yyyy-MM');
      } else {
        key = ''; // Fallback to an empty string if the timeframe is not recognized
      }

      if (key) {
        if (!acc[key]) {
          acc[key] = { timestamp: key, value: 0, count: 0 };
        }
        acc[key].value += current.value;
        acc[key].count += 1;
      }

      return acc;
    }, {});

    return Object.values(groupedData).map(item => ({
      timestamp: item.timestamp,
      value: item.value / item.count,
    }));
  };

  const exportChart = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'chart.png';
        link.click();
      });
    }
  };

  return (
    <div className="chart-container">
      <img src="/logo.png" alt="Logo" className="logo" />
      <div className="controls">
        <button onClick={() => setTimeframe('daily')}>Daily</button>
        <button onClick={() => setTimeframe('weekly')}>Weekly</button>
        <button onClick={() => setTimeframe('monthly')}>Monthly</button>
        <button onClick={exportChart}>Export Chart</button>
      </div>
      <div ref={chartRef} className="chart">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filterDataByTimeframe(data, timeframe)} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartComponent;
