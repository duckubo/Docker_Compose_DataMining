import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const CandlestickChart1D = ({ ticket }) => {
    const [dataMonth, setDataMonth] = useState([]);
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
        const { df_month } = stockData;

        var formattedDataMonth = [];
        df_month.forEach((item) => {
            const dateOnly = new Date(item.datetime).toISOString().split('T')[0]; // Chuyển datetime thành chuỗi YYYY-MM-DD
            formattedDataMonth.push({ name: dateOnly, close: item.close, open: item.open, high: item.high, low: item.low });
        });
        setDataMonth(formattedDataMonth);
        // Giới hạn 30 phần tử cuối cùng
    };
    return (
        <Plot
            data={[
                {
                    x: dataMonth.map(item => item.name),
                    open: dataMonth.map(item => item.open),
                    high: dataMonth.map(item => item.high),
                    low: dataMonth.map(item => item.low),
                    close: dataMonth.map(item => item.close),
                    type: 'candlestick',
                    xaxis: 'x',
                    yaxis: 'y'
                },
            ]}
            layout={{
                title: `Stock Price Movement Months ${ticket}`,
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

export default CandlestickChart1D;
