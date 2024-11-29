import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const Trend = ({ ticket }) => {
    const [dates, setDates] = useState([]); // Khởi tạo là mảng rỗng
    const [prices, setPrices] = useState([]); // Khởi tạo là mảng rỗng

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/get-trend-data?ticket=${ticket}`);
                const stockData = await response.json();
                if (stockData) {
                    formatData(stockData);  // Truyền trực tiếp stockData vào
                } else {
                    console.error('Dữ liệu không hợp lệ hoặc không có dữ liệu');
                }
            } catch (error) {
                console.error('Error fetching stock data:', error);
            }
        };

        fetchData();
    }, [ticket]);

    const formatData = (stockData) => {
        // Nếu stockData là một mảng các đối tượng, ta có thể sử dụng map để xử lý
        const formattedDates = stockData.map(item => new Date(item.Date).toISOString().split('T')[0]);
        const formattedPrices = stockData.map(item => item.Price);

        setDates(formattedDates); // Cập nhật state dates
        setPrices(formattedPrices); // Cập nhật state prices
    };

    return (
        <div>
            {/* Biểu đồ Giá Đóng Cửa */}
            <Plot
                data={[
                    {
                        x: dates, // Dữ liệu trục x
                        y: prices, // Dữ liệu trục y
                        type: 'scatter', // Kiểu biểu đồ (line chart)
                        mode: 'lines', // Vẽ đường
                        name: 'Giá Đóng Cửa', // Tên biểu đồ
                        line: { color: 'red' }, // Màu đường
                    }
                ]}
                layout={{
                    title: `Giá Đóng Cửa của Cổ Phiếu ${ticket}`, // Tiêu đề biểu đồ
                    xaxis: { title: 'Ngày' }, // Tiêu đề trục x
                    yaxis: { title: 'Giá Đóng Cửa' }, // Tiêu đề trục y
                    width: 800, // Chiều rộng biểu đồ
                    height: 400, // Chiều cao biểu đồ
                }}
            />
        </div>
    );
};

export default Trend;
