import React, { useState, useEffect } from 'react';
import LineChart from '../../components/chart/LineChart';
import StockInfo from '../../components/stockInfo/StockInfo';
import SentimentComponent from '../../components/sentiment/SentimentComponent';
import Trend from '../../components/chart/Trend';
import ArimaChart from '../../components/chart/ArimaChart';
import LSTMChart from '../../components/chart/LSTMChart';
import LinearChart from '../../components/chart/LinearChart';
import './predict.css';
import { useParams } from 'react-router-dom';
function Predict() {
    const { ticket } = useParams();

    return (
        <div className="stock">
            <header className="header">
                <h1>Today's {ticket} Stock Data</h1>
            </header>
            <StockInfo ticket={ticket} />
            <div className="chart-section">
                <div className="chart-box">
                    <div className="card-title">
                        <h4>RECENT TRENDS IN {ticket} STOCK PRICES</h4>
                    </div>
                    <Trend ticket={ticket} />
                </div>
                <div className="chart-box">
                    <div className="card-title">
                        <h4>ARIMA MODEL ACCURACY</h4>
                    </div>
                    <ArimaChart ticket={ticket} />
                </div>
                <div className="chart-box">
                    <div className="card-title">
                        <h4>LSTM MODEL ACCURACY</h4>
                    </div>
                    <LSTMChart ticket={ticket} />
                </div>
                <div className="chart-box">
                    <div className="card-title">
                        <h4>LINEAR REGRESSION MODEL ACCURACY</h4>
                    </div>
                    <LinearChart ticket={ticket} />
                </div>
            </div>
            <div className="pred_box" style={{ marginBottom: "50px" }}>
                {[
                    { bgColor: '#2ecc71', title: `TOMORROW'S ${ticket} CLOSING PRICE BY ARIMA`, value: 220 },
                    { bgColor: '#f1c40f', title: `TOMORROW'S ${ticket} CLOSING PRICE BY LSTM`, value: 236 },
                    { bgColor: '#e74c3c', title: `TOMORROW'S ${ticket} CLOSING PRICE BY LINEAR REGRESSION`, value: 234 },
                    { bgColor: '#3498db', title: "ARIMA RMSE", value: 3 },
                    { bgColor: '#3498db', title: "LSTM RMSE", value: 2 },
                    { bgColor: '#3498db', title: "LINEAR REGRESSION RMSE", value: 3 }
                ].map((card, index) => (
                    <div key={index} className="col-md-4" style={{ backgroundColor: card.bgColor, textAlign: "right", padding: ' 30px 40px' }}>
                        <div className="card p-20">
                            <div className="media widget-ten">
                                <div className="media-left meida media-middle">
                                    <span><i className="ti-vector f-s-40"></i></span>
                                </div>
                                <div className="media-body media-text-right">
                                    <h2 className="color-white text-white">{card.value}</h2>
                                    <p className="m-b-0 text-white">{card.title}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div>
                <SentimentComponent quote={ticket} />
            </div>
        </div>
    );
}

export default Predict;
