const fs = require('fs');
let code = fs.readFileSync('src/pages/PaymentPage.tsx', 'utf8');

code = code.replace(
  'import { MainLayout } from \'@/components/layouts/MainLayout\';',
  'import { MainLayout } from \'@/components/layouts/MainLayout\';\nimport { MobileLayout, MOBILE_ROUTES } from \'@/components/layouts/MobileLayout\';'
);

code = code.replace(
  '  const [copied, setCopied] = useState(false);',
  '  const [copied, setCopied] = useState(false);\n  const isMobileRoute = window.location.pathname.includes(\'/mobile/\');\n  const Layout = isMobileRoute ? MobileLayout : MainLayout;'
);

code = code.replace(/navigate\('\/login'/g, 'navigate(isMobileRoute ? MOBILE_ROUTES.login : \'/login\'');
code = code.replace(/navigate\('\/checkout'/g, 'navigate(isMobileRoute ? MOBILE_ROUTES.checkout : \'/checkout\'');
code = code.replace(/navigate\('\/orders'/g, 'navigate(isMobileRoute ? MOBILE_ROUTES.orders : \'/orders\'');

code = code.replace(/<MainLayout>/g, '<Layout>');
code = code.replace(/<\/MainLayout>/g, '</Layout>');

fs.writeFileSync('src/pages/PaymentPage.tsx', code);
