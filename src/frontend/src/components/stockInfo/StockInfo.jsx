import React, { useState, useEffect } from 'react';

const StockInfo = ({ ticket }) => {
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Ticket:", ticket);
        const fetchData = async () => {
            try {
                setLoading(true); // Bắt đầu trạng thái loading
                const response = await fetch(`http://localhost:5000/api/stock-info?ticket=${ticket}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && Array.isArray(data.newest_data) && data.newest_data.length > 0) {
                        const newest = data.newest_data[0]; // Lấy phần tử đầu tiên của mảng
                        setStockData({
                            open: newest.open || "0.00",
                            high: newest.high || "0.00",
                            low: newest.low || "0.00",
                            close: newest.close || "0.00",
                            volume: newest.volume || "0",
                            datetime: newest.datetime || "N/A", // Sửa lỗi "dateime"
                        });
                    } else {
                        console.error("No data available in newest_data array.");
                    }
                } else {
                    console.error('Error fetching stock data:', response.status);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false); // Kết thúc trạng thái loading
            }
        };
        fetchData();
        const intervalId = setInterval(() => {
            fetchData();
        }, 5 * 60 * 1000); // 5 phút = 5 * 60 * 1000 ms

    }, [ticket]);

    if (loading) {
        return <p>Loading stock data...</p>; // Hiển thị loading nếu dữ liệu chưa sẵn sàng
    }
    console.log(stockData);

    return (
        <div className="stock-info" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['open', 'high', 'low', 'close', 'volume'].map((key, index) => {
                const colors = ['#007bff', '#ffc107', '#28a745', '#dc3545', '#6c757d'];
                return (
                    <div
                        key={key}
                        className="info-box"
                        style={{
                            backgroundColor: colors[index],
                            padding: '10px',
                            borderRadius: '5px',
                            flex: '1',
                        }}
                    >
                        <h2 style={{ color: '#fff', margin: 0 }}>{stockData[key]}</h2>
                        <p style={{ color: '#fff', margin: 0 }}>{key.toUpperCase()}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default StockInfo;
