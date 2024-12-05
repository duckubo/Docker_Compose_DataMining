import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const CandlestickChart1M = ({ ticket }) => {
    const [dataDay, setDataDay] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/stock-data?ticket=${ticket}`);
                const stockData = await response.json();
                formatData(stockData);
            } catch (error) {
                console.error('Error fetching stock data:', error);
            }
        };

        fetchData();
        const intervalId = setInterval(() => {
            fetchData();
        }, 12 * 60 * 60 * 1000); // 5 phút = 5 * 60 * 1000 ms

    }, [ticket]);

    const formatData = (stockData) => {
        const { df_day } = stockData;

        var formattedDataDay = [];
        // Combine train data into one array with corresponding labels
        df_day.forEach((item) => {
            const dateOnly = new Date(item.datetime).toISOString().split('T')[0]; // Chuyển datetime thành chuỗi YYYY-MM-DD
            formattedDataDay.push({ name: dateOnly, close: item.close, open: item.open, high: item.high, low: item.low });
        });

        setDataDay(formattedDataDay.slice(-50));
    };
    return (
        <Plot
            data={[
                {
                    x: dataDay.map(item => item.name),
                    open: dataDay.map(item => item.open),
                    high: dataDay.map(item => item.high),
                    low: dataDay.map(item => item.low),
                    close: dataDay.map(item => item.close),
                    type: 'candlestick',
                    xaxis: 'x',
                    yaxis: 'y'
                },
            ]}
            layout={{
                title: `Stock Price Movement Days ${ticket}`,
                xaxis: {
                    title: 'Date',
                    type: 'category',
                    tickmode: 'auto',   // Tự động phân phối nhãn trục x
                    nticks: 10
                },
                yaxis: {
                    title: 'Price (USD)'
                },
                width: 600,
                height: 500,
            }}
        />
    );
};

export default CandlestickChart1M;
