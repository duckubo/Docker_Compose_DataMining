import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const RadarChartPlot = () => {
    const [seasonData, setSeasonData] = useState([]);

    // Lấy dữ liệu từ API
    useEffect(() => {
        axios.get('http://localhost:5000/api/get-season-counts')
            .then(response => {
                setSeasonData(response.data);
            })
            .catch(error => {
                console.error('Có lỗi khi lấy dữ liệu:', error);
            });
    }, []);

    // Tạo các trace cho mỗi năm
    const plotData = seasonData.map((yearData) => ({
        type: 'scatterpolar',
        r: [yearData.Winter, yearData.Spring, yearData.Summer, yearData.Fall], // Số ngày trong mùa
        theta: ['Winter', 'Spring', 'Summer', 'Fall'], // Các mùa
        fill: 'toself',
        name: `Year ${yearData.year}`, // Tên năm
    }));

    // Cấu hình layout chung cho các biểu đồ
    const layout = {
        polar: {
            radialaxis: {
                visible: true,
                range: [0, Math.max(...seasonData.flatMap(item => [item.Winter, item.Spring, item.Summer, item.Fall]))],
            },
        },
        showlegend: true,
        title: 'Số ngày trong từng mùa theo năm',
        width: 800,
        height: 600,
    };

    return (
        <div>
            <h2>Biểu đồ Spider Chart: Số ngày trong từng mùa theo năm</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {seasonData.map((yearData, index) => (
                <div key={index} style={{ marginBottom: '30px' }}>
                    <h3>{`Year ${yearData.year}`}</h3>
                    <Plot
                        data={[{
                            type: 'scatterpolar',
                            r: [yearData.Winter, yearData.Spring, yearData.Summer, yearData.Fall],
                            theta: ['Winter', 'Spring', 'Summer', 'Fall'],
                            fill: 'toself',
                            name: `Year ${yearData.year}`,
                        }]}
                        layout={{
                            polar: {
                                radialaxis: {
                                    visible: true,
                                    range: [0, Math.max(...seasonData.flatMap(item => [item.Winter, item.Spring, item.Summer, item.Fall]))],
                                },
                            },
                            showlegend: true,
                            title: `Số ngày trong từng mùa theo năm ${yearData.year}`,
                            width: 600,
                            height: 400,
                        }}
                    />
                </div>
            ))}
            </div>
        </div>
    );
};

export default RadarChartPlot;
