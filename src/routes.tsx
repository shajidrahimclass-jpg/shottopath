import React, { Suspense } from 'react';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductDescriptionPage from './pages/ProductDescriptionPage';
import ProductReviewsPage from './pages/ProductReviewsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import OrdersPage from './pages/OrdersPage';
import ChatPage from './pages/ChatPage';
import InboxPage from './pages/InboxPage';
import RedeemCodesPage from './pages/RedeemCodesPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import AppDownloadsPage from './pages/AppDownloadsPage';
import TermsPage from './pages/TermsPage';
import TrackOrderPage from './pages/TrackOrderPage';
import PrivacyPage from './pages/PrivacyPage';
import SocialPage from './pages/SocialPage';
import ReviewsPage from './pages/ReviewsPage';
import RecentlyViewedPage from './pages/RecentlyViewedPage';
import MobileHomePage from './pages/mobile/MobileHomePage';
import MobileProductsPage from './pages/mobile/MobileProductsPage';
import MobileProductDetailPage from './pages/mobile/MobileProductDetailPage';
import MobileCartPage from './pages/mobile/MobileCartPage';
import MobileOrdersPage from './pages/mobile/MobileOrdersPage';
import MobileInboxPage from './pages/mobile/MobileInboxPage';
import MobileProfilePage from './pages/mobile/MobileProfilePage';
import MobileChatPage from './pages/mobile/MobileChatPage';
import MobileLoginPage from './pages/mobile/MobileLoginPage';
import MobileRecentlyViewedPage from './pages/mobile/MobileRecentlyViewedPage';
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductEditor = React.lazy(() => import('./pages/admin/AdminProductEditor'));
const AdminCategories = React.lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminChatPage = React.lazy(() => import('./pages/admin/AdminChatPage'));
const AdminQuickRepliesPage = React.lazy(() => import('./pages/admin/AdminQuickRepliesPage'));
const AdminOrderDetails = React.lazy(() => import('./pages/admin/AdminOrderDetails'));
const AdminVouchers = React.lazy(() => import('./pages/admin/AdminVouchers'));
const AdminRedeemCodes = React.lazy(() => import('./pages/admin/AdminRedeemCodes'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnnouncements = React.lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminBanners = React.lazy(() => import('./pages/admin/AdminBanners'));
const AdminReviews = React.lazy(() => import('./pages/admin/AdminReviews'));
const AdminSendGiftCard = React.lazy(() => import('./pages/admin/AdminSendGiftCard'));
const AdminTemplateManagement = React.lazy(() => import('./pages/admin/AdminTemplateManagement'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminSEO = React.lazy(() => import('./pages/admin/AdminSEO'));
const AdminInvoiceEditor = React.lazy(() => import('./pages/admin/AdminInvoiceEditor'));
const AdminDatabaseManager = React.lazy(() => import('./pages/admin/AdminDatabaseManager'));
const AdminSourceCode = React.lazy(() => import('./pages/admin/AdminSourceCode'));
const AdminOAuthStatus = React.lazy(() => import('./pages/admin/AdminOAuthStatus'));
const AdminProductBundles = React.lazy(() => import('./pages/admin/AdminProductBundles'));
const AdminStockManagement = React.lazy(() => import('./pages/admin/AdminStockManagement'));
const AdminNotificationHistory = React.lazy(() => import('./pages/admin/AdminNotificationHistory'));
const AdminNotificationPreferences = React.lazy(() => import('./pages/admin/AdminNotificationPreferences'));
const AdminAppDownloads = React.lazy(() => import('./pages/admin/AdminAppDownloads'));
const AdminDownloadAnalytics = React.lazy(() => import('./pages/admin/AdminDownloadAnalytics'));
const AdminWebAnalytics = React.lazy(() => import('./pages/admin/AdminWebAnalytics'));
const AdminSocial = React.lazy(() => import('./pages/admin/AdminSocial'));
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';
import { adminPath } from './config/admin';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const getRoutes = (): RouteConfig[] => [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
  },
  {
    name: 'Products',
    path: '/products',
    element: <ProductsPage />,
  },
  {
    name: 'Product Detail',
    path: '/products/:slug',
    element: <ProductDetailPage />,
  },
  {
    name: 'Product Reviews',
    path: '/products/:slug/reviews',
    element: <ProductReviewsPage />,
  },
  {
    name: 'Product Description',
    path: '/products/:slug/description',
    element: <ProductDescriptionPage />,
  },
  {
    name: 'Cart',
    path: '/cart',
    element: <CartPage />,
  },
  {
    name: 'Wishlist',
    path: '/wishlist',
    element: <WishlistPage />,
  },
  {
    name: 'Checkout',
    path: '/checkout',
    element: <CheckoutPage />,
  },
  {
    name: 'Payment',
    path: '/payment',
    element: <PaymentPage />,
  },
  {
    name: 'Orders',
    path: '/orders',
    element: <OrdersPage />,
  },
  {
    name: 'Recently Viewed',
    path: '/recently-viewed',
    element: <RecentlyViewedPage />,
  },
  {
    name: 'Chat',
    path: '/chat',
    element: <ChatPage />,
  },
  {
    name: 'Inbox',
    path: '/inbox',
    element: <InboxPage />,
  },
  {
    name: 'Redeem Codes',
    path: '/redeem-codes',
    element: <RedeemCodesPage />,
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    name: 'App Downloads',
    path: '/app',
    element: <AppDownloadsPage />,
  },
  {
    name: 'Terms',
    path: '/terms',
    element: <TermsPage />,
  },
  {
    name: 'Track Order',
    path: '/track-order',
    element: <TrackOrderPage />,
  },
  {
    name: 'Privacy Policy',
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    name: 'Social Links',
    path: '/social',
    element: <SocialPage />,
  },
  {
    name: 'Reviews',
    path: '/reviews',
    element: <ReviewsPage />,
  },
  // ── Mobile web app (secret path) ────────────────────────────────────────
  {
    name: 'Mobile Home',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op',
    element: <MobileHomePage />,
  },
  {
    name: 'Mobile Products',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/products',
    element: <MobileProductsPage />,
  },
  {
    name: 'Mobile Product Detail',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/products/:slug',
    element: <MobileProductDetailPage />,
  },
  {
    name: 'Mobile Cart',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/cart',
    element: <MobileCartPage />,
  },
  {
    name: 'Mobile Orders',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/orders',
    element: <MobileOrdersPage />,
  },
  {
    name: 'Mobile Inbox',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/inbox',
    element: <MobileInboxPage />,
  },
  {
    name: 'Mobile Profile',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/profile',
    element: <MobileProfilePage />,
  },
  {
    name: 'Mobile Chat',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/chat',
    element: <MobileChatPage />,
  },
  {
    name: 'Mobile Recently Viewed',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/recently-viewed',
    element: <MobileRecentlyViewedPage />,
  },
  {
    name: 'Mobile Login',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/login',
    element: <MobileLoginPage />,
  },
  {
    name: 'Mobile Checkout',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/checkout',
    element: <CheckoutPage />,
  },
  {
    name: 'Mobile Payment',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/payment',
    element: <PaymentPage />,
  },
  {
    name: 'Mobile Track Order',
    path: '/cjwjkkeojejdhishwihswugudhijeid/mobile/shottopath/op/track-order',
    element: <TrackOrderPage />,
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
  },
  {
    name: 'Forgot Password',
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    name: 'Reset Password',
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    name: 'Email Verification',
    path: '/verify-email',
    element: <EmailVerificationPage />,
  },
  {
    name: 'Admin Dashboard',
    path: adminPath(),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminDashboard  /></Suspense>,
  },
  {
    name: 'Admin Products',
    path: adminPath('products'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminProducts  /></Suspense>,
  },
  {
    name: 'Admin Product Editor - New',
    path: adminPath('products/new'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminProductEditor  /></Suspense>,
  },
  {
    name: 'Admin Product Editor - Edit',
    path: adminPath('products/edit/:id'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminProductEditor  /></Suspense>,
  },
  {
    name: 'Admin Categories',
    path: adminPath('categories'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminCategories  /></Suspense>,
  },
  {
    name: 'Admin Product Bundles',
    path: adminPath('bundles'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminProductBundles  /></Suspense>,
  },
  {
    name: 'Admin Stock Management',
    path: adminPath('stock'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminStockManagement  /></Suspense>,
  },
  {
    name: 'Admin Orders',
    path: adminPath('orders'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminOrders  /></Suspense>,
  },
  {
    name: 'Admin Order Details',
    path: adminPath('orders/:id'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminOrderDetails  /></Suspense>,
  },
  {
    name: 'Admin Chat',
    path: adminPath('chat'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminChatPage  /></Suspense>,
  },
  {
    name: 'Admin Quick Replies',
    path: adminPath('quick-replies'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminQuickRepliesPage  /></Suspense>,
  },
  {
    name: 'Admin Vouchers',
    path: adminPath('vouchers'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminVouchers  /></Suspense>,
  },
  {
    name: 'Admin Redeem Codes',
    path: adminPath('redeem-codes'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminRedeemCodes  /></Suspense>,
  },
  {
    name: 'Admin Users',
    path: adminPath('users'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminUsers  /></Suspense>,
  },
  {
    name: 'Admin Announcements',
    path: adminPath('announcements'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminAnnouncements  /></Suspense>,
  },
  {
    name: 'Admin Banners',
    path: adminPath('banners'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminBanners  /></Suspense>,
  },
  {
    name: 'Admin Reviews',
    path: adminPath('reviews'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminReviews  /></Suspense>,
  },
  {
    name: 'Admin Send Gift Card',
    path: adminPath('send-gift-card'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminSendGiftCard  /></Suspense>,
  },
  {
    name: 'Admin Template Management',
    path: adminPath('template-management'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminTemplateManagement  /></Suspense>,
  },
  {
    name: 'Admin Settings',
    path: adminPath('settings'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminSettings  /></Suspense>,
  },
  {
    name: 'Admin SEO',
    path: adminPath('seo'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminSEO  /></Suspense>,
  },
  {
    name: 'Admin Invoice Editor',
    path: adminPath('invoice-editor'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminInvoiceEditor  /></Suspense>,
  },
  {
    name: 'Admin Database Manager',
    path: adminPath('database'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminDatabaseManager  /></Suspense>,
  },
  {
    name: 'Admin Source Code',
    path: adminPath('source-code'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminSourceCode  /></Suspense>,
  },
  {
    name: 'Admin App Downloads',
    path: adminPath('app-downloads'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminAppDownloads  /></Suspense>,
  },
  {
    name: 'Admin Download Analytics',
    path: adminPath('download-analytics'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminDownloadAnalytics  /></Suspense>,
  },
  {
    name: 'Admin Web Analytics',
    path: adminPath('web-analytics'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminWebAnalytics  /></Suspense>,
  },
  {
    name: 'Admin Social Media',
    path: adminPath('social'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminSocial  /></Suspense>,
  },
  {
    name: 'Admin OAuth Status',
    path: adminPath('oauth-status'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminOAuthStatus  /></Suspense>,
  },
  {
    name: 'Admin Notifications',
    path: adminPath('notifications'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminNotificationHistory  /></Suspense>,
  },
  {
    name: 'Admin Notification Preferences',
    path: adminPath('notification-preferences'),
    element: <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminNotificationPreferences  /></Suspense>,
  },
  {
    name: 'Not Found',
    path: '*',
    element: <NotFound />,
  },
];

export default getRoutes;
