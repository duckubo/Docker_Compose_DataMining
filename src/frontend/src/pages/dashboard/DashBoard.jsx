import './dashboard.css';
import React, { useState, useEffect } from 'react';
import CandlestickChart1D from '../../components/chart/CandlestickChart1D';
import CandlestickChart1H from '../../components/chart/CandlestickChart1H';
import CandlestickChart1M from '../../components/chart/CandlestickChart1M';
import Heatmap from '../../components/chart/Heatmap';
import TrendSeasonalChart from '../../components/chart/TrendSeasonalChart';
import EmbedWidgetTickerTape from '../../components/embed/EmbedWidgetTickerTape';
import EmbedWidgetMarketOverviewMini from '../../components/embed/EmbedWidgetMarketOverviewMini';
import StockInfo from '../../components/stockInfo/StockInfo';
import ArimaChart from '../../components/chart/ArimaChart';
import LSTMChart from '../../components/chart/LSTMChart';
import LinearChart from '../../components/chart/LinearChart';
import SentimentComponent from '../../components/sentiment/SentimentComponent';
import RadarChartPlot2 from '../../components/chart/RadarChartPlot2';
import ClusterChart2 from '../../components/chart/ClusterChart2';
import SpiderChart2 from '../../components/chart/SpiderChart2';
import MonthlyVolumeChart from '../../components/chart/MonthlyVolumeChart';
export default function DashBoard() {


    return (
        <div className='dashboard'>
            <EmbedWidgetTickerTape />
            <EmbedWidgetMarketOverviewMini ticket='AAPL' />
            <EmbedWidgetMarketOverviewMini ticket='GOOG' />
            <EmbedWidgetMarketOverviewMini ticket='AMZN' />
            <div className='divide'>
                <div className='appl'>
                    <StockInfo ticket={"AAPL"} />
                    <CandlestickChart1M ticket='AAPL' />
                    <CandlestickChart1H ticket='AAPL' />
                    <CandlestickChart1D ticket='AAPL' />
                    <TrendSeasonalChart ticket='AAPL' />
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>CORRELATION MAP APPLE</h4>
                        </div>
                        <Heatmap ticket={"AAPL"} />
                    </div>
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>ARIMA MODEL ACCURACY APPLE</h4>
                        </div>
                        <ArimaChart ticket={"AAPL"} color1={"#2ecc71"} color2={'#3498db'} />
                    </div>
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>LSTM MODEL ACCURACY AAPL</h4>
                        </div>
                        <LSTMChart ticket={"AAPL"} color1={"#2ecc71"} color2={'#3498db'} />
                    </div>
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>LINEAR REGRESSION MODEL ACCURACY AAPL</h4>
                        </div>
                        <LinearChart ticket={"AAPL"} color1={"#2ecc71"} color2={'#3498db'} />
                    </div>
                    <div>
                        <SentimentComponent ticket={"AAPL"} />
                    </div>
                    <div>
                        <MonthlyVolumeChart ticket={"AAPL"} />
                    </div>
                    <div className='statistics'>
                        <div >
                            <ClusterChart2 ticket={"AAPL"} />
                            <SpiderChart2 ticket={"AAPL"} />
                        </div>
                        <RadarChartPlot2 ticket={"AAPL"} />
                    </div>
                </div>
                <div className="goog" >
                    <StockInfo ticket='GOOG' />
                    <CandlestickChart1M ticket='GOOG' />
                    <CandlestickChart1H ticket='GOOG' />
                    <CandlestickChart1D ticket='GOOG' />
                    <TrendSeasonalChart ticket='GOOG' />
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>CORRELATION MAP GOOGLE</h4>
                        </div>
                        <Heatmap ticket={"GOOG"} />
                    </div>
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>ARIMA MODEL ACCURACY GOOGLE</h4>
                        </div>
                        <ArimaChart ticket={"GOOG"} color1={"#f1c40f"} color2={'#3498db'} />
                    </div>
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>LSTM MODEL ACCURACY GOOG</h4>
                        </div>
                        <LSTMChart ticket={"GOOG"} color1={"#f1c40f"} color2={'#3498db'} />
                    </div>
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>LINEAR REGRESSION MODEL ACCURACY GOOG</h4>
                        </div>
                        <LinearChart ticket={"GOOG"} color1={"#f1c40f"} color2={'#3498db'} />
                    </div>
                    <div>
                        <SentimentComponent ticket={"GOOG"} />
                    </div>
                    <div>
                        <MonthlyVolumeChart ticket={"GOOG"} />
                    </div>
                    <div className='statistics'>
                        <div >
                            <ClusterChart2 ticket={"GOOG"} />
                            <SpiderChart2 ticket={"GOOG"} />
                        </div>
                        <RadarChartPlot2 ticket={"GOOG"} />
                    </div>

                </div>
                <div className="amzn">
                    <StockInfo ticket='AMZN' />
                    <CandlestickChart1M ticket='AMZN' />
                    <CandlestickChart1H ticket='AMZN' />
                    <CandlestickChart1D ticket='AMZN' />
                    <TrendSeasonalChart ticket='AMZN' />
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>CORRELATION MAP AMAZON</h4>
                        </div>
                        <Heatmap ticket={"AMZN"} />
                    </div>
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>ARIMA MODEL ACCURACY AMZN</h4>
                        </div>
                        <ArimaChart ticket={"AMZN"} color1={"#e74c3c"} color2={'#3498db'} />
                    </div>
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>LSTM MODEL ACCURACY AMZN</h4>
                        </div>
                        <LSTMChart ticket={"AMZN"} color1={"#e74c3c"} color2={'#3498db'} />
                    </div>
                    <div className="chart-box">
                        <div className="card-title">
                            <h4>LINEAR REGRESSION MODEL ACCURACY AMZN</h4>
                        </div>
                        <LinearChart ticket={"AMZN"} color1={"#e74c3c"} color2={'#3498db'} />
                    </div>
                    <div>
                        <SentimentComponent ticket={"AMZN"} />
                    </div>
                    <div>
                        <MonthlyVolumeChart ticket={"AMZN"} />
                    </div>
                    <div className='statistics'>
                        <div >
                            <ClusterChart2 ticket={"AMZN"} />
                            <SpiderChart2 ticket={"AMZN"} />
                        </div>
                        <RadarChartPlot2 ticket={"AMZN"} />
                    </div>
                </div>
            </div>

        </div >
    );
}
