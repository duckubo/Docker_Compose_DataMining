import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const SpiderChart = () => {
    const [seasonData, setSeasonData] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/get-season-counts')  // API trả về season_counts
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
        r: [yearData.Winter, yearData.Spring, yearData.Summer, yearData.Fall],  // Số ngày trong mùa
        theta: ['Winter', 'Spring', 'Summer', 'Fall'],  // Các mùa
        fill: 'toself',
        name: `Year ${yearData.year}`,  // Tên năm
    }));

    return (
        <div>
            <h2>Biểu đồ Spider Chart: Số ngày trong từng mùa theo năm</h2>
            <Plot
                data={plotData}
                layout={{
                    title: 'Số ngày trong từng mùa theo năm',
                    polar: {
                        radialaxis: {
                            visible: true,
                            range: [0, Math.max(...seasonData.flatMap(item => [item.Winter, item.Spring, item.Summer, item.Fall]))],
                        },
                    },
                    showlegend: true,
                    width: 800,
                    height: 600,
                }}
            />
        </div>
    );
};

export default SpiderChart;
