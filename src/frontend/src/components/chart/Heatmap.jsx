import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

// Dữ liệu tương quan giả lập cho 4 mã cổ phiếu


// Nhãn cho các mã cổ phiếu


const Heatmap = ({ ticket }) => {
    const [correlationData, setCorrelationData] = useState([]);
    const [features, setFeature] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/get-correlation_matrix-data?ticket=${ticket}`);
                const heatmap = await response.json();
                formatData(heatmap);
            } catch (error) {
                console.error('Error fetching stock data:', error);
            }
        };
        fetchData();

    }, [ticket]);

    const formatData = (heatmap) => {

        let formattedData = [];

        // Combine train data into one array with corresponding labels
        heatmap.forEach((item) => {
            formattedData.push({
                'Open-High': item['Open-High'],
                'Open-Low': item['Open-Low'], // Đảm bảo sử dụng dấu gạch ngang chính xác
                'Close-High': item['Close-High'], // Sửa tên key cho đúng
                'Close-Low': item['Close-Low'],
                'High-Low': item['High-Low'],
                'Open-Close': item['Open-Close'] // Đảm bảo sử dụng key đúng tên
            });

        });

        const features = Object.keys(heatmap[0]).filter(key => key);
        setFeature(features)

        const correlationData = formattedData.map(obj => Object.values(obj));
        setCorrelationData(correlationData);

    };


    return (
        <Plot
            data={[
                {
                    z: correlationData,
                    x: features,
                    y: features,
                    type: 'heatmap',
                    colorscale: 'Plasma', // Thay đổi màu sắc nếu cần
                    colorbar: {
                        title: 'Tương quan',
                    },
                },
            ]}
            layout={{
                title: `Heatmap to visualize the correlation among different <br> Daily price columns for ${ticket} stocks`,
                xaxis: {
                    title: '',
                },
                yaxis: {
                    title: '',
                },
                width: 500,
                height: 400,
            }}
        />
    );
};

export default Heatmap;
