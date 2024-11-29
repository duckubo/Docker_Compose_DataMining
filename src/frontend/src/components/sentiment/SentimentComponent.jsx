import React, { useEffect, useState } from 'react';
import SentimentChart from './SentimentChart';
import TweetBox from '../twitter/TweetBox';
import fore from '../../assets/images/fore.png';

// Sample data to replace `tw_list` and `forecast_set`
// Replace these with actual data from props or API calls

function SentimentAnalysisCard({ ticket, onValueChange }) {
    return (
        <div className="col-lg-6">
            <div className="card">
                <div className="card-title" >
                    <h4>SENTIMENT ANALYSIS FOR {ticket} TWEETS</h4>
                </div>
                <div className="sales-chart" >
                    <SentimentChart ticket={ticket} onValueChange={onValueChange} />
                </div>
            </div>
        </div>
    );
}

function PredictedPriceCard({ ticket, getForecastData }) {
    const [forecastData, setForecastData] = useState([]);

    useEffect(() => {
        const fetchForecastData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/get-forecast?ticket=${ticket}`);
                const data = await response.json();
                setForecastData(data);
                getForecastData(data);
            } catch (error) {
                console.error("Error fetching forecast data:", error);
            }
        };

        if (ticket) {
            fetchForecastData();
        }

    }, [ticket]); // Only fetch if `ticket` changes

    if (forecastData.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className="col-lg-6">
            <div className="card">
                <div className="card-title">
                    <h4>PREDICTED {ticket} PRICE FOR THE NEXT 7 DAYS</h4>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table" style={{ marginTop: '30px' }}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th style={{ width: '200px', textAlign: 'center' }}>Close</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div>
                                            <a href={`https://finance.yahoo.com/quote/${ticket}`}>
                                                <img
                                                    style={{ padding: '0px', width: '70px', height: '150px' }}
                                                    src={fore} // Ensure the image URL is valid
                                                    alt="Forecast For 7 Days"
                                                />
                                            </a>
                                        </div>
                                    </td>
                                    <td style={{ width: '200px', textAlign: 'center' }}>
                                        {forecastData.map((item, index) => (
                                            <div key={index}>
                                                {parseFloat(item['Forecasted Value']).toFixed(2)} $
                                                <br />
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PolarityAndRecommendation = ({ polarity, today_stock, ticket }) => {
    const [idea, setIdea] = useState('');
    const [decision, setDecision] = useState('');
    const [overall, setOverall] = useState('');

    useEffect(() => {
        if (today_stock && today_stock.length > 0) {
            const sum = today_stock.reduce((acc, currentValue) => acc + currentValue["Forecasted Value"], 0);
            const mean = sum / today_stock.length;

            if (today_stock[today_stock.length - 1]["Forecasted Value"] < mean) {
                if (polarity > 0) {
                    setIdea("RISE");
                    setDecision("BUY");
                    setOverall("Positive");
                } else {
                    setIdea("FALL");
                    setDecision("SELL");
                    setOverall("Negative");

                }
            } else {
                setIdea("FALL");
                setDecision("SELL");
                setOverall("Negative");
            }
        } else {
            console.log("No stock data available for today.");
        }
    }, [polarity, today_stock, ticket, idea, decision]);

    return (
        <div className="overall_popularity" style={{ display: 'flex', gap: '30px' }}>
            {/* OVERALL POLARITY */}
            <div className="col-md-4" style={{ backgroundColor: 'rgb(46, 204, 113) ', padding: '20px', width: '30%' }}>
                <div className="card bg-success p-20">
                    <div className="media widget-ten">
                        <div className="media-left meida media-middle">
                            <span>
                                <i className="ti-location-pin f-s-40"></i>
                            </span>
                        </div>
                        <div className="media-body media-text-right" style={{ textAlign: 'right' }}>
                            <h3 className="color-white text-white">Overall <span style={{ color: "yellow" }}>{overall}</span></h3>
                            <p className="m-b-0 text-white">Overall tweets polarity</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-lg-8" style={{ backgroundColor: '#3498db ', padding: '20px' }}>
                <div className="card bg-primary p-20">
                    <div className="media widget-ten">
                        <div className="media-left meida media-middle">
                            <span>
                                <i className="ti-comment f-s-40"></i>
                            </span>
                        </div>
                        <div className="media-body media-text-right" style={{ textAlign: 'right' }}>
                            <h3 className="color-white text-white" style={{ textAlign: 'left' }}>
                                According to the ML Predictions & Sentiment Analysis of the Tweets, a {idea} in {ticket} stock is expected ={'>'}
                                <span style={{ color: decision === 'BUY' ? '#57e357' : '#ce5353' }}>
                                    {decision}
                                </span>
                            </h3>
                            <p className="m-b-0 text-white" style={{ color: "#fff" }}>RECOMMENDATION</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function SentimentComponent({ ticket }) {
    const [valueFromChild, setValueFromChild] = useState(0);  // Parent state
    const [forecastData, setForecastData] = useState([]);

    const handleValueChange = (newValue) => {
        setValueFromChild(newValue);
    };

    const getForecastData = (forecastData) => {
        setForecastData(forecastData);
    };

    return (
        <div className="" style={{ width: '100%', paddingBottom: '30px', margin: 'auto' }}>
            <TweetBox ticket={ticket} />
            <div style={{ display: 'flex' }}>
                <SentimentAnalysisCard ticket={ticket} onValueChange={handleValueChange} />
                <PredictedPriceCard ticket={ticket} getForecastData={getForecastData} />
            </div>
            <PolarityAndRecommendation polarity={valueFromChild} today_stock={forecastData} ticket={ticket} />
        </div>
    );
}

export default SentimentComponent;
