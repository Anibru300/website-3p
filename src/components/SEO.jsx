import { useEffect } from 'react';

const SEO = ({ 
  title, 
  description, 
  keywords,
  ogImage = 'https://anibru300.github.io/website-3p/og-image.jpg',
  ogType = 'website',
  canonical
}) => {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Update meta tags
    const updateMeta = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    if (description) {
      updateMeta('description', description);
      updateMeta('og:description', description, true);
    }

    if (keywords) {
      updateMeta('keywords', keywords);
    }

    if (title) {
      updateMeta('og:title', title, true);
    }

    if (ogImage) {
      updateMeta('og:image', ogImage, true);
    }

    updateMeta('og:type', ogType, true);

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // Cleanup function
    return () => {
      // Optionally reset to default values
    };
  }, [title, description, keywords, ogImage, ogType, canonical]);

  return null;
};

export default SEO;
