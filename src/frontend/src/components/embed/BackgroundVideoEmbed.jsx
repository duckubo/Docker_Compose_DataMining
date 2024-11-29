import React from 'react';
import './backgroundvideo.css'
const BackgroundVideoEmbed = () => {
    return (
        <div className="elementor-background-video-container elementor-hidden-phone" style={{ width: '100%', height: '100%' }}>
            <iframe
                className="elementor-background-video-embed"
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Market Loop Background Video - High Resolution"
                width="1920"
                height="1080"
                src="https://www.youtube.com/embed/ipUuoMCEbDQ?autoplay=1&mute=1&controls=0&loop=1&playlist=ipUuoMCEbDQ"
                id="widget2"
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            ></iframe>
        </div>
    );
};

export default BackgroundVideoEmbed;
