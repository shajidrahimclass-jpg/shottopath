# Requirements Document

## 1. Application Overview

### 1.1 Application Name
Shottopoth

### 1.2 Application Description
Shottopoth is an e-commerce web application that allows users to browse and purchase various products. The platform features a voucher system, redeem code sales system, multiple user roles with different access levels, comprehensive order management capabilities, a dark/light mode switcher, popup announcements managed by admin with image and text content, smooth animations, enhanced responsive design with mobile touch gesture support, a dynamic banner system, a review management system with image attachments, star rating filters, image zoom functionality, admin response capability, helpful voting system for reviews, product sharing functionality, disabled text selection throughout the application, an enhanced chat system with improved UI, fixed image upload functionality, and image zoom capability for communication between users and admin, an enhanced inbox system with real-time notifications including chat message alerts with direct navigation to the relevant chat, and a database manager in the admin panel. The product inbox page and chat page are fully responsive and optimized for all screen sizes.

## 2. User Authentication

### 2.1 Sign In/Log In Requirements
Users can sign in using the following methods:
- Email and Password
- Google Login (OSS Google Login)

### 2.2 Email Authentication
- Email verification required for new user registration via email/password method
- Verification email sent to user's provided email address
- Users must verify email before accessing full account features

### 2.3 Google Login
- Users can log in using their Google account via OSS Google Login method
- Google login provides quick and secure authentication
- No email verification required for Google login users

### 2.4 Navigation Display
- Signed in/logged in users: Home and Add Product options are hidden from navigation
- Product browsing remains accessible to all users

### 2.5 Admin Panel Access
- Admin users can access admin panel via /admin route
- Admin panel is restricted to authorized admin users only
- Admin panel is fully mobile responsive
- On mobile devices, admin panel displays a three-line menu icon to access all admin features
- All admin panel features and functionalities are accessible and optimized for mobile devices
- Admin panel layout adapts seamlessly to different mobile screen sizes
- Touch-friendly interface elements for mobile interaction
- Optimized navigation and controls for mobile usage

## 3. User Roles and Permissions

### 3.1 Guest User
- Can browse all products
- Can view product details
- Can share products
- Can view reviews and helpful vote counts
- Cannot place orders
- Cannot write reviews
- Cannot vote on review helpfulness
- Must sign in to make purchases

### 3.2 Signed In/Logged In User
- Can purchase all products
- Can place orders
- Can write reviews with optional image attachments
- Can vote on review helpfulness (mark reviews as helpful or not helpful)
- Can change their helpful vote within a time window
- Can reply to admin responses on their reviews creating a conversation thread
- Can save delivery addresses
- Can add new delivery addresses on checkout page
- Can view order histories
- Can view notifications in user inbox
- Can view their submitted reviews
- Can filter reviews by star rating (5 star to 1 star)
- Can sort reviews by helpfulness
- Can share products
- Home and Add Product options hidden from navigation
- Can access chat page to communicate with admin
- Can upload images in chat with fixed upload functionality
- Can zoom into images sent or received in chat
- Can delete their own messages in chat
- Receives inbox notification when a new chat message is received from admin
- Receives email notification when admin responds to their review
- Can purchase redeem codes from admin
- Recent view history is not displayed in user profile

### 3.3 Suspected User Role
- Suspected users cannot use Cash on Delivery payment method
- Suspected users can only use Bkash Payment or Nagad Payment
- Suspected users can still browse products and place orders with online payment methods
- Suspected users receive inbox notification about their account status and payment restrictions
- Suspected users can share products
- Suspected users can vote on review helpfulness

### 3.4 Banned User Role
- Banned users cannot purchase any products
- Banned users cannot place orders
- Banned users receive inbox notification about their banned status
- Banned users can still browse products but cannot proceed to checkout
- Banned users can share products
- Banned users can view reviews and helpful vote counts
- Banned users cannot vote on review helpfulness
- When banned users attempt to purchase, they are shown a message indicating their account is banned

### 3.5 Admin Panel
- Can add products with optional size, color, and pieces attributes
- Can add device-specific images for products
- Can add video for each product
- Can add and manage vouchers
- Can create and sell redeem codes
- Can manage redeem code inventory and pricing
- Can access Redeem Code Product page to add product images and redeem codes
- Can view all orders with user addresses
- Can update order status (Pending, On the Way, Confirmed, Delivered)
- Cannot cancel orders
- Can filter orders by specific status (Delivered, Pending, On the Way, Confirmed, Canceled)
- Can search orders by order ID
- Can search orders by user information
- Can search users
- Can search products
- Can manage users (Ban, Suspend, Unban)
- Can set user role to Suspected
- Can edit delivery location charges
- Can edit delivery duration for each location
- Can manage payment gateways
- Can manage popup announcements with image and text content
- Can manage product catalog
- Can add and manage terms and conditions content for checkout page
- Can add and manage refund policy content for checkout page
- Can change Bkash number in admin panel settings
- Can view detailed order information by clicking a button on each order
- Can copy customer name, phone number, and address from order details
- Can view Total Revenue (excluding delivery charges)
- Can add and manage multiple banner images for dynamic banner display
- Can manage product reviews (delete or hide reviews)
- Can respond to customer reviews directly
- Can edit and delete admin responses to reviews
- Can view response status indicator in admin reviews list
- Can access response templates for common scenarios
- Can track response time metrics for reviews
- Can view helpful vote analytics for reviews in admin dashboard
- Can monitor suspicious voting patterns for spam prevention
- Row-level security is displayed when admin uploads pictures
- Can add optional product user manual content
- Can manage categories through a dedicated category management page
- Can access Invoice Editor page to edit invoice content and add anything
- Can upload and manage invoice logo displayed on the left side of invoice
- Can upload and manage invoice QR code displayed on the right side of invoice
- When admin uploads large images, images automatically adjust to be responsive
- Can add device-specific thumbnail images for PC and mobile
- Can add device-specific main images for PC and mobile
- Can add banner images on both mobile and PC
- Can change browser tab icon
- Can change browser tab name
- Can change web navigation bar name
- All admin panel features are fully accessible and optimized for mobile devices
- Can access chat page to communicate with users
- Can view user email and user name in enhanced chat interface
- Can click on user name in chat to view user details
- Can delete their own messages in chat
- Can zoom into images sent or received in chat
- Can access Quick Reply Management page to add, edit, and delete quick reply messages
- Can view order description submitted by users on the checkout page
- Can see a checkbox indicator showing whether the user agreed to terms and refund policy at checkout
- Can access database manager to view and manage database records
- Can access enhanced order page with improved layout and functionality

