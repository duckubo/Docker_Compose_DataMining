import React, { useEffect, useState } from 'react';

const EmbedWidgetTickerTape = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            height: "600",
            symbolsGroups: [
                {
                    name: "Indices",
                    originalName: "Indices",
                    symbols: [
                        { name: "NASDAQ:AAPL" },
                        { name: "NASDAQ:GOOGL" },
                        { name: "NASDAQ:AMZN" },
                        { name: "BSE:HDFCBANK" },
                        { name: "BSE:TATAMOTORS" },
                        { name: "BSE:ICICIBANK" },
                        { name: "NASDAQ:MSFT" },
                        { name: "NYSE:JPM" },
                        { name: "NASDAQ:FB" },
                        { name: "NYSE:TWTR" },
                        { name: "BSE:ZEEL" },
                        { name: "BSE:NTPC" },
                        { name: "BSE:COALINDIA" },
                        { name: "BSE:YESBANK" },
                        { name: "BSE:IDEA" },
                        { name: "BSE:SBIN" },
                        { name: "BSE:INDUSINDBK" },
                    ],
                },
            ],
            colorTheme: "dark",
            isTransparent: false,
            locale: "in",
        });

        document.getElementsByClassName('tradingview-widget-container_quote')[0].appendChild(script);
    }, []);
    return (
        <div className="tradingview-widget-container_quote" style={{ width: '80%' }}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    )
};
export default EmbedWidgetTickerTape;
