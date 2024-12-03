import React, { useEffect } from 'react';

const EmbedWidgetTickerTape = () => {
    useEffect(() => {
        // Chèn script vào DOM sau khi component render
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            symbols: [
                { description: 'AAPL', proName: 'NASDAQ:AAPL' },
                { description: 'GOOGL', proName: 'NASDAQ:GOOGL' },
                { description: 'AMZN', proName: 'NASDAQ:AMZN' },
                { description: 'HDFCBANK', proName: 'BSE:HDFCBANK' },
                { description: 'TATAMOTORS', proName: 'BSE:TATAMOTORS' },
                { description: 'ICICIBANK', proName: 'BSE:ICICIBANK' },
                { description: 'MSFT', proName: 'NASDAQ:MSFT' },
                { description: 'JPM', proName: 'NYSE:JPM' },
                { description: 'RELIANCE', proName: 'BSE:RELIANCE' },
                { description: 'FB', proName: 'NASDAQ:FB' },
                { description: 'TWTR', proName: 'NYSE:TWTR' },
                { description: '', proName: 'BSE:ZEEL' },
                { description: '', proName: 'BSE:NTPC' },
                { description: '', proName: 'BSE:COALINDIA' },
                { description: '', proName: 'BSE:YESBANK' },
                { description: '', proName: 'BSE:SBIN' },
                { description: '', proName: 'BSE:IDEA' },
                { description: '', proName: 'BSE:INDUSINDBK' },
            ],
            colorTheme: 'light',
            isTransparent: false,
            displayMode: 'adaptive',
            locale: 'in',
        });

        document.getElementsByClassName('tradingview-widget-container_tape')[0].appendChild(script);
    }, []);
    return (
        <div className="tradingview-widget-container_tape" >
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
};

export default EmbedWidgetTickerTape;