## 4. User Interface Features

### 4.1 Text Selection
- Text selection is disabled throughout the entire application

### 4.2 Dark/Light Mode Switcher
- Mode switcher available throughout the application
- Users can toggle between dark and light themes

### 4.3 Dynamic Banner System
- Replaces static Discover Products section
- Admin can add multiple banner images
- Banner images automatically switch every 3 seconds
- Displayed on homepage or designated sections
- Admin can upload banner pictures through product editor page
- Admin can add banner images on both mobile and PC
- Device-specific banner display: banners added for PC are only visible to PC users; banners added for mobile are only visible to mobile users

### 4.4 Product Page
- Product details section
- Product page layout and all content sections are fully responsive and adapt to all screen sizes (mobile, tablet, desktop)
- All elements on the product page including images, descriptions, buttons, attributes, reviews, and user manual sections display correctly without overflow or layout breakage on any screen size
- On mobile devices, product page elements stack vertically and remain touch-friendly
- Product description with truncation: if product description is too long, display truncated text with Show More option
- Product user manual displayed beside the product description with Show More option if content is long
- Device-specific product images display with image zoom and navigation features:
  - When user clicks on product image, image enlarges with zoom capability
  - Navigation arrows displayed for switching between product images
  - User can use arrows to navigate through all product images
  - Device-specific thumbnail images: thumbnail images added for PC are only visible to PC users; thumbnail images added for mobile are only visible to mobile users
  - Device-specific main images: main images added for PC are only visible to PC users; main images added for mobile are only visible to mobile users
  - On mobile devices, pinch-to-zoom gesture is supported for product images
  - Users can pinch to zoom in and out on product images for detailed viewing
  - Pinch-to-zoom provides smooth and responsive zooming experience
  - Double-tap gesture on mobile zooms in on product images
- Product video display (if available)
- Optional product attributes: size, color, pieces
- Stock display: show only stock availability status, not stock value
- Dark/light mode switcher
- More products section displayed under product details
- Random products displayed in More products section
- Buy Now button for immediate purchase
- Add to Cart button
- Share button for product sharing
- Product reviews section displaying only 3 reviews initially
- View More button to display additional reviews
- Failed to load review message displayed when reviews fail to load
- Product reviews section inside product page is fully responsive and adapts to all screen sizes (mobile, tablet, desktop)

### 4.5 Product Sharing Feature
- Share button available on product page
- Users can share products regardless of login status (guest users, signed in users, suspected users, and banned users can all share)
- Share functionality allows users to share product links

### 4.6 Product Selection Popup
- When user clicks Buy Now or Add to Cart on products with color, size, or quantity options
- Popup displays requiring user to select:
  - Color (if product has color options)
  - Size (if product has size options)
  - Quantity/pieces
- User must complete selections before proceeding to checkout or adding to cart

### 4.7 Product User Manual Agreement Popup
- When user clicks Buy Now or Add to Cart, a popup appears requiring user to accept that they have read the product user manual
- User must accept the agreement before proceeding to checkout or adding to cart
- This popup appears every time user attempts to purchase or add to cart
- This popup appears in addition to the product selection popup (if applicable)
- This popup only appears if admin has added product user manual content

### 4.8 Popup Announcements
- Admin-managed popup announcements displayed to users
- Admin can add image content to announcements
- Admin can add text content to announcements
- Announcements display both image and text as configured by admin
- Admin can copy and paste text content into announcement editor
- Popup announcements appear based on admin configuration
- Announcements are fully responsive and adapt to all screen sizes

### 4.9 Animations
- Smooth animations throughout the entire application
- Enhanced user experience with animated transitions and interactions
- Product pre-loading animation displayed when user switches between PC mode and mobile mode
- Product pre-loading animation displayed when user switches from mobile to PC mode
- Page transitions feature smooth fade-in and fade-out effects
- Button interactions include hover and click animations
- Product cards animate when appearing on screen
- Cart items animate when added or removed
- Modal and popup windows animate when opening and closing
- Navigation menu transitions are animated
- Form elements include subtle animations for focus and validation states
- Loading states display animated indicators
- Scroll-triggered animations for content sections
- Image galleries feature smooth transition animations
- Notification and alert messages animate in and out
- Helpful vote button displays visual feedback animation when clicked
- All animations are optimized for performance across devices

