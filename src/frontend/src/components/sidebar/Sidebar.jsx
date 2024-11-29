import './sidebar.css';
import {
  LineStyle,
  PermIdentity,
  PlayCircleOutline,  
  List,
} from '@material-ui/icons';
import HomeWorkIcon from '@material-ui/icons/HomeWork';
import AssessmentIcon from '@material-ui/icons/Assessment';
import DashboardIcon from '@material-ui/icons/Dashboard';
import GraphicEqIcon from '@material-ui/icons/GraphicEq';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import RepeatIcon from '@material-ui/icons/Repeat';
import PhoneInTalkIcon from '@material-ui/icons/PhoneInTalk';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar() {
  // State to track the active item
  const [activeItem, setActiveItem] = useState('/');

  // Function to handle click and set the active item
  const handleClick = (path) => {
    setActiveItem(path);
  };

  return (
    <div className='sidebar'>
      <div className='sidebarWrapper'>
        <div className='sidebarMenu'>
          <h3 className='sidebarTitle'>Dashboard</h3>
          <ul className='sidebarList'>
            <Link to='/' className='link' onClick={() => handleClick('/')}>
              <li className={`sidebarListItem ${activeItem === '/' ? 'active' : ''}`}>
                <HomeWorkIcon className='sidebarIcon' />
                Home
              </li>
            </Link>
          </ul>
        </div>
        <div className='sidebarMenu'>
          <h3 className='sidebarTitle'>Quick Menu</h3>
          <ul className='sidebarList'>
            <Link to='/dashboard' className='link' onClick={() => handleClick('/dashboard')}>
              <li className={`sidebarListItem ${activeItem === '/dashboard' ? 'active' : ''}`}>
                <DashboardIcon className='sidebarIcon' />
                DASHBOARD
              </li>
            </Link>
            <Link to='/form' className='link' onClick={() => handleClick('/form')}>
              <li className={`sidebarListItem ${activeItem === '/form' ? 'active' : ''}`}>
                <FindInPageIcon className='sidebarIcon' />
                PREDICT THE FUTURE
              </li>
            </Link>
            <Link to='/statistics' className='link' onClick={() => handleClick('/statistics')}>
              <li className={`sidebarListItem ${activeItem === '/statistics' ? 'active' : ''}`}>
                <AssessmentIcon className='sidebarIcon' />
                STATISTICS
              </li>
            </Link>
            <Link to='/analyst' className='link' onClick={() => handleClick('/analyst')}>
              <li className={`sidebarListItem ${activeItem === '/analyst' ? 'active' : ''}`}>
                <GraphicEqIcon className='sidebarIcon' />
                ANALYST
              </li>
            </Link>
            <Link to='/about' className='link' onClick={() => handleClick('/about')}>
              <li className={`sidebarListItem ${activeItem === '/about' ? 'active' : ''}`}>
                <List className='sidebarIcon' />
                ABOUT
              </li>
            </Link>
            <Link to='/currency' className='link' onClick={() => handleClick('/currency')}>
              <li className={`sidebarListItem ${activeItem === '/currency' ? 'active' : ''}`}>
                <RepeatIcon className='sidebarIcon' />
                CURRENCY CONVERTER
              </li>
            </Link>
            <Link to='/contact' className='link' onClick={() => handleClick('/contact')}>
              <li className={`sidebarListItem ${activeItem === '/contact' ? 'active' : ''}`}>
                <PhoneInTalkIcon className='sidebarIcon' />
                CONTACT US
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
}
