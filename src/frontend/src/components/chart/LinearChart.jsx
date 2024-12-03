import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const LinearChart = ({ ticket, color1, color2 }) => {
    const [actualData, setActualData] = useState([]);
    const [predictedData, setPredictedData] = useState([]);
    const [selectedPrediction, setSelectedPrediction] = useState({});

    const formatData = (stockData) => {
        // Giả sử stockData là mảng chứa các đối tượng có `Actual`, `Predicted`
        const formattedActual = stockData.map(item => item.Actual);
        const formattedPredicted = stockData.map(item => item.Predicted);

        setActualData(formattedActual);  // Cập nhật dữ liệu thực tế
        setPredictedData(formattedPredicted);  // Cập nhật dữ liệu dự đoán
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/get-linear-data?ticket=${ticket}`);
                const stockData = await response.json();
                if (stockData) {
                    formatData(stockData); // Gọi hàm formatData
                } else {
                    console.error('Dữ liệu không hợp lệ hoặc không có dữ liệu');
                }
            } catch (error) {
                console.error('Error fetching stock data:', error);
            }
        };


        const fetchData2 = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/prediction-lr');
                const pred = await response.json();
                if (pred) {
                    const selected = pred.find((p) => p.Code === ticket) || {};
                    setSelectedPrediction(selected);
                } else {
                    console.error('Dữ liệu không hợp lệ hoặc không có dữ liệu');
                }
            } catch (error) {
                console.error('Error fetching stock data:', error);
            }
        };

        fetchData();
        fetchData2();
    }, [ticket]);

    console.log(selectedPrediction);


    // Chỉ số (index) sẽ được sử dụng làm trục x
    const index = [...Array(actualData.length).keys()]; // Tạo mảng các chỉ số index

    return (
        <div>
            {/* Biểu đồ Giới thiệu ARIMA */}
            <Plot
                data={[
                    {
                        x: index, // Dữ liệu trục x (Chỉ số)
                        y: actualData, // Dữ liệu trục y (Giá trị thực tế)
                        type: 'scatter', // Kiểu biểu đồ (line chart)
                        mode: 'lines', // Vẽ đường
                        name: 'Giá trị Thực tế', // Tên biểu đồ
                        line: { color: 'green' }, // Màu đường thực tế
                    },
                    {
                        x: index, // Dữ liệu trục x (Chỉ số)
                        y: predictedData, // Dữ liệu trục y (Giá trị dự đoán)
                        type: 'scatter', // Kiểu biểu đồ (line chart)
                        mode: 'lines', // Vẽ đường
                        name: 'Giá trị Dự đoán', // Tên biểu đồ
                        line: { color: 'red' }, // Màu đường dự đoán
                    }
                ]}
                layout={{
                    title: 'So sánh Giá trị Thực tế và Dự đoán Linear Regression', // Tiêu đề biểu đồ
                    xaxis: { title: 'Index' }, // Tiêu đề trục x
                    yaxis: { title: 'Giá trị' }, // Tiêu đề trục y
                    width: 500, // Chiều rộng biểu đồ
                    height: 400, // Chiều cao biểu đồ
                }}
            />
            <div className="pred_box" style={{ marginBottom: "50px" }}>
                <div className="col-md-4" style={{ backgroundColor: color1, textAlign: "right", padding: ' 30px 40px' }}>
                    <div className="card p-20">
                        <div className="media widget-ten">
                            <div className="media-left meida media-middle">
                                <span><i className="ti-vector f-s-40"></i></span>
                            </div>
                            <div className="media-body media-text-right">
                                <h2 className="color-white text-white">
                                    {selectedPrediction && selectedPrediction.Prediction !== undefined
                                        ? selectedPrediction.Prediction.toFixed(2)
                                        : ""}
                                </h2>
                                <p className="m-b-0 text-white">TOMORROW'S ${ticket} CLOSING PRICE BY LINEAR REGRESSION</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4" style={{ backgroundColor: color2, textAlign: "right", padding: ' 30px 40px' }}>
                    <div className="card p-20">
                        <div className="media widget-ten">
                            <div className="media-left meida media-middle">
                                <span><i className="ti-vector f-s-40"></i></span>
                            </div>
                            <div className="media-body media-text-right">
                                <h2 className="color-white text-white">
                                    {selectedPrediction && selectedPrediction.RMSE !== undefined
                                        ? selectedPrediction.RMSE.toFixed(2)
                                        : ""}
                                </h2>
                                <p className="m-b-0 text-white">LINEAR REGRESSION RMSE</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinearChart;