### 4.10 Responsive Design
- Fully responsive layout optimized for all screen sizes
- Enhanced mobile experience
- Bottom navigation bar displayed on mobile devices
- Three-line menu icon in admin panel on mobile devices for accessing all features
- Adaptive interface elements for tablets and desktops
- Admin panel is fully mobile responsive with optimized layout and controls
- Invoice display is fully mobile responsive
- When admin uploads large images, images automatically adjust to be responsive across all devices
- Device-specific content display: content added for specific devices (PC or mobile) is only visible to users on that device type
- Checkout page is fully responsive and optimized for all screen sizes including mobile, tablet, and desktop
- User review submission page is fully responsive and adapts to all screen sizes (mobile, tablet, desktop)
- Product reviews section inside product page is fully responsive and adapts to all screen sizes
- Product inbox page is fully responsive and adapts to all screen sizes (mobile, tablet, desktop)
- Chat page is fully responsive and adapts to all screen sizes (mobile, tablet, desktop)
- All chat interface elements including message bubbles, image uploads, input fields, and action buttons display correctly and remain touch-friendly on mobile devices
- Chat layout adjusts fluidly for small screens without horizontal overflow or broken elements
- Payment page is fully responsive and optimized for all screen sizes

### 4.11 Mobile Touch Gesture Support
- Swipe-to-delete gesture for cart items on mobile devices:
  - Users can swipe left on cart items to reveal delete action
  - Swipe gesture provides intuitive item removal on mobile
  - Delete action is confirmed with smooth animation
  - Swipe-to-delete is available only on mobile and tablet devices
- Pull-to-refresh gesture for product lists on mobile devices:
  - Users can pull down on product list pages to refresh content
  - Pull-to-refresh displays loading indicator during refresh
  - Product list updates with latest data after refresh completes
  - Pull-to-refresh provides intuitive content update mechanism on mobile
  - Pull-to-refresh is available on homepage product listings and category product listings
- Pinch-to-zoom gesture for product images on mobile devices:
  - Users can pinch to zoom in and out on product images
  - Pinch-to-zoom provides smooth and responsive zooming experience
  - Double-tap gesture on mobile zooms in on product images
  - Pinch-to-zoom is available on product page images and product image galleries
  - Zoomed images can be panned by dragging with finger
- All touch gestures are optimized for performance and responsiveness
- Touch gestures enhance mobile user experience and make interface more intuitive

### 4.12 User Inbox
- Users can access inbox to view notifications
- Inbox page is fully responsive and adapts to all screen sizes (mobile, tablet, desktop)
- All inbox elements including notification cards, badges, and action controls display correctly on mobile without overflow or layout breakage
- Inbox displays a notification badge/indicator when there are unread notifications
- Notifications include order cancellation notices with admin-provided reasons
- When order status changes to Confirmed, user receives inbox notification with unique color
- When order status changes to On the Way, user receives inbox notification with unique color
- When order status changes to Delivered, user receives inbox notification with unique color
- Each order status notification displays in a different color for easy identification
- Suspected users receive inbox notification about their account status and payment restrictions
- Banned users receive inbox notification about their banned status
- Users receive an inbox notification when a new chat message is received from admin
- Chat message notifications display in a distinct style to differentiate them from order/status notifications
- Each chat notification includes a preview or indicator of the new message
- When a user clicks on a chat notification in the inbox, they are automatically redirected to the chat page without encountering a 404 error
- Clicking a chat notification navigates the user directly to the relevant chat conversation
- The chat page route must be valid and accessible to authenticated users; clicking a chat notification must never result in a 404 page
- All notification types animate in and out smoothly consistent with the application animation standards

### 4.13 Show More and View All Functionality
- When user clicks Show More or View All buttons, content opens in a separate page
- Product user manual Show More functionality does not trigger agreement popup
- User can view full product user manual content without accepting agreement popup when clicking Show More
- Agreement popup only appears when user clicks Buy Now or Add to Cart

### 4.14 Random Product Display
- Every time user refreshes the page, random products are displayed
- Product display order changes with each page refresh
- Random products are also displayed in More products section on product page

### 4.15 Cart Product Image Display
- Cart page displays product images in large size

### 4.16 Enhanced More Products View
- More products section features enhanced visual presentation
- Product cards display with improved layout and spacing
- Product images are displayed prominently with consistent sizing
- Product information includes name, price, and availability status
- Hover effects applied to product cards for better interactivity
- Smooth transitions when navigating between products
- Responsive grid layout adapts to different screen sizes
- On mobile devices, products display in optimized single or dual column layout
- On tablets and desktops, products display in multi-column grid for better browsing experience
- When user clicks more products, main products animation is displayed

### 4.17 Category Display and Popup
- When admin adds many categories, user interface displays a limited number of categories initially
- A Show More button or link is displayed below the initially visible categories
- When user clicks Show More, a popup appears displaying all available categories
- The popup presents all categories in an organized and scrollable format
- User can browse and select categories from the popup
- Popup includes a close button or dismiss action to return to the main view
- Category popup is fully responsive and adapts to all screen sizes
- On mobile devices, category popup displays in an optimized layout for easy browsing and selection

