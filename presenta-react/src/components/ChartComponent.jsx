import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * Chart Component using Chart.js
 * Renders different chart types with customizable data and styling
 */
const ChartComponent = ({ chartType, chartData, chartOptions, width, height }) => {
    const chartRef = useRef(null);

    // Default data if none provided
    const defaultData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
            label: 'Dataset 1',
            data: [12, 19, 3, 5, 2],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 2,
        }]
    };

    // Default options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#666',
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: false
            }
        },
        scales: chartType === 'pie' || chartType === 'doughnut' || chartType === 'radar' || chartType === 'polarArea' ? undefined : {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#666'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: '#666'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }
        }
    };

    const data = chartData || defaultData;
    const options = { ...defaultOptions, ...(chartOptions || {}) };

    // Render appropriate chart type
    const renderChart = () => {
        const chartProps = {
            ref: chartRef,
            data,
            options,
            width,
            height
        };

        switch (chartType) {
            case 'line':
                return <Line {...chartProps} />;
            case 'bar':
                return <Bar {...chartProps} />;
            case 'pie':
                return <Pie {...chartProps} />;
            case 'doughnut':
                return <Doughnut {...chartProps} />;
            case 'radar':
                return <Radar {...chartProps} />;
            case 'polarArea':
                return <PolarArea {...chartProps} />;
            default:
                return <Bar {...chartProps} />;
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-2">
            {renderChart()}
        </div>
    );
};

ChartComponent.propTypes = {
    chartType: PropTypes.oneOf(['line', 'bar', 'pie', 'doughnut', 'radar', 'polarArea']).isRequired,
    chartData: PropTypes.shape({
        labels: PropTypes.arrayOf(PropTypes.string),
        datasets: PropTypes.arrayOf(PropTypes.object)
    }),
    chartOptions: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number
};

ChartComponent.defaultProps = {
    chartType: 'bar',
    width: 400,
    height: 300
};

export default ChartComponent;
