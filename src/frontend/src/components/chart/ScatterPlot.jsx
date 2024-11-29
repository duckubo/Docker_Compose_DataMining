import React from 'react';
import Plot from 'react-plotly.js';

const ScatterPlot = () => {
    // Dữ liệu cho Scatter Plot
    const data = [
        {
            x: [1, 2, 3, 4, 5, 6],  // Dữ liệu trục x
            y: [10, 11, 12, 13, 14, 15],  // Dữ liệu trục y
            mode: 'markers',  // Chế độ hiển thị là "markers" (nút scatter)
            type: 'scatter',  // Loại biểu đồ là "scatter"
            marker: { color: 'blue', size: 10 },  // Màu sắc và kích thước các điểm
            name: 'Sample Data'  // Tên cho dữ liệu
        }
    ];

    // Cấu hình layout cho scatter plot
    const layout = {
        title: 'Basic Scatter Plot',  // Tiêu đề của biểu đồ
        xaxis: {
            title: 'X Axis'  // Tiêu đề cho trục X
        },
        yaxis: {
            title: 'Y Axis'  // Tiêu đề cho trục Y
        }
    };

    return (
        <Plot
            data={data}
            layout={layout}
            style={{ width: '100%', height: '400px' }}  // Kích thước của biểu đồ
        />
    );
};

export default ScatterPlot;