### 4.18 User Profile
- Recent view history is not displayed in user profile
- User profile displays user information and account settings
- User profile is fully responsive and adapts to all screen sizes

## 5. Voucher System

### 5.1 Voucher Types
- Percentage discount
- Fixed amount discount

### 5.2 Voucher Usage
- One-time use vouchers
- Multiple-use vouchers
- Admin can set usage limits when creating vouchers

### 5.3 Minimum Amount Requirement
- Admin can add minimum amount requirement for each voucher
- Voucher can only be applied when order subtotal meets or exceeds the minimum amount
- Minimum amount is set by admin when creating or editing vouchers
- If admin sets minimum amount to 1000 and user purchases product worth 999, user cannot use the voucher

## 6. Redeem Code System

### 6.1 Redeem Code Creation and Management
- Admin can create redeem codes through admin panel
- Admin can set redeem code value or discount amount
- Admin can manage redeem code inventory
- Admin can set pricing for redeem codes
- Admin can view all active and sold redeem codes

### 6.2 Redeem Code Product Page
- A dedicated page called Redeem Code Product is implemented
- Admin can access Redeem Code Product page through admin panel
- Admin can add product images on Redeem Code Product page
- Admin can add redeem codes on Redeem Code Product page
- Product images and redeem codes are displayed together on this page
- Admin can manage and organize redeem code products with associated images

### 6.3 Redeem Code Sales
- Users can purchase redeem codes from admin
- Redeem codes are sold as products or through dedicated purchase flow
- Users can view available redeem codes for purchase
- Payment for redeem codes follows standard payment methods

### 6.4 Redeem Code Usage
- Users can apply purchased redeem codes during checkout
- Redeem codes provide discounts or value as configured by admin
- System validates redeem code before applying discount
- Used redeem codes are marked as redeemed and cannot be reused

## 7. Order and Checkout Process

### 7.1 Checkout Page Layout
- Checkout page is fully responsive and adapts to all screen sizes (mobile, tablet, desktop)
- Top section: Saved delivery addresses
- Option to add new delivery address on checkout page
- Delivery location selection with charges and duration:
  - Dhaka
  - Dhaka Outer City
  - Out of Dhaka
- Admin can edit location names, prices, and delivery duration
- Subtotal display
- Chat option available for users to communicate with admin
- Order description field: users can optionally add a description/note for their order
- Terms and Refund Policy agreement section:
  - Clickable link labeled 「Terms and Agreement」
  - When user clicks the link, a popup appears displaying the full Terms and Agreement page content
  - Popup is fully responsive and adapts to all screen sizes
  - Popup includes a close button or dismiss action
  - Checkbox labeled 「I agree to the Terms and Refund Policy」
  - User must check this checkbox before placing the order
  - Order cannot be submitted if checkbox is not checked
  - Checkbox state (agreed/not agreed) is recorded and visible to admin in order details
- After completing all required fields and agreeing to terms, user proceeds to /payment page for payment method selection and payment information entry

### 7.2 Payment Page
- Dedicated /payment page for payment method selection and payment information entry
- Payment page is fully responsive and optimized for all screen sizes (mobile, tablet, desktop)
- User is redirected to /payment page after completing checkout page
- Payment page displays order summary including subtotal, delivery charges, and total amount
- Payment method selection available on payment page
- Payment information entry fields displayed based on selected payment method

### 7.3 Payment Methods

**For Dhaka location:**
- Cash on Delivery (not available for Suspected users)
- Bkash Payment
- Nagad Payment

**For Dhaka Outer City and Out of Dhaka:**
- Bkash Payment
- Nagad Payment

### 7.4 Payment Method Restrictions
- Suspected users cannot select Cash on Delivery payment method
- Suspected users can only use Bkash Payment or Nagad Payment
- Banned users cannot proceed to checkout or select any payment method

### 7.5 Payment Information on Payment Page
- When user selects Bkash or Nagad payment on /payment page:
  - Display full payment amount
  - Display only delivery charge separately
- Display delivery location
- Display delivery duration for selected location
- Payment number is displayed and copyable on the payment page
- Above the Transaction ID field, user is required to provide the last 4 digits of their payment number
- User must provide:
  - Last 4 digits of their payment number
  - Transaction ID
  - Bkash number or Nagad number used for payment
- Only after providing payment information can order be submitted

### 7.6 Payment Gateway Management
- Admin can configure and manage Bkash and Nagad payment gateways
- Admin Bkash number: 01615995004
- Admin can change Bkash number in admin panel settings

### 7.7 Order Display in Admin Panel
- Enhanced order page with improved layout and functionality
- All orders display user address information
- Admin can view complete delivery details for each order
- Admin can filter orders by specific status: Delivered, Pending, On the Way, Confirmed, Canceled
- Admin can search orders by order ID
- Admin can search orders by user information
- Each order has a button that admin can click
- Clicking the button opens a page showing detailed order information:
  - Which products the user purchased
  - Quantity of each product purchased
  - Delivery method
  - Product names
  - User delivery address
  - Invoice for the order
  - Chat option to communicate with the user
  - Order description submitted by the user (if provided)
  - Whether the user agreed to the Terms and Refund Policy (checkbox status displayed)
- Admin can copy customer name, phone number, and address from order details
- Canceled orders are displayed in red color to distinguish them from other orders
- A separate Canceled section is added beside the Confirmed order section for easy access to canceled orders
- A separate On the Way section is added beside the Confirmed order section
- Enhanced order page provides better organization and accessibility of order information

