import React, { useEffect, useState, useRef } from 'react';

// use chartjs to display info in chart format 
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

import { Chart, LinearScale, CategoryScale, BarElement, Title, Tooltip, LineController } from 'chart.js';

Chart.register(
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
  LineController
);

const SentimentCountCard = () => {
    // import use ref so that we can access reference of chart 
    const chartRef = useRef(null);

    // initialize state to hold chart 
    // the default value for the chart is a dictionary containing an array w the possible values, then a dataset object
    // that stores the label for the chart (number of entries), the background colors for display, and the data itself
    const [chartData, setChartData] = useState({
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [{
            // label number of entries 
            label: 'Number of Entries',
            // define different background colors depending on whether happy, sad, neutral 
            backgroundColor: ['#43a047', '#e53935', '#fb8c00'],
            data: [0, 0, 0]  // Default values will be 0 for everything 
        }]
    });

    // first, let's fetch the data from our backend
    // having a route specifically focused to counting backend data makes it easier  
    const fetchData = async () => {
        try {
            // retrieve the data of sentiment counts using axios 
            const response = await axios.get('/api/entries/sentiment-count');

            // if we actually have data, store it in our state for the chart 
            if (response.data) {
                setChartData({
                    ...chartData,
                    // we can keep the labels the same hence ... 
                    datasets: [{
                        // keep label and background color the same  
                        ...chartData.datasets[0],
                        // we will send from the route the response w 3 fields -- pos, neg, and neutral counts
                        // store in data array  
                        data: [
                            response.data.positive,
                            response.data.negative,
                            response.data.neutral
                        ]
                    }]
                });
            }
        } catch (error) {
            console.error('Error fetching sentiment counts:', error);
        }
    };

    // if there is a current chart when we try to rerender, then destroy it so that we can avoid errors 
    useEffect(() => {
        if (chartRef.current) {
            const chartInstance = chartRef.current.chartInstance;
            if (chartInstance) {
                chartInstance.destroy();
            }
        }
    });

    // constantly fetch data 
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchData();  
        }, 2000); // call fetch function at interval of 2000 milliseconds (2 seconds)
    
        return () => clearInterval(intervalId);  // Clear the interval when the component unmounts
    }, []);

    // return a bar chart 
    // data will be the array 
    // we want to display a legend as well 
    // begin at 0 for counts (aka y data)

    return (
        <div style={{ width: '400px', height: '300px', margin: '20px auto' }}>
            <h3> Journal Summary </h3> 
            <p> These charts show your emotion data over time. </p> 
            <Bar ref={chartRef} data={chartData} options={{  scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: true
                        }
                    }}} />
        </div>
    );
};

export default SentimentCountCard;
