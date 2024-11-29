import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const CandlestickChart1H = ({ ticket }) => {
    const [dataWeek, setDataWeek] = useState([]);
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
    }, [ticket]);

    const formatData = (stockData) => {
        const { df_week } = stockData;

        var formattedDataWeek = [];
        // Combine train data into one array with corresponding labels
        df_week.forEach((item) => {
            const dateOnly = new Date(item.datetime).toISOString().split('T')[0]; // Chuyển datetime thành chuỗi YYYY-MM-DD
            formattedDataWeek.push({ name: dateOnly, close: item.close, open: item.open, high: item.high, low: item.low });
        });

        setDataWeek(formattedDataWeek.slice(-50));
    };
    return (
        <Plot
            data={[
                {
                    x: dataWeek.map(item => item.name),
                    open: dataWeek.map(item => item.open),
                    high: dataWeek.map(item => item.high),
                    low: dataWeek.map(item => item.low),
                    close: dataWeek.map(item => item.close),
                    type: 'candlestick',
                    xaxis: 'x',
                    yaxis: 'y'
                },
            ]}
            layout={{
                title: `Stock Price Movement Weeks ${ticket}`,
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

export default CandlestickChart1H;
