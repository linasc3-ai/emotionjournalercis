import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Tooltip,
    Legend
} from 'chart.js';

// must import and register chart components 
Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Tooltip,
    Legend
);

const SentimentTrendsChart = () => {
    const chartRef = useRef(null);

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    const fetchData = async () => {
        try {
            // pull out the trend data from the sentiment trends route 
            const response = await axios.get('/api/entries/sentiment-trends');
            const data = response.data; // get the data specifically

            // given entry in response data contains date, sentiment, and rate e.g. { _id: { date: "2024-05-01", sentiment: "Positive" }, averageRate: 8 },
            // we want to pull out just the date data so we can use it on x axis e.g. ["2024-05-01", "2024-05-01", "2024-05-02"]
            const labels = [...new Set(data.map(item => item._id.date))]; // also makes sure we only have unique dates 
            // set because it stores unique values

            // for each category, return an object containing the label of the sentiment 
            // itself
            // search data for objects matching a given date and sentiment 
            // take average rate from the entry 
            // we will have array with average rates from each day 
            const dataSets = ['Positive', 'Negative', 'Neutral'].map(sentiment => {
                return {
                    label: `${sentiment} Sentiment`,
                    data: labels.map(label => {
                        const item = data.find(d => d._id.date === label && d._id.sentiment === sentiment);
                        return item ? item.averageRate : null;
                    }),
                    fill: true,
                    // set diff border color depending on pos neg or neutral 
                    borderColor: sentiment === 'Positive' ? '#43a047' : sentiment === 'Negative' ? '#e53935' : '#fb8c00',
                    tension: 0.1
                };
            });

            setChartData({
                labels,
                datasets: dataSets
            });
        } catch (error) {
            console.error('Failed to fetch sentiment trends:', error);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchData();  
        }, 2000); // call fetch function at interval of 2000 milliseconds (2 seconds)
    
        return () => clearInterval(intervalId);  // Clear the interval when the component unmounts
    }, []);

    useEffect(() => {
        if (chartRef.current) {
            const chartInstance = chartRef.current.chartInstance;
            if (chartInstance) {
                chartInstance.destroy();
            }
        }
    });

    // create line chart
    // begin at zero 
    // use legend 
    return (
        <div>
            <h4>Sentiment Trends Over Time</h4>
            <p> This chart displays the average emotion severity rate for each emotion across days. </p> 
            {chartData.datasets.length > 0 ? (
                <Line data={chartData} options={{
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }} />
            ) : <p>Loading chart data...</p>}
        </div>
    );
};

export default SentimentTrendsChart;
