import React from 'react';
import { Helmet } from 'react-helmet';

function MetaTags({ reportUuid }) {
  const shareUrl = `https://bitemodel.com/report/${reportUuid}`;
  const title = 'Get your Bite Score';
  const description = 'Protect your mind. Get your BITE score.';
  const imageUrl = `https://bitemodel.com/images/${reportUuid}.png`; // Dynamic image URL

  return (
    <Helmet>
      <meta property="og:url" content={shareUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@YourTwitterHandle" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}

export default MetaTags;
