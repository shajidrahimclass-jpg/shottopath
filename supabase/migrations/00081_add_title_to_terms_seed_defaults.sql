
-- terms_and_conditions has version but not title — add title column
ALTER TABLE terms_and_conditions ADD COLUMN title text NOT NULL DEFAULT 'Terms and Conditions';

-- Seed default Terms and Conditions row
INSERT INTO terms_and_conditions (id, title, content, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Terms and Conditions',
  'Welcome to Shottopoth. By placing an order on our platform, you agree to the following terms and conditions.

1. Orders & Payments
   - All orders must be paid in full (or delivery charge for advance payment) before shipment.
   - We accept bKash, Nagad, and Cash on Delivery (COD).
   - Order confirmation is subject to product availability.

2. Delivery
   - Delivery timelines vary by location. Please refer to the delivery locations for estimated days.
   - Shottopoth is not responsible for delays caused by external factors.

3. Returns & Refunds
   - Products may be returned within 7 days of delivery if they are defective or not as described.
   - Refunds are processed within 5-7 business days after approval.

4. User Responsibilities
   - You must provide accurate delivery information. Shottopoth is not liable for failed deliveries due to incorrect addresses.
   - Account misuse or fraudulent activity will result in account suspension.

5. Privacy
   - We collect and use your data only to process orders and improve our services.
   - We do not share your personal data with third parties without your consent.

By placing an order, you confirm that you have read and agreed to these terms.',
  true,
  now(),
  now()
);

-- Seed default Refunds Policy row
INSERT INTO refunds_policy (id, title, content, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Refunds & Returns Policy',
  '<h2>Refunds &amp; Returns Policy</h2>
<p>At Shottopoth, customer satisfaction is our priority. Please read our refund and return policy carefully.</p>

<h3>Eligibility for Returns</h3>
<ul>
  <li>Items must be returned within <strong>7 days</strong> of delivery.</li>
  <li>Products must be unused, in original packaging, and in the same condition as received.</li>
  <li>Gift cards and digital products are non-refundable.</li>
</ul>

<h3>How to Request a Refund</h3>
<ol>
  <li>Contact our support team with your order number and reason for return.</li>
  <li>We will review your request within 2 business days.</li>
  <li>Approved returns must be shipped back within 3 days of approval.</li>
</ol>

<h3>Refund Processing</h3>
<p>Refunds are processed within <strong>5-7 business days</strong> after we receive the returned item. Refunds are issued via the original payment method (bKash, Nagad, or bank transfer for COD orders).</p>

<h3>Non-Refundable Items</h3>
<ul>
  <li>Gift cards and vouchers</li>
  <li>Items damaged due to customer misuse</li>
  <li>Products without original packaging</li>
</ul>

<p>For any questions, please contact our support team.</p>',
  true,
  now(),
  now()
);