### 7.8 Buy Now Feature
- Buy Now button on product page
- Allows users to proceed directly to checkout
- Bypasses cart for immediate purchase
- Triggers product selection popup if product has color, size, or quantity options
- Triggers product user manual agreement popup before proceeding (only if admin has added product user manual content)
- Banned users cannot use Buy Now feature and are shown a message about their banned status

### 7.9 Order Histories
- Users can view their complete order histories
- Order history includes order status, items, and delivery information

### 7.10 Terms and Agreement Management
- Admin can add and edit terms and conditions content through admin panel
- Admin can add and edit refund policy content through admin panel
- Terms and Agreement content is displayed in a popup when user clicks the link on checkout page
- Popup is fully responsive and adapts to all screen sizes
- Users must agree to terms before placing order

### 7.11 Order Cancellation
- Admin cannot cancel orders
- Canceled orders are displayed in red color
- Canceled orders appear in a separate Canceled section beside Confirmed orders
- When an order is canceled, a notification is sent to the user's inbox
- Notification includes the cancellation reason

## 8. Product Management

### 8.1 Product Attributes
- Optional size attribute
- Optional color attribute
- Optional pieces attribute
- Admin can configure these attributes when adding products
- Products with these attributes trigger selection popup when user attempts to purchase or add to cart

### 8.2 Product Media
- Admin can add device-specific thumbnail images for PC and mobile
- Admin can add device-specific main images for PC and mobile
- Admin can add video for each product
- Device-specific images and video displayed on product page
- Product images support zoom and navigation features
- Device-specific thumbnail image display: thumbnail images added for PC are only visible to PC users; thumbnail images added for mobile are only visible to mobile users
- Device-specific main image display: main images added for PC are only visible to PC users; main images added for mobile are only visible to mobile users

### 8.3 Product Editor Page
- Product editor is implemented as a dedicated page
- Admin can manage product slug on the product editor page
- Admin can upload banner pictures through the product editor page

### 8.4 Product Description Display
- If product description is too long, display truncated text
- Show More option available to expand full description
- When user clicks Show More, content opens in a separate page
- Product user manual Show More does not trigger agreement popup

### 8.5 Stock Display
- Product page displays only stock availability status
- Stock value is not displayed to users

### 8.6 Product Search in Admin Panel
- Admin can search products in admin panel
- Search functionality helps admin quickly locate specific products

### 8.7 Category Management
- Admin can manage categories through a dedicated category management page
- Admin can add new categories
- Admin can edit existing categories
- Admin can delete categories

## 9. Review Management

### 9.1 Review Submission
- Users can write reviews for products
- Users can attach images to their reviews
- User review submission page is fully responsive and adapts to all screen sizes (mobile, tablet, desktop)
- All form elements, input fields, image upload controls, and submission buttons on the review submission page are properly sized and accessible on mobile devices
- Layout of the review submission page adjusts fluidly for small screens without horizontal overflow or broken elements

### 9.2 Review Display on Product Page
- Product page displays only 3 reviews initially
- View More button available to display additional reviews
- When user clicks View More, reviews open in a separate page
- Failed to load review message displayed when reviews fail to load
- Product reviews section inside the product page is fully responsive and adapts to all screen sizes (mobile, tablet, desktop)
- Review cards, star ratings, review text, and attached images within the product page reviews section display correctly on all screen sizes without overflow or layout breakage
- On mobile devices, review elements stack vertically and remain touch-friendly
- Admin responses are displayed below the original customer review
- Admin responses show an admin badge or label to distinguish from customer comments
- Conversation threads are displayed when customers reply to admin responses
- Each review card displays helpful vote count prominently
- Percentage of users who found the review helpful is displayed on each review card
- Most helpful reviews are highlighted with a badge or special styling

### 9.3 Review Image Zoom
- Users can click on images attached to reviews to zoom in and view them in full size
- Zoomed image is displayed in a lightbox or overlay with a close/dismiss option
- Zoom overlay supports closing by clicking outside the image or pressing a close button
- Zoom functionality is available both on the product page review section and on the full review listing page
- Zoom interaction is smooth and animated, consistent with the application animation standards
- Zoom is fully functional on both desktop and mobile devices
- On mobile, pinch-to-zoom gesture is supported within the zoomed image overlay

### 9.4 Review Filtering and Sorting
- Users can filter reviews by star rating
- Filter options: 5 star, 4 star, 3 star, 2 star, 1 star
- Users can select specific star ratings to view corresponding reviews
- Users can sort reviews by helpfulness as a sorting option
- Sorting by helpfulness displays reviews with highest helpful vote counts first

### 9.5 Review Management Page
- A dedicated page displays all products with their reviews
- Admin can manage reviews for each product
- Admin panel review page is fully mobile responsive
- Review management interface adapts to mobile screen sizes
- Touch-friendly controls for managing reviews on mobile devices
- Optimized layout for viewing and managing reviews on mobile
- Response status indicator displayed in admin reviews list showing which reviews have admin responses
- Admin can view helpful vote analytics for each review

### 9.6 Admin Review Controls
- Admin can delete reviews
- Admin can hide reviews
- Hidden reviews are only visible to the user who submitted the review
- Hidden reviews are not visible to other users or guests
- Admin can monitor suspicious voting patterns for spam prevention

