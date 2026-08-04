import { HelmetProvider, Helmet } from "react-helmet-async";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import type { Product } from "@/types";

const PageMeta = ({
  title,
  description,
  image,
  product,
}: {
  title: string;
  description?: string;
  image?: string;
  product?: Product;
}) => {
  const { appSettings } = useAppSettings();
  
  const siteName = appSettings?.site_title || 'Shottopoth';
  
  // Use product meta if available, otherwise use provided values, then fallback to defaults
  let metaTitle = title;
  let metaDescription = description || appSettings?.site_description || `${siteName} - Your trusted e-commerce platform`;
  
  if (product) {
    // Title fallback
    if (product.meta_title) {
      metaTitle = product.meta_title;
    } else {
      metaTitle = `${product.name} - Buy Online | ${siteName}`.substring(0, 60);
    }
    
    // Description fallback
    if (product.meta_description) {
      metaDescription = product.meta_description;
    } else {
      const options = [];
      if (product.colors && product.colors.length > 0) options.push('Colors');
      if (product.sizes && product.sizes.length > 0) options.push('Sizes');
      const optionsStr = options.length > 0 ? options.join('/') : 'various options';
      
      metaDescription = `Shop ${product.name} at ${siteName}. Available in ${optionsStr} with fast shipping and secure checkout. Order yours today!`.substring(0, 155);
    }
  }

  const metaImage = product?.meta_image || product?.image_url || image || appSettings?.default_meta_image || '';
  
  // Base URL construction for canonical tag
  const baseUrl = 'https://shottopath.vercel.app';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : (product ? `/products/${product.slug}` : '');
  const canonicalUrl = `${baseUrl}${currentPath}`.replace(/\/$/, '');
  
  // Generate JSON-LD Structured Data
  const jsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": metaImage,
    "description": metaDescription,
    "sku": product.id,
    "mpn": product.id,
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "BDT",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    },
    // We assume reviews might be tracked later or are available
    ...(product.average_rating ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.average_rating,
        "reviewCount": product.total_reviews || 1
      }
    } : {})
  } : null;

  return (
    <Helmet>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={product ? 'product' : 'website'} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      {metaImage && <meta property="og:image" content={metaImage} />}
      {metaImage && <meta property="og:image:width" content="1200" />}
      {metaImage && <meta property="og:image:height" content="630" />}
      {product && <meta property="product:price:amount" content={product.price.toString()} />}
      {product && <meta property="product:price:currency" content="BDT" />}
      
      {/* Twitter */}
      <meta name="twitter:card" content={metaImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {metaImage && <meta name="twitter:image" content={metaImage} />}
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
