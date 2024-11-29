import React from 'react';
import Plot from 'react-plotly.js';

const BarChartPlot = () => {
    return (
        <Plot
            data={[
                {
                    x: ['January', 'February', 'March', 'April', 'May'],  // Nhãn trục X
                    y: [20, 14, 23, 25, 22],                              // Giá trị trục Y
                    type: 'bar',                                          // Kiểu biểu đồ
                    marker: { color: 'orange' },                          // Màu sắc cột
                },
            ]}
            layout={{
                title: 'Monthly Sales',              // Tiêu đề biểu đồ
                xaxis: { title: 'Month' },           // Nhãn trục X
                yaxis: { title: 'Sales (units)' },   // Nhãn trục Y
                width: 800,
                height: 500,
            }}
        />
    );
};

export default BarChartPlot;
