import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const MonthlyVolumeChart = ({ ticket }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/monthly-volume?ticket=${ticket}`);
                if (response.ok) {
                    const data = await response.json();
                    setChartData(data);
                } else {
                    console.error('Error fetching data:', response.status);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchData();
    }, []);

    const colors = [
        'rgba(255, 99, 132, 0.7)',  // Đỏ nhạt
        'rgba(54, 162, 235, 0.7)', // Xanh dương nhạt
        'rgba(75, 192, 192, 0.7)', // Xanh ngọc
        'rgba(255, 206, 86, 0.7)', // Vàng nhạt
        'rgba(153, 102, 255, 0.7)' // Tím nhạt
    ];

    // Tách dữ liệu theo năm
    const groupedData = chartData.reduce((acc, item) => {
        const { year, month, volume } = item;
        if (!acc[year]) {
            acc[year] = { months: [], volumes: [] };
        }
        acc[year].months.push(month);
        acc[year].volumes.push(volume);
        return acc;
    }, {});

    // Tạo các trace cho từng năm
    const traces = Object.keys(groupedData).map((year, index) => ({
        x: groupedData[year].months,
        y: groupedData[year].volumes,
        type: 'bar',
        name: year,
        marker: {
            color: colors[index % colors.length]
        },
    }));

    return (
        <div>
            <h2>Monthly Trading Volume by Year</h2>
            <Plot
                data={traces}
                layout={{
                    title: 'Monthly Trading Volume by Year',
                    barmode: 'group', // Hiển thị các cột theo nhóm
                    xaxis: { title: 'Month' },
                    yaxis: { title: 'Total Volume' },
                    width: 600,
                    height: 400,
                }}
            />
        </div>
    );
};

export default MonthlyVolumeChart;