### 9.7 User Review Visibility
- Users can view their submitted reviews
- Users can see reviews that admin has hidden (only their own hidden reviews)
- Users can view all public reviews on product pages

### 9.8 Admin Response Functionality
- Admin can reply directly to customer reviews
- Admin responses are displayed below the original review on product pages
- Rich text editor available for formatting admin responses
- Admin responses show an admin badge or label to distinguish from customer comments
- Email notification sent to reviewer when admin responds to their review
- Admin can edit their responses after posting
- Admin can delete their responses
- Response time metrics tracked for admin performance monitoring
- Response templates available for common scenarios to speed up admin replies
- Response status indicator shown in admin reviews list indicating which reviews have been responded to

### 9.9 Review Conversation Thread
- Customers can reply back to admin responses creating a conversation thread
- Conversation threads display chronologically below the original review
- Each reply in the thread shows the author (customer or admin) with appropriate badge/label
- Conversation threads enhance customer engagement and support
- All conversation thread elements are fully responsive and display correctly on all devices

### 9.10 Helpful Voting System
- Signed in users can mark reviews as helpful or not helpful
- Each review displays a helpful vote count prominently on the review card
- Percentage of users who found the review helpful is displayed on each review card
- Users are prevented from voting multiple times on the same review using localStorage or database tracking
- When user clicks the helpful button, visual feedback animation is displayed
- Users can sort reviews by helpfulness as a sorting option
- Most helpful reviews are highlighted with a badge or special styling to distinguish them
- Users can change their vote within a time window after initial voting
- Admin can track helpful vote analytics in the admin dashboard
- System implements spam prevention to detect suspicious voting patterns
- Guest users and banned users cannot vote on review helpfulness
- Suspected users can vote on review helpfulness
- Helpful voting functionality is fully responsive and works on all devices
- Vote count updates in real-time after user submits their vote

## 10. User Management

### 10.1 Admin User Controls
- Ban users
- Suspend users
- Unban users
- Set user role to Suspected
- Search users in admin panel

### 10.2 User Role Status Effects
- Suspected users receive payment method restrictions
- Banned users cannot purchase products or place orders
- Both Suspected and Banned users receive inbox notifications about their account status

## 11. Revenue Management

### 11.1 Total Revenue Calculation
- Admin panel displays Total Revenue
- Total Revenue calculation excludes delivery charges
- Only product prices are included in revenue calculation

## 12. Product User Manual Management

### 12.1 Product User Manual Display
- Product user manual is displayed beside the product description on product page
- Product user manual content is optional and managed by admin
- If product user manual content is long, Show More option is available
- When user clicks Show More for product user manual, content opens in a separate page without triggering agreement popup

### 12.2 Product User Manual Agreement
- When user clicks Buy Now or Add to Cart, a popup appears requiring user to accept that they have read the product user manual
- User must accept the agreement before proceeding
- This agreement popup appears every time user attempts to purchase or add to cart
- This agreement popup only appears if admin has added product user manual content
- Agreement popup does not appear when user clicks Show More to view full product user manual content

### 12.3 Admin Product User Manual Controls
- Admin can add optional product user manual content
- Product user manual feature is optional and only appears if admin has added content

## 13. Invoice Management

### 13.1 Invoice Editor Page
- Admin can access Invoice Editor page
- Admin can edit invoice content
- Admin can add anything to the invoice

### 13.2 Invoice Enhancement
- Invoice displays logo on the left side
- Invoice displays QR code on the right side
- Admin can upload and manage invoice logo
- Admin can upload and manage invoice QR code

### 13.3 Invoice Responsive Design
- Invoice display is fully mobile responsive
- Invoice layout adapts to different screen sizes
- Logo and QR code positioning adjusts for mobile devices

## 14. Branding Management

### 14.1 Browser Tab Customization
- Admin can change browser tab icon
- Admin can change browser tab name

### 14.2 Navigation Bar Customization
- Admin can change web navigation bar name

## 15. Announcement Management

### 15.1 Announcement Content Management
- Admin can add image content to popup announcements
- Admin can add text content to popup announcements
- Admin can copy and paste text into announcement editor
- Announcements display both image and text content as configured by admin
- Admin can edit existing announcement content
- Admin can delete announcements

### 15.2 Announcement Display
- Popup announcements appear to users based on admin configuration
- Announcements display image and text content together
- Announcements are fully responsive and adapt to all screen sizes (mobile, tablet, desktop)
- On mobile devices, announcement layout adjusts for optimal viewing
- Announcement popup includes close button or dismiss action
- Announcements animate in and out smoothly consistent with application animation standards

## 16. Chat System

### 16.1 Chat Page Implementation
- Chat is implemented as a dedicated page
- Chat page is fully responsive and adapts to all screen sizes (mobile, tablet, desktop)
- All chat interface elements including message bubbles, image upload controls, input fields, send buttons, and action menus display correctly and remain touch-friendly on mobile devices
- Chat layout adjusts fluidly for small screens without horizontal overflow or broken elements
- On mobile devices, the chat input area and message list are properly sized and accessible
- Users can access chat page to communicate with admin
- Admin can access chat page to communicate with users
- Chat UI is enhanced with improved visual design and user experience
- The chat page route is valid and accessible to all authenticated users; navigating to the chat page must never result in a 404 error

