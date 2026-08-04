const fs = require('fs');
let code = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

code = code.replace(
  '  const { appSettings, loading: settingsLoading } = useAppSettings();',
  '  const { appSettings, loading: settingsLoading } = useAppSettings();\n  const isMobileRoute = window.location.pathname.includes(\'/mobile/\');\n  const Layout = isMobileRoute ? MobileLayout : MainLayout;'
);

code = code.replace(/navigate\('\/login'/g, 'navigate(isMobileRoute ? MOBILE_ROUTES.login : \'/login\'');
code = code.replace(/navigate\('\/products'/g, 'navigate(isMobileRoute ? MOBILE_ROUTES.products : \'/products\'');
code = code.replace(/navigate\('\/cart'/g, 'navigate(isMobileRoute ? MOBILE_ROUTES.cart : \'/cart\'');
code = code.replace(/navigate\('\/payment'/g, 'navigate(isMobileRoute ? `${MOBILE_ROUTES.home}/payment` : \'/payment\'');
code = code.replace(/navigate\('\/orders'/g, 'navigate(isMobileRoute ? MOBILE_ROUTES.orders : \'/orders\'');

code = code.replace(/<MainLayout>/g, '<Layout>');
code = code.replace(/<\/MainLayout>/g, '</Layout>');

fs.writeFileSync('src/pages/CheckoutPage.tsx', code);
