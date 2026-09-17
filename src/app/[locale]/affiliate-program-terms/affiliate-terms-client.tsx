'use client';

import Link from 'next/link';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CSSProperties, MouseEvent, ReactNode, useEffect, useMemo, useRef } from 'react';

const summaryCards = [
  {
    title: '20% Commission',
    text: 'Approved affiliates may earn 20% commission on qualifying eligible product or membership sales.',
    icon: '%',
    tone: 'text-emerald-200',
  },
  {
    title: 'Eligible Products',
    text: 'Commissions may apply to approved AI video prompt collections, digital products, memberships, subscriptions, bundles, and special offers.',
    icon: '[]',
    tone: 'text-cyan-200',
  },
  {
    title: 'Net Revenue',
    text: 'Commissions are calculated from net revenue after refunds, discounts, taxes, chargebacks, payment processing fees, credits, and fraud adjustments.',
    icon: '$',
    tone: 'text-amber-200',
  },
  {
    title: 'Clear Disclosures',
    text: 'Affiliates must clearly disclose their affiliate relationship whenever promoting Prompt Studio links, products, or memberships.',
    icon: 'OK',
    tone: 'text-blue-200',
  },
  {
    title: 'Fair Promotion',
    text: 'Affiliates must avoid spam, misleading claims, fake traffic, cookie stuffing, unauthorized coupons, and prohibited ad methods.',
    icon: '!',
    tone: 'text-fuchsia-200',
  },
  {
    title: 'Tracked Referrals',
    text: 'Sales must be properly tracked through valid affiliate links, referral codes, or approved affiliate systems.',
    icon: '->',
    tone: 'text-violet-200',
  },
];

const steps = [
  {
    title: 'Apply and Get Approved',
    text: 'Submit your affiliate information and receive approval to join the Prompt Studio Affiliate Program.',
  },
  {
    title: 'Share Your Affiliate Link',
    text: 'Promote eligible Prompt Studio products and memberships using your valid affiliate link or referral code.',
  },
  {
    title: 'Earn Commissions',
    text: 'Earn 20% commission on qualifying sales that are properly tracked, paid, and not refunded, disputed, or charged back.',
  },
];

const trustItems = [
  'Clear 20% Commission',
  'Transparent Tracking',
  'Honest Promotions',
  'Required Affiliate Disclosures',
  'Fraud Prevention',
  'Brand Protection',
  'Secure Payout Process',
  'Compliance First',
];

type TermSection = {
  title: string;
  body: string[];
  bullets?: string[];
  numbered?: string[];
};