### 16.2 Chat Message Display
- User messages are displayed on the right side of the chat interface
- Admin messages are displayed on the left side of the chat interface
- Enhanced message bubbles with improved styling and readability
- Clear visual distinction between user and admin messages

### 16.3 User Chat Features
- Users can send messages to admin
- Users can upload images in chat with fixed upload functionality
- Image upload feature is fully functional and reliable
- Users can click on any image in the chat to zoom in and view it in full size
- Zoomed chat image is displayed in a lightbox or overlay with a close/dismiss option
- Zoom overlay supports closing by clicking outside the image or pressing a close button
- Pinch-to-zoom gesture is supported within the zoomed image overlay on mobile devices
- Users can delete their own messages
- Chat interface accessible from order page
- Enhanced UI provides better user experience
- When admin sends a new message, user receives an inbox notification
- User can click the chat notification in inbox to be redirected directly to the chat page without encountering a 404 error

### 16.4 Admin Chat Features
- Admin can view user email in enhanced chat interface
- Admin can view user name in enhanced chat interface
- Admin can click on user name in chat to view user details
- Admin can send messages to users
- Admin can delete their own messages
- Admin can click on any image in the chat to zoom in and view it in full size
- Zoomed chat image is displayed in a lightbox or overlay with a close/dismiss option
- Zoom overlay supports closing by clicking outside the image or pressing a close button
- Pinch-to-zoom gesture is supported within the zoomed image overlay on mobile devices
- Admin can access Quick Reply Management page
- Chat interface accessible from order details page
- Enhanced UI provides better admin experience

### 16.5 Quick Reply Management
- Quick Reply Management is implemented as a dedicated page
- Admin can add quick reply messages
- Admin can edit quick reply messages
- Admin can delete quick reply messages
- Quick reply messages can be used for faster responses in chat

### 16.6 Chat Image Zoom Enhancement
- All images shared within the chat interface support zoom functionality for both users and admin
- Clicking or tapping on any chat image opens a full-size lightbox overlay
- Lightbox overlay displays the image at maximum readable size
- Overlay background is dimmed to focus attention on the zoomed image
- Close button is clearly visible within the overlay
- Clicking outside the zoomed image area dismisses the overlay
- On mobile devices, pinch-to-zoom gesture is supported within the lightbox
- Smooth open and close animations are applied to the lightbox, consistent with the application animation standards
- Zoom functionality is fully responsive and works across all device sizes
- Keyboard accessibility: pressing Escape key closes the zoom overlay

### 16.7 Chat Interface Enhancement
- Enhanced chat UI with improved visual design
- Better message organization and display
- Improved image upload functionality with reliable performance
- Fixed image upload issues for seamless user experience
- Real-time messaging between users and admin
- Image upload capability for users with fixed functionality
- Quick answer functionality for admin
- Display of user email and user name for admin reference
- Message deletion capability for both users and admin
- User details accessible by clicking on user name
- Modern and intuitive interface design
- Responsive layout optimized for all devices
- Full image zoom capability for all chat images

### 16.8 Chat Notification in Inbox
- When a user receives a new chat message from admin, an inbox notification is generated
- The chat notification is visually distinct from order and account status notifications
- The notification displays relevant information such as a message preview or sender indicator
- When the user clicks the chat notification, they are immediately redirected to the chat page without encountering a 404 error
- The redirect navigates the user directly to the relevant chat conversation
- The chat page route must be correctly registered and resolvable; clicking a chat notification must never result in a 404 page
- Unread chat notifications contribute to the inbox unread badge count
- Chat notifications animate in and out consistently with the application animation standards

## 17. Terms and Agreement Page

### 17.1 Terms and Agreement Page Implementation
- A dedicated Terms and Agreement page is implemented
- The page displays full terms and conditions content
- The page displays refund policy content
- Admin can manage and edit all content on this page through admin panel

### 17.2 Terms and Agreement Popup on Checkout Page
- On the checkout page, a clickable link labeled 「Terms and Agreement」 is displayed
- When user clicks the link, a popup appears displaying the full Terms and Agreement page content
- The popup is fully responsive and adapts to all screen sizes (mobile, tablet, desktop)
- Popup includes a close button or dismiss action to return to the checkout page
- Popup content is scrollable if content exceeds viewport height
- Popup displays all terms and conditions and refund policy content managed by admin

### 17.3 Admin Management of Terms and Agreement
- Admin can access a dedicated management page for Terms and Agreement content
- Admin can add new terms and conditions content
- Admin can edit existing terms and conditions content
- Admin can add new refund policy content
- Admin can edit existing refund policy content
- All changes made by admin are immediately reflected in the popup displayed on checkout page

## 18. Database Manager

### 18.1 Database Manager in Admin Panel
- Admin can access database manager through admin panel
- Database manager provides interface to view database records
- Admin can manage database records through the database manager
- Database manager displays data in organized and readable format
- Admin can perform database operations as needed

## 19. Technical Requirements

### 19.1 Database
Firebase

### 19.2 Security
- Row-level security is displayed when admin uploads pictures

## 20. Acceptance Criteria

