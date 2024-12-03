import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const TrendSeasonalChart = ({ ticket }) => {
    const [prices, setPricesData] = useState([]);
    const [trend, setTrendData] = useState([]);
    const [seasonal, setSeasonalData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/get-close-data?ticket=${ticket}`);
                const prices = await response.json();
                formatData(prices);
            } catch (error) {
                console.error('Error fetching stock data:', error);
            }
        };

        fetchData();
    }, [ticket]);
    useEffect(() => {
        const fetchData2 = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/get-trend-data?ticket=${ticket}`);
                const trend = await response.json();
                formatData2(trend);
            } catch (error) {
                console.error('Error fetching stock data:', error);
            }
        };

        fetchData2();
    }, [ticket]);
    useEffect(() => {
        const fetchData3 = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/get-seasonal-data?ticket=${ticket}`);
                const seasonal = await response.json();
                formatData3(seasonal);
            } catch (error) {
                console.error('Error fetching stock data:', error);
            }
        };

        fetchData3();
    }, [ticket]);
    const formatData = (prices) => {

        const formattedPrices = prices.map(item => ({
            date: new Date(item.Date).toISOString().split('T')[0],
            close: item.Price
        })).slice(-365);

        setPricesData(formattedPrices);
    }
    const formatData2 = (trend) => {


        const formattedTrend = trend.map((item, index) => ({
            date: new Date(item.datetime), // Sử dụng cùng ngày với giá đóng cửa
            value: item.trend
        })).slice(-365);

        setTrendData(formattedTrend);
    }
    const formatData3 = (seasonal) => {


        const formattedSeasonal = seasonal.map((item, index) => ({
            date: new Date(item.datetime),
            value: item.seasonal
        })).slice(-365);

        setSeasonalData(formattedSeasonal);
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Biểu đồ Giá Đóng Cửa */}
            <Plot
                data={[
                    {
                        x: prices.map(item => item.date),
                        y: prices.map(item => item.close),
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Giá Đóng Cửa',
                        line: { color: 'blue' },
                    }
                ]}
                layout={{
                    title: `Giá Đóng Cửa của Cổ Phiếu ${ticket}`,
                    xaxis: { title: 'Ngày' },
                    yaxis: { title: 'Giá Đóng Cửa' },
                    width: 600,
                    height: 500,
                }}
            />

            {/* Biểu đồ Xu Hướng */}
            <Plot
                data={[
                    {
                        x: trend.map(item => item.date),
                        y: trend.map(item => item.value),
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Xu Hướng',
                        line: { color: 'orange' },
                    }
                ]}
                layout={{
                    title: `Xu Hướng của Cổ Phiếu ${ticket}`,
                    xaxis: {
                        title: 'Ngày',
                        tickmode: 'auto',   // Tự động phân phối nhãn trục x
                        nticks: 10
                    },
                    yaxis: { title: 'Giá Xu Hướng' },
                    width: 600,
                    height: 500,
                }}
            />

            {/* Biểu đồ Mùa Vụ */}
            <Plot
                data={[
                    {
                        x: seasonal.map(item => item.date),
                        y: seasonal.map(item => item.value),
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Mùa Vụ',
                        line: { color: 'green' },
                    }
                ]}
                layout={{
                    title: `Mùa Vụ của Cổ Phiếu ${ticket}`,
                    xaxis: { title: 'Ngày' },
                    yaxis: { title: 'Giá Mùa Vụ' },
                    width: 600,
                    height: 500,
                }}
            />
        </div>
    );
};

export default TrendSeasonalChart;