const termSections: TermSection[] = [
  {
    title: 'Introduction',
    body: [
      'These Affiliate Program Terms govern your participation in the Prompt Studio Affiliate Program.',
      'Prompt Studio is operated by Magzin LLC. By applying to, joining, or participating in the Prompt Studio Affiliate Program, you agree to these Affiliate Terms, our Terms of Use, Privacy Policy, and any other policies or guidelines we provide.',
      'If you do not agree to these Affiliate Terms, you may not participate in the Prompt Studio Affiliate Program.',
    ],
  },
  {
    title: 'Company Information',
    body: [
      'Magzin LLC, 800 Third Avenue Associates, New York, NY 10022, United States.',
      'Contact: user@example.com',
      'Copyright 2026 Prompt Studio. All rights reserved.',
    ],
  },
  {
    title: 'About Prompt Studio',
    body: [
      'Prompt Studio is a marketplace for AI video prompts.',
      'Our platform helps users gather inspiration, explore examples, discover high-quality prompt collections, and create stunning videos with AI.',
      'The Prompt Studio Affiliate Program allows approved affiliates to promote eligible Prompt Studio products, memberships, or offers and earn commissions on qualifying sales.',
    ],
  },
  {
    title: 'Affiliate Program Overview',
    body: [
      'Approved affiliates may receive a unique affiliate link, referral code, tracking link, dashboard, or other promotional tools.',
      'When a customer purchases an eligible Prompt Studio product or membership through your valid affiliate link, you may earn a commission, subject to these Affiliate Terms.',
      'Participation in the affiliate program is not guaranteed. We reserve the right to approve, reject, suspend, or terminate any affiliate account at our discretion.',
    ],
  },
  {
    title: 'Eligibility',
    body: [
      'To participate in the Prompt Studio Affiliate Program, you must meet the program requirements and promote Prompt Studio truthfully, professionally, and lawfully.',
      'We may reject or remove affiliates whose websites, social accounts, email lists, advertising methods, or promotional channels are inconsistent with our brand, values, legal requirements, or business interests.',
    ],
    numbered: [
      'Be at least 18 years old.',
      'Provide accurate and complete information.',
      'Have the legal authority to enter into these Affiliate Terms.',
      'Comply with all applicable laws, rules, and regulations.',
      'Comply with these Affiliate Terms and all Prompt Studio policies.',
      'Promote Prompt Studio in a truthful, professional, and lawful manner.',
    ],
  },
  {
    title: 'Application and Approval',
    body: [
      'To become an affiliate, you may be required to submit an application or create an affiliate account.',
      'Submitting an application does not guarantee acceptance.',
      'We may approve, reject, suspend, or remove affiliates at any time, with or without notice.',
    ],
    bullets: [
      'Name and email address.',
      'Website and social media profiles.',
      'Audience type and promotional methods.',
      'Payment information and tax information where required.',
      'Previous affiliate or marketing experience.',
    ],
  },
  {
    title: 'Commission Rate',
    body: [
      'Unless otherwise stated in writing, approved affiliates may earn a commission equal to 20% of net revenue from qualifying sales of eligible Prompt Studio products or memberships.',
      'Net revenue means the amount actually received by Prompt Studio from a qualifying sale after deductions.',
      'Commissions are calculated only on eligible sales that are successfully tracked, paid, and not refunded, canceled, disputed, or charged back.',
    ],
    bullets: [
      'Discounts, refunds, chargebacks, and taxes.',
      'Payment processing fees, platform fees, credits, and coupons.',
      'Fraud adjustments, currency conversion costs, and other transaction-related deductions.',
    ],
  },
  {
    title: 'Eligible Products and Memberships',
    body: [
      'Eligible products may include AI video prompt collections, digital prompt products, marketplace products, Prompt Studio memberships, subscriptions, bundles, special offers, and other products or services we designate as eligible.',
      'Not all products, memberships, subscriptions, promotions, or offers may qualify for affiliate commissions.',
      'We reserve the right to add, remove, exclude, or modify eligible products at any time.',
    ],
  },
  {
    title: 'Qualifying Sales',
    body: [
      'A sale may qualify for commission only if the customer uses a valid affiliate link or referral code, the sale is properly tracked, payment is completed, the product is eligible, and the transaction is not refunded, canceled, disputed, fraudulent, or charged back.',
      'You must comply with these Affiliate Terms, and the sale must occur within the applicable tracking period, if any.',
      'We are not responsible for lost commissions caused by tracking errors, deleted cookies, browser restrictions, ad blockers, privacy settings, incorrect links, technical failures, or failure to use the correct affiliate link.',
    ],
  },
  {
    title: 'Tracking and Attribution',
    body: [
      'Prompt Studio may use cookies, referral codes, tracking links, affiliate software, analytics tools, or other systems to track affiliate referrals.',
      'Commission attribution will be determined by our tracking system.',
      'If multiple affiliates refer the same customer, the commission may be awarded according to our tracking rules, such as last-click attribution, first-click attribution, coupon attribution, or another method used by our affiliate platform.',
      'Our records and tracking system will be the final authority for determining commissions.',
    ],
  },
  {
    title: 'Commission Payments',
    body: [
      'Affiliate commissions may be paid through the payment method supported by Prompt Studio or our affiliate platform.',
      'Payouts may require accurate payment information, tax forms, minimum payout thresholds, fraud prevention reviews, legal compliance, and an active compliant affiliate account.',
      'We may delay payouts during refund periods, fraud reviews, chargeback windows, compliance checks, or technical reviews.',
      'If a qualifying transaction is refunded, canceled, reversed, disputed, charged back, or found to be fraudulent, any related commission may be deducted, canceled, reversed, or withheld.',
    ],
  },
  {
    title: 'Minimum Payout Threshold',
    body: [
      'Prompt Studio may establish a minimum payout threshold.',
      'If your approved commissions do not meet the minimum payout threshold, the amount may roll over to a future payout period.',
      'We may change payout thresholds, payout schedules, and payment methods at any time.',
    ],
  },
  {
    title: 'Taxes',
    body: [
      'You are solely responsible for any taxes, duties, reporting obligations, or government charges related to commissions you receive.',
      'Prompt Studio may request tax forms or payment information before issuing payouts.',
      'We may withhold payments if required by law or if you fail to provide required tax or payment information.',
      'Participation in the affiliate program does not make you an employee of Magzin LLC or Prompt Studio.',
    ],
  },
  {
    title: 'Affiliate Disclosure Requirements',
    body: [
      'You must clearly disclose your affiliate relationship whenever you promote Prompt Studio products, memberships, links, or offers.',
      'Your disclosure must be clear, visible, and understandable to your audience.',
      'Disclosures must be placed near the affiliate link or promotional claim. They must not be hidden in a footer, terms page, profile bio only, or behind unclear language.',
      'You are responsible for complying with all advertising, endorsement, influencer, email marketing, and disclosure laws that apply to your promotional activities.',
    ],
    bullets: [
      'I may earn a commission if you purchase through my link.',
      'This post contains affiliate links.',
      'As a Prompt Studio affiliate, I may receive a commission from qualifying purchases.',
    ],
  },
  {
    title: 'Approved Promotional Methods',
    body: [
      'Affiliates may promote Prompt Studio through lawful and ethical channels, including websites, blogs, YouTube videos, social posts, newsletters, educational content, tutorials, reviews, creator communities, paid ads if approved, webinars, podcasts, online courses, and communities where permitted.',
      'Your promotions must be honest, accurate, and not misleading.',
      'You may not imply that you are an employee, owner, official representative, or exclusive partner of Prompt Studio unless we give you written permission.',
    ],
  },
  {
    title: 'Prohibited Promotional Activities',
    body: [
      'You must not engage in prohibited activity. Violation of this section may result in immediate suspension, termination, commission reversal, withheld payouts, or legal action.',
    ],
    numbered: [
      'Making false, misleading, exaggerated, or deceptive claims.',
      'Guaranteeing income, results, views, engagement, sales, viral content, or AI output quality.',
      'Sending spam, unsolicited messages, or using purchased email lists.',
      'Using bots, fake traffic, fake accounts, automated clicks, cookie stuffing, forced clicks, hidden links, or misleading redirects.',
      'Creating self-referrals or purchasing through your own affiliate link unless expressly permitted.',
      'Bidding on Prompt Studio, Magzin LLC, or confusingly similar brand terms without written permission.',
      'Using our brand name in domains, social handles, app names, ads, or usernames without permission.',
      'Impersonating Prompt Studio or Magzin LLC, copying our experience in a misleading way, or harming our reputation.',
      'Offering unauthorized discounts, coupons, bonuses, rebates, or incentives.',
      'Violating third-party platform rules or promoting us on illegal, hateful, violent, adult, defamatory, infringing, fraudulent, or misleading channels.',
    ],
  },
  {
    title: 'Paid Advertising Rules',
    body: [
      'You may not run paid advertising using Prompt Studio brand names, trademarks, domain names, product names, or confusingly similar terms without prior written permission.',
      'This includes paid ads on Google Ads, Bing Ads, Meta Ads, TikTok Ads, YouTube Ads, X/Twitter Ads, LinkedIn Ads, Pinterest Ads, Reddit Ads, display networks, native ad networks, and other advertising platforms.',
      'You may not direct-link paid ads to Prompt Studio using your affiliate link unless we approve it in writing.',
      'If paid advertising is allowed, your ads must be truthful, compliant, properly disclosed, and must not misrepresent Prompt Studio.',
    ],
  },
  {
    title: 'Email Marketing Rules',
    body: [
      'If you promote Prompt Studio by email, you must only email people who have lawfully opted in, clearly identify yourself as the sender, avoid deceptive subject lines or headers, include required disclosures, provide unsubscribe options where legally required, honor unsubscribe requests promptly, comply with applicable email marketing laws, and not represent that your emails are sent by Prompt Studio unless authorized.',
      'You are solely responsible for your email marketing compliance.',
    ],
  },
  {
    title: 'Social Media and Influencer Promotions',
    body: [
      'If you promote Prompt Studio on social media, video platforms, podcasts, newsletters, or influencer channels, you must disclose your affiliate relationship clearly.',
      'Disclosures should be easy to notice and understand, and should appear in the post, video description, caption, or spoken content where appropriate.',
    ],
    bullets: ['Affiliate link.', 'Paid affiliate.', 'I may earn a commission.', 'Partner link.'],
  },
  {
    title: 'Content and Brand Guidelines',
    body: [
      'We may provide logos, graphics, copy, banners, screenshots, product images, or other marketing materials.',
      'You may use approved materials only to promote Prompt Studio in accordance with these Affiliate Terms.',
      'We may require you to remove or update any promotional material at any time.',
    ],
    numbered: [
      'Do not modify our logo in a misleading or harmful way.',
      'Do not use our branding to imply ownership or official representation.',
      'Do not register domains, usernames, accounts, or trademarks containing Prompt Studio, Magzin LLC, or confusingly similar terms.',
      'Do not use our branding in illegal, offensive, deceptive, or low-quality promotions.',
      'Do not copy our website design in a way that confuses users.',
    ],
  },
  {
    title: 'No Earnings Guarantee',
    body: [
      'We do not guarantee that you will earn any commissions or income from the affiliate program.',
      'Your results may vary based on audience, promotional methods, traffic quality, content quality, compliance, and market conditions.',
      'You must not make income claims, earnings claims, or performance claims unless they are truthful, substantiated, and properly disclosed.',
    ],
  },
  {
    title: 'Refunds, Chargebacks, and Reversals',
    body: [
      'If a referred customer receives a refund, cancels a membership, disputes a charge, requests a chargeback, or the transaction is reversed for any reason, any related commission may be canceled or deducted from your current or future commissions.',
      'We may also reverse commissions for fraudulent transactions, duplicate transactions, accidental purchases, unauthorized purchases, tracking abuse, policy violations, self-referrals, suspicious activity, and non-compliant promotions.',
    ],
  },
  {
    title: 'Fraud Prevention',
    body: [
      'We reserve the right to review affiliate activity for fraud, abuse, unusual patterns, or policy violations.',
      'We may withhold, delay, reduce, reverse, or deny commissions if we believe activity is suspicious, fraudulent, abusive, or non-compliant.',
    ],
    bullets: [
      'Unusually high refund rates, fake leads, or fake customers.',
      'Repeated purchases from the same person or device.',
      'Artificial clicks or incentivized clicks without approval.',
      'Misleading landing pages, unauthorized coupon use, self-referrals, or traffic from prohibited sources.',
    ],
  },
  {
    title: 'Termination',
    body: [
      'Either you or Prompt Studio may end your participation in the affiliate program at any time.',
      'We may suspend or terminate your affiliate account immediately if you violate these Affiliate Terms, engage in fraud, harm our brand, violate laws, or misuse the program.',
      'Termination does not limit our right to recover damages or enforce these Affiliate Terms.',
    ],
    numbered: [
      'Stop using affiliate links.',
      'Stop using Prompt Studio marketing materials.',
      'Remove or update promotional content if requested.',
      'Understand that unpaid commissions may be withheld, canceled, or paid depending on compliance, tracking, refund status, and legal requirements.',
      'Sections that should survive termination will continue to apply.',
    ],
  },
  {
    title: 'Independent Contractor Relationship',
    body: [
      'You are an independent contractor.',
      'Nothing in these Affiliate Terms creates an employment, agency, partnership, franchise, joint venture, fiduciary, or representative relationship between you and Magzin LLC or Prompt Studio.',
      'You have no authority to bind Prompt Studio, make promises on our behalf, or represent yourself as our employee or official representative.',
    ],
  },
  {
    title: 'Confidentiality',
    body: [
      'You may receive non-public information related to Prompt Studio, including affiliate dashboards, commission data, promotional strategies, beta features, private offers, product plans, or business information.',
      'You agree not to disclose confidential information without our written permission.',
      'This obligation continues after your participation in the affiliate program ends.',
    ],
  },
  {
    title: 'Privacy and Data Protection',
    body: [
      'You must comply with all applicable privacy, data protection, advertising, and email marketing laws when promoting Prompt Studio.',
      'If you collect personal information from your audience, you are responsible for providing your own privacy policy, obtaining required consent, protecting personal information, complying with applicable laws, and not sharing personal information with Prompt Studio unless legally permitted.',
      'Prompt Studio collection and use of personal information is described in our Privacy Policy.',
    ],
  },
  {
    title: 'Intellectual Property',
    body: [
      'Prompt Studio, Magzin LLC, and their logos, trademarks, branding, content, designs, prompts, products, and materials are owned by or licensed to us.',
      'You receive a limited, revocable, non-exclusive, non-transferable license to use approved Prompt Studio marketing materials only for the purpose of promoting Prompt Studio as an affiliate.',
      'We may revoke this license at any time.',
      'You may not use our intellectual property in any way that is misleading, unauthorized, harmful, or outside the scope of these Affiliate Terms.',
    ],
  },
  {
    title: 'Disclaimers',
    body: [
      'The affiliate program is provided on an as is and as available basis.',
      'We do not guarantee uninterrupted affiliate tracking, error-free reporting, specific commission amounts, affiliate approval, continued product availability, continued program availability, or any level of income or earnings.',
      'We may modify, suspend, or discontinue the affiliate program at any time.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'To the maximum extent permitted by law, Magzin LLC, Prompt Studio, and their owners, officers, employees, contractors, affiliates, partners, licensors, and service providers will not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages, including lost profits, lost commissions, lost data, lost business, or reputational harm.',
      'To the maximum extent permitted by law, our total liability for any claim related to the affiliate program will not exceed the amount of unpaid, approved commissions owed to you for the three months before the claim arose.',
    ],
  },
  {
    title: 'Indemnification',
    body: [
      'You agree to defend, indemnify, and hold harmless Magzin LLC, Prompt Studio, and their owners, officers, employees, contractors, affiliates, partners, licensors, and service providers from and against claims, damages, losses, liabilities, costs, and expenses, including reasonable attorneys fees, arising from or related to your promotional activities, violations, websites, emails, ads, social posts, misleading claims, disclosure failures, intellectual property misuse, privacy handling, fraud, negligence, or misconduct.',
    ],
  },
  {
    title: 'Changes to the Affiliate Program',
    body: [
      'We may update, modify, suspend, or discontinue the affiliate program at any time.',
      'We may change commission rates, eligible products, payout schedules, payout thresholds, tracking rules, approval requirements, promotional rules, and these Affiliate Terms.',
      'If we make material changes, we may provide notice through email, the affiliate dashboard, the platform, or another reasonable method.',
      'Your continued participation in the affiliate program after changes become effective means you accept the updated terms.',
    ],
  },
  {
    title: 'Governing Law',
    body: [
      'These Affiliate Terms are governed by the laws of the State of New York, United States, without regard to conflict of law principles.',
      'You agree that any legal action or proceeding arising out of or related to these Affiliate Terms or the affiliate program will be brought in the state or federal courts located in New York County, New York, unless otherwise required by applicable law.',
    ],
  },
  {
    title: 'Entire Agreement',
    body: [
      'These Affiliate Terms, together with the Prompt Studio Terms of Use, Privacy Policy, and any written affiliate guidelines we provide, constitute the entire agreement between you and Magzin LLC regarding the Prompt Studio Affiliate Program.',
      'If any provision of these Affiliate Terms is found invalid or unenforceable, the remaining provisions will remain in full force and effect.',
      'Our failure to enforce any provision does not waive our right to enforce it later.',
    ],
  },
  {
    title: 'Contact Us',
    body: [
      'If you have questions about these Affiliate Program Terms, please contact Magzin LLC, 800 Third Avenue Associates, New York, NY 10022, United States.',
      'Email: user@example.com',
      'Copyright 2026 Prompt Studio. All rights reserved.',
    ],
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let tick = 0;
    let pointerX = 0;
    let pointerY = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const roundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const card = (x: number, y: number, w: number, h: number, title: string, accent: string) => {
      roundedRect(x, y, w, h, 18);
      const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
      gradient.addColorStop(0, 'rgba(32, 61, 138, 0.68)');
      gradient.addColorStop(1, 'rgba(11, 18, 45, 0.84)');
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 22;
      ctx.shadowColor = accent;
      ctx.strokeRect(x + 12, y + 12, w - 24, 1);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '600 13px sans-serif';
      ctx.fillText(title, x + 18, y + 28);
    };

    const draw = () => {
      tick += 0.012;
      ctx.clearRect(0, 0, width, height);
      const px = pointerX * 20;
      const py = pointerY * 14;

      const bg = ctx.createRadialGradient(width * 0.65 + px, height * 0.3 + py, 20, width * 0.55, height * 0.45, width * 0.8);
      bg.addColorStop(0, 'rgba(96,165,250,0.22)');
      bg.addColorStop(0.42, 'rgba(124,58,237,0.16)');
      bg.addColorStop(1, 'rgba(2,6,23,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const nodes = [
        [width * 0.18, height * 0.42],
        [width * 0.35, height * 0.27],
        [width * 0.51, height * 0.47],
        [width * 0.7, height * 0.25],
        [width * 0.82, height * 0.55],
      ];
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.32)';
      ctx.lineWidth = 1;
      nodes.forEach(([x, y], index) => {
        const [nx, ny] = nodes[(index + 1) % nodes.length];
        ctx.beginPath();
        ctx.moveTo(x + Math.sin(tick + index) * 10 + px, y + py);
        ctx.lineTo(nx + Math.cos(tick + index) * 10 + px, ny + py);
        ctx.stroke();
      });
      nodes.forEach(([x, y], index) => {
        ctx.beginPath();
        ctx.arc(x + Math.sin(tick + index) * 10 + px, y + py, 6, 0, Math.PI * 2);
        ctx.fillStyle = index % 2 ? 'rgba(167,139,250,0.95)' : 'rgba(34,211,238,0.95)';
        ctx.shadowBlur = 18;
        ctx.shadowColor = ctx.fillStyle.toString();
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      card(width * 0.08 + px, height * 0.22 + py, 150, 88, 'Referral Link', 'rgba(125,211,252,0.55)');
      card(width * 0.34 + px, height * 0.14 + py, 185, 118, 'Referral Dashboard', 'rgba(167,139,250,0.55)');
      card(width * 0.63 + px, height * 0.12 + py, 190, 108, '20% Commission', 'rgba(134,239,172,0.62)');
      card(width * 0.53 + px, height * 0.52 + py, 142, 116, 'Prompt Card', 'rgba(96,165,250,0.55)');
      card(width * 0.77 + px, height * 0.46 + py, 150, 132, 'Terms Secure', 'rgba(45,212,191,0.5)');

      ctx.fillStyle = 'rgba(134,239,172,0.96)';
      ctx.font = '800 54px sans-serif';
      ctx.fillText('20%', width * 0.66 + px, height * 0.2 + py + 46);
      ctx.fillStyle = 'rgba(226,232,240,0.92)';
      ctx.font = '600 14px sans-serif';
      ctx.fillText('commission', width * 0.67 + px, height * 0.2 + py + 70);

      for (let i = 0; i < 18; i += 1) {
        const x = ((i * 61 + tick * 120) % width) + Math.sin(tick + i) * 10;
        const y = (i * 37) % height;
        ctx.beginPath();
        ctx.arc(x, y, i % 3 === 0 ? 1.8 : 1, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(250,204,21,0.72)' : 'rgba(96,165,250,0.48)';
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - 0.5;
      pointerY = (event.clientY - rect.top) / rect.height - 0.5;
    };

    resize();
    draw();
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-slate-950/35 shadow-[0_30px_120px_rgba(37,99,235,0.24)] backdrop-blur-xl">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.58))]" />
      <div className="absolute bottom-6 left-6 right-6 grid gap-3 sm:grid-cols-3">
        {['Clicks 12,458', 'Conversions 1,246', 'Earnings $8,742'].map(item => (
          <div key={item} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-slate-100 backdrop-blur-md">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const styleRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = styleRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${(x * 7).toFixed(2)}deg`);
  };

  const reset = () => {
    const el = styleRef.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <div
      ref={styleRef}
      onMouseMove={onMouseMove}
      onMouseLeave={reset}
      style={{ transform: 'perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))' } as CSSProperties}
      className={
        'group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-transform duration-200 ' +
        className
      }
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-20 top-0 h-32 w-52 rotate-12 bg-cyan-300/10 blur-3xl transition-opacity group-hover:opacity-100" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ParallaxBand({
  children,
  className = '',
  id,
  tone = 'blue',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'blue' | 'violet' | 'emerald';
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [52, -52]);
  const x = useTransform(scrollYProgress, [0, 1], reduceMotion ? ['0%', '0%'] : ['-6%', '6%']);
  const toneClass = {
    blue: 'from-blue-500/20 via-transparent to-cyan-300/10',
    violet: 'from-violet-500/20 via-transparent to-fuchsia-400/10',
    emerald: 'from-emerald-300/15 via-transparent to-amber-200/10',
  }[tone];

  return (
    <section id={id} ref={ref} className={'relative overflow-hidden px-6 py-24 md:py-32 ' + className}>
      <motion.div
        style={{ y, x }}
        className={'pointer-events-none absolute left-1/2 top-0 h-full w-[min(86rem,94vw)] -translate-x-1/2 bg-gradient-to-br opacity-80 blur-3xl ' + toneClass}
      />
      <motion.div style={{ y }} className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="h-full bg-[linear-gradient(rgba(148,163,184,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.2)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(90deg,transparent,black_18%,black_82%,transparent)]" />
      </motion.div>
      <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  text,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={'mb-12 max-w-3xl ' + (align === 'center' ? 'mx-auto text-center' : '')}>
      {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/80">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">{title}</h2>
      {text && <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">{text}</p>}
    </div>
  );
}

export default function AffiliateTermsClient() {
  const toc = useMemo(() => termSections.map(section => ({ id: slugify(section.title), title: section.title })), []);

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.2),transparent_30%),linear-gradient(180deg,#020617,#030712_46%,#000)]" />
      <div className="fixed inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.32)_1px,transparent_1px)] [background-size:42px_42px]" />

      <Header />

      <main>
        <section className="relative px-6 pb-20 pt-36 md:pb-28 md:pt-40">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.86fr_1.14fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/8 px-4 py-2 text-sm font-semibold text-cyan-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
                Partner with Prompt Studio
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
                Affiliate Program Terms
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                Promote Prompt Studio, refer creators, and earn commissions on eligible AI video prompt products and memberships.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm font-medium text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Effective Date: January 1, 2026</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Last Updated: January 1, 2026</span>
              </div>
              <div className="mt-9 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => scrollToId('full-terms')}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-7 py-3.5 text-base font-bold text-white shadow-[0_0_38px_rgba(59,130,246,0.45)] transition hover:scale-[1.02]"
                >
                  Read Terms
                </button>
                <Link href="/affiliate-program" className="rounded-full border border-cyan-200/30 bg-black/30 px-7 py-3.5 text-base font-bold text-slate-100 backdrop-blur transition hover:border-cyan-200/70">
                  Become an Affiliate
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.1 }}>
              <HeroScene />
            </motion.div>
          </div>
        </section>

        <ParallaxBand className="pt-10" tone="blue">
          <SectionTitle
            title="Affiliate Program at a Glance"
            text="Everything affiliates need to know about promoting Prompt Studio and earning commissions in one transparent system."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map(card => (
              <TiltCard key={card.title}>
                <div className={'mb-8 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-xl font-black ' + card.tone}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{card.text}</p>
              </TiltCard>
            ))}
          </div>
        </ParallaxBand>

        <ParallaxBand tone="violet">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <SectionTitle
              align="left"
              eyebrow="How it works"
              title="From referral link to commission."
              text="A simple affiliate flow with compliance checks, clear attribution, and rules built to protect creators, customers, and the Prompt Studio marketplace."
            />
            <div className="grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => (
                <TiltCard key={step.title} className="min-h-64">
                  <span className="text-sm font-bold text-cyan-200">0{index + 1}</span>
                  <div className="my-8 h-24 rounded-3xl border border-cyan-200/15 bg-gradient-to-br from-cyan-300/10 to-violet-500/10 p-4">
                    <div className="h-full rounded-2xl bg-[linear-gradient(135deg,rgba(34,211,238,0.22),rgba(168,85,247,0.12))] shadow-[inset_0_0_24px_rgba(255,255,255,0.08)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
                </TiltCard>
              ))}
            </div>
          </div>
        </ParallaxBand>

        <ParallaxBand tone="emerald">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <TiltCard className="p-8 md:p-10">
              <div className="text-8xl font-black tracking-tight text-emerald-200 drop-shadow-[0_0_32px_rgba(110,231,183,0.42)]">20%</div>
              <h2 className="mt-4 text-3xl font-semibold text-white">Commission on Qualifying Sales</h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Approved affiliates may earn 20% of net revenue from eligible Prompt Studio product or membership sales.
                Net revenue means the amount actually received by Prompt Studio after deductions such as discounts,
                refunds, chargebacks, taxes, payment processing fees, credits, fraud adjustments, and other transaction-related costs.
              </p>
            </TiltCard>
            <div className="grid gap-5">
              {['Referral click tracked', 'Eligible product purchased', 'Refund window reviewed', 'Net revenue commission approved'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 text-sm font-bold text-cyan-100">{index + 1}</span>
                  <span className="font-semibold text-slate-100">{item}</span>
                  <span className="ml-auto hidden h-2 w-24 rounded-full bg-gradient-to-r from-blue-500 to-emerald-300 md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </ParallaxBand>

        <ParallaxBand id="full-terms" tone="blue" className="scroll-mt-24 overflow-visible">
          <SectionTitle
            eyebrow="Full Affiliate Program Terms"
            title="Readable policy, transparent rules."
            text="Use the table of contents to scan the complete terms. Each section is formatted for quick review without turning the page into a wall of legal text."
          />
          <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="max-h-[72vh] overflow-auto rounded-3xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">Contents</p>
                <nav className="grid gap-1">
                  {toc.map(item => (
                    <a key={item.id} href={'#' + item.id} className="rounded-2xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
            <div className="grid gap-5">
              {termSections.map((section, index) => (
                <motion.article
                  key={section.title}
                  id={slugify(section.title)}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.42 }}
                  className="scroll-mt-28 rounded-3xl border border-white/10 bg-slate-950/58 p-6 shadow-[0_22px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-8"
                >
                  <div className="mb-5 flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-200/8 text-sm font-bold text-cyan-100">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-2xl font-semibold tracking-tight text-white">{section.title}</h3>
                  </div>
                  <div className="space-y-4 text-sm leading-7 text-slate-300 md:text-base md:leading-8">
                    {section.body.map(paragraph => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.bullets && (
                      <ul className="grid gap-2">
                        {section.bullets.map(item => (
                          <li key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.numbered && (
                      <ol className="grid gap-2">
                        {section.numbered.map((item, itemIndex) => (
                          <li key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                            <span className="font-bold text-cyan-200">{itemIndex + 1}.</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </ParallaxBand>

        <ParallaxBand tone="violet">
          <SectionTitle
            title="Built for Fair and Transparent Partnerships"
            text="Prompt Studio protects affiliate integrity with disclosure-first promotion, attribution clarity, fraud prevention, and brand-safe collaboration standards."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map(item => (
              <TiltCard key={item} className="p-5">
                <div className="mb-5 h-2 w-16 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />
                <h3 className="text-lg font-semibold text-white">{item}</h3>
              </TiltCard>
            ))}
          </div>
        </ParallaxBand>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl rounded-[2.25rem] border border-cyan-200/15 bg-gradient-to-br from-blue-600/18 via-violet-600/12 to-emerald-400/10 p-8 text-center shadow-[0_32px_130px_rgba(59,130,246,0.22)] backdrop-blur-xl md:p-14">
            <h2 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">Ready to Grow with Prompt Studio?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Join the affiliate program, promote premium AI video prompt products, and earn commissions from qualifying referrals.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/affiliate-program" className="rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-7 py-3.5 font-bold text-white shadow-[0_0_38px_rgba(59,130,246,0.45)]">
                Become an Affiliate
              </Link>
              <a href="mailto:user@example.com" className="rounded-full border border-white/15 bg-black/30 px-7 py-3.5 font-bold text-white">
                Contact Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