- All user authentication methods function correctly including email/password and Google login
- Email verification is enforced for email/password registration
- User roles and permissions are correctly implemented and enforced
- Guest users can browse but cannot purchase, review, or vote on review helpfulness
- Signed in users can purchase, review, vote on review helpfulness, and manage their orders
- Signed in users can purchase redeem codes from admin
- Signed in users can reply to admin responses on their reviews
- Signed in users receive email notifications when admin responds to their reviews
- Recent view history is not displayed in user profile
- Suspected users are restricted to online payment methods only
- Suspected users can vote on review helpfulness
- Banned users cannot purchase, place orders, or vote on review helpfulness
- Admin panel is accessible only to authorized admin users
- Admin can manage products, orders, users, vouchers, redeem codes, categories, and all system settings
- Admin can create and sell redeem codes with configurable pricing and inventory
- Admin can access Redeem Code Product page to add product images and redeem codes
- Admin can manage Terms and Agreement content through dedicated management page
- Admin can access and use database manager to view and manage database records
- Admin can add image and text content to popup announcements
- Admin can copy and paste text into announcement editor
- Popup announcements display both image and text content correctly
- Announcements are fully responsive across all devices
- Dark/light mode switcher functions throughout the application
- Dynamic banner system displays and rotates banners correctly
- Product pages display all information correctly including images, videos, descriptions, and user manuals
- Device-specific images display correctly for PC and mobile users
- Product selection popup appears when required and functions correctly
- Product user manual agreement popup appears when required
- Category display shows limited categories initially with Show More functionality
- Category popup displays all categories when user clicks Show More
- Voucher system applies discounts correctly based on type and minimum amount requirements
- Redeem code system allows users to purchase and apply redeem codes correctly
- Redeem Code Product page displays product images and redeem codes correctly
- Checkout process functions correctly with all required fields and validations
- User proceeds to /payment page after completing checkout page
- Payment page is fully responsive and displays correctly on all devices
- Payment page displays order summary and payment method selection
- User can enter Bkash or Nagad payment information on payment page
- Terms and Agreement link on checkout page opens popup displaying full content
- Terms and Agreement popup is fully responsive and displays correctly on all devices
- Payment method restrictions are enforced for suspected and banned users
- Order management in admin panel displays all order information correctly with enhanced layout
- Enhanced order page provides improved organization and accessibility
- Order status updates trigger appropriate inbox notifications with unique colors
- Review system allows users to submit reviews with images
- Review filtering by star rating functions correctly
- Review sorting by helpfulness functions correctly
- Review image zoom functionality works on all devices
- Admin can manage reviews including delete and hide actions
- Admin can respond directly to customer reviews with rich text formatting
- Admin responses display below original reviews with admin badge/label
- Admin can edit and delete their responses
- Email notifications are sent to reviewers when admin responds
- Response templates are available for admin use
- Response time metrics are tracked
- Response status indicator is displayed in admin reviews list
- Customers can reply to admin responses creating conversation threads
- Conversation threads display correctly and are fully responsive
- Helpful voting system allows signed in users to mark reviews as helpful or not helpful
- Helpful vote count is displayed prominently on each review card
- Percentage of users who found the review helpful is displayed on each review card
- Users are prevented from voting multiple times on the same review
- Visual feedback animation is displayed when user clicks helpful button
- Users can sort reviews by helpfulness
- Most helpful reviews are highlighted with a badge or special styling
- Users can change their vote within a time window
- Admin can track helpful vote analytics in the admin dashboard
- System implements spam prevention to detect suspicious voting patterns
- Guest users and banned users cannot vote on review helpfulness
- Suspected users can vote on review helpfulness
- Chat system functions correctly for both users and admin
- Chat image upload and zoom functionality works reliably
- Chat notifications appear in user inbox and redirect correctly to chat page
- Quick reply management functions correctly for admin
- Invoice system displays correctly and is fully responsive
- Database manager is accessible and functional in admin panel
- All responsive design requirements are met across mobile, tablet, and desktop devices
- Text selection is disabled throughout the application
- All animations function smoothly and consistently
- Product sharing functionality works for all user types
- Random product display changes with each page refresh
- All admin panel features are accessible and optimized for mobile devices
- Revenue calculation excludes delivery charges
- All security requirements including row-level security are implemented
- Mobile touch gesture support is fully implemented and functional:
  - Swipe-to-delete gesture works correctly for cart items on mobile devices
  - Pull-to-refresh gesture works correctly for product lists on mobile devices
  - Pinch-to-zoom gesture works correctly for product images on mobile devices
  - All touch gestures provide smooth and responsive user experience
  - Touch gestures enhance mobile interface intuitiveness

## 21. Features Not Implemented in This Version

- Multi-language support
- Advanced analytics and reporting dashboard beyond helpful vote analytics
- Automated email marketing campaigns
- Loyalty points or rewards program
- Wishlist functionality
- Product comparison feature
- Advanced search filters and faceted search
- Social media integration beyond product sharing
- Live chat with automated chatbot responses
- Subscription-based products or recurring payments
- Gift card purchase by users (admin-managed redeem codes are implemented)
- Bulk order management tools
- Advanced inventory management with low stock alerts
- Integration with third-party shipping providers
- Customer segmentation and targeted promotions
- A/B testing for product pages or checkout flow
- Advanced fraud detection beyond user role management and voting spam prevention
- Multi-currency support
- Tax calculation and management
- Return and refund request workflow
- Product bundling or package deals
- Pre-order functionality
- Auction or bidding features
- Affiliate program management
- Advanced SEO tools and meta tag management
- Recent view history display in user profile