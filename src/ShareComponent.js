import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  EmailShareButton,
  EmailIcon,
  SMSShareButton
} from 'react-share';
import SVGContainer from './SVGContainer.js';
import SMSIcon from './SMSIcon.js';
import MetaTags from './MetaTags.js';


function ShareComponent(key) {
  const [shareUrl, setShareUrl] = useState('https://bitemodel.com/');
  const title = 'Get your Bite Score'; 
  const shareMessage = "Protect your mind. Get your BITE score: https://bitemodel.com";
  const shareSubject = "Protect your mind ";

  const generateShareUrl = () => {
    const newUUID = uuidv4();
    const newShareUrl = `https://bitemodel.com/report/${newUUID}`;
    setShareUrl(newShareUrl);
      console.log("share url ", newShareUrl);
    return newShareUrl;
  }
  const handleFacebookShare = () => {
    const url = generateShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`, '_blank');
  };

  const handleTwitterShare = () => {
    const url = generateShareUrl();
    window.open(`https://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&via=YourTwitterHandle&hashtags=BiteScore`, '_blank');
  };

  const handleEmailShare = () => {
    const url = generateShareUrl();
    window.open(`mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(`${shareMessage} ${url}`)}`, '_self');
  };

  const handleSMSShare = () => {
    const url = generateShareUrl();
    window.open(`sms:?body=${encodeURIComponent(`${shareMessage} ${url}`)}`, '_self');
  };

  return (
    <div>
       <MetaTags reportUuid={shareUrl.split('/').pop()} />
      <button onClick={handleFacebookShare}>
        <FacebookIcon size={32} round />
      </button>

      <button onClick={handleTwitterShare}>
        <TwitterIcon size={32} round />
      </button>

      <button onClick={handleEmailShare}>
        <EmailIcon size={32} round />
      </button>

      <button onClick={handleSMSShare}>
        <SMSIcon size={32} round />
      </button>
    </div>
  );
}

export default ShareComponent;

