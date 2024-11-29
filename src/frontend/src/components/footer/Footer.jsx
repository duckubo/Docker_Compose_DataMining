import React from 'react';
import footerImage from '../../assets/images/logo-2.png';
const Footer = () => {
    return (
        <div className="footer-section-area padding-top-bottom">
            <div className="container" style={{ backgroundColor: '#1f2b31' }}>
                <div className="row" style={{ display: 'flex' }}>
                    <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12" style={{ width: '40%' }}>
                        <img src={footerImage} alt="Logo" />

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
