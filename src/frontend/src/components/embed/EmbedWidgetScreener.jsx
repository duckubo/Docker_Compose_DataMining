import React, { useEffect, useState } from 'react';

const EmbedWidgetScreener = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            height: "600",
            defaultColumn: "overview",
            defaultScreen: "most_capitalized",
            market: "india",
            showToolbar: true,
            colorTheme: "dark",
            locale: "in"
        });

        document.getElementsByClassName('tradingview-widget-container_screener')[0].appendChild(script);
    }, []);

    return (
        <div className="tradingview-widget-container_screener" style={{ width: '100%' }}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
};

export default EmbedWidgetScreener;
