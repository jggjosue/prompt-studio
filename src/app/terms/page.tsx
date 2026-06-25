import type { Metadata } from 'next';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Terms of Use | Prompt Studio',
  description:
    'Read the Prompt Studio Terms of Use to learn about eligibility, accounts, purchases, digital products, memberships, affiliate program, licensing, copyright, disclaimers, and governing law.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsOfUsePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-4xl px-4 md:px-6">
          <div className="mb-12 border-b border-border/60 pb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
              Terms of Use
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <p>Effective Date: <span className="font-medium text-foreground">January 1, 2026</span></p>
              <p>Last Updated: <span className="font-medium text-foreground">January 1, 2026</span></p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-10 text-muted-foreground leading-relaxed">
            <section className="bg-muted/30 border border-border/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <p className="text-foreground font-medium text-lg leading-relaxed mb-4">
                Welcome to Prompt Studio.
              </p>
              <p className="mb-4">
                These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of Prompt Studio, a marketplace and digital platform offering AI video prompts, examples, inspiration, digital content, memberships, affiliate opportunities, and related services.
              </p>
              <p>
                Prompt Studio is operated by Magzin LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
              </p>
              
              <div className="mt-6 border-t border-border/60 pt-6 grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Company Information</h4>
                  <p>Magzin LLC</p>
                  <p>800 Third Avenue Associates</p>
                  <p>New York, NY 10022</p>
                  <p>United States</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Contact</h4>
                  <p>
                    Email:{' '}
                    <a href="mailto:support@prompstudio.com" className="text-primary hover:underline">
                      support@prompstudio.com
                    </a>
                  </p>
                </div>
              </div>
              
              <p className="mt-6 text-sm italic">
                By accessing or using Prompt Studio, creating an account, purchasing a product, joining a membership, submitting content, or participating in our affiliate program, you agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use Prompt Studio.
              </p>
            </section>

            <hr className="border-border/60" />

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">1</span>
                About Prompt Studio
              </h2>
              <p>
                Prompt Studio is your ultimate collection of AI video prompts. The platform allows users to gather inspiration, explore examples, purchase or access AI video prompt collections, and create stunning videos with AI tools.
              </p>
              <p>Prompt Studio may include, without limitation:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI video prompts;</li>
                <li>prompt collections;</li>
                <li>digital downloads;</li>
                <li>memberships;</li>
                <li>examples and inspiration materials;</li>
                <li>marketplace listings;</li>
                <li>affiliate links or affiliate products;</li>
                <li>creator, seller, or partner content;</li>
                <li>educational or promotional materials;</li>
                <li>account-based features.</li>
              </ul>
              <p>We may modify, expand, limit, suspend, or discontinue any part of Prompt Studio at any time.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">2</span>
                Eligibility
              </h2>
              <p>You must be at least 18 years old, or the age of majority in your jurisdiction, to use Prompt Studio.</p>
              <p>By using the platform, you represent and warrant that:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>you have the legal authority to enter into these Terms;</li>
                <li>the information you provide is accurate and complete;</li>
                <li>you will comply with all applicable laws and regulations;</li>
                <li>you will not use Prompt Studio for unlawful, harmful, deceptive, or abusive purposes.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">3</span>
                Accounts and Authentication
              </h2>
              <p>To access certain features, you may need to create an account.</p>
              <p>Prompt Studio uses third-party authentication services, including Clerk, to allow users to sign in through methods such as Google authentication or email and password.</p>
              <p>You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>maintaining the confidentiality of your login credentials;</li>
                <li>all activity that occurs under your account;</li>
                <li>keeping your account information accurate and updated;</li>
                <li>notifying us immediately if you suspect unauthorized access.</li>
              </ul>
              <p>We are not responsible for losses caused by unauthorized access to your account unless required by applicable law.</p>
              <p>We may suspend, restrict, or terminate your account if we believe you have violated these Terms, misused the platform, engaged in fraud, or created risk for Prompt Studio, users, partners, or third parties.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">4</span>
                Email Collection and Marketing Communications
              </h2>
              <p>When you create an account, purchase a product, join a membership, participate in the affiliate program, or otherwise interact with Prompt Studio, we may collect your email address.</p>
              <p>We may use your email address to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>create and manage your account;</li>
                <li>send transactional messages;</li>
                <li>deliver purchased products or membership-related updates;</li>
                <li>provide customer support;</li>
                <li>send promotional or marketing communications about Prompt Studio products, memberships, updates, offers, and related services.</li>
              </ul>
              <p>By providing your email address, you agree that we may send you emails related to your account and, where permitted by law, marketing communications.</p>
              <p>
                You may unsubscribe from marketing emails by using the unsubscribe link included in those emails or by contacting us at{' '}
                <a href="mailto:support@prompstudio.com" className="text-primary hover:underline">
                  support@prompstudio.com
                </a>
                . Even if you unsubscribe from marketing emails, we may still send you non-promotional messages related to your account, purchases, security, legal notices, or service updates.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">5</span>
                Purchases, Digital Products, and Memberships
              </h2>
              <p>Prompt Studio may offer digital products, AI prompt collections, memberships, subscriptions, access plans, or other paid content.</p>
              <p>Prices, features, availability, and product descriptions may change at any time.</p>
              <p>By making a purchase, you agree to:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>provide accurate billing and payment information;</li>
                <li>pay all applicable fees, taxes, and charges;</li>
                <li>comply with any additional terms presented at checkout;</li>
                <li>use the purchased content only as allowed under these Terms.</li>
              </ol>
              <p>All purchases are subject to acceptance. We may refuse, cancel, or limit any order at our discretion, including in cases of suspected fraud, pricing errors, technical issues, abuse, or violation of these Terms.</p>
              <p>Unless otherwise stated at checkout or required by applicable law, digital product purchases may be final and non-refundable once access has been granted, the product has been downloaded, or the digital content has been delivered.</p>
              <p>Memberships may renew automatically if clearly disclosed at the time of purchase. You are responsible for reviewing the membership terms before subscribing. You may cancel your membership according to the cancellation method provided through the platform or by contacting support.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">6</span>
                Affiliate Program
              </h2>
              <p>Prompt Studio may allow users to participate in an affiliate program.</p>
              <p>Approved affiliates may earn a commission when they refer qualified sales of eligible Prompt Studio products or memberships.</p>
              <p>Unless otherwise stated in writing, the standard affiliate commission is 20% of the net revenue received by Prompt Studio from a qualifying sale of an eligible product or membership.</p>
              <p>&ldquo;Net revenue&rdquo; means the amount actually received by Prompt Studio after discounts, refunds, chargebacks, payment processing fees, taxes, credits, fraud adjustments, or other deductions.</p>
              <p>Affiliate commissions may be subject to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>approval of the affiliate account;</li>
                <li>tracking accuracy;</li>
                <li>fraud prevention review;</li>
                <li>minimum payout thresholds;</li>
                <li>payment processor requirements;</li>
                <li>tax documentation;</li>
                <li>refund or chargeback periods;</li>
                <li>compliance with these Terms and applicable laws.</li>
              </ul>
              <p>Prompt Studio reserves the right to approve, reject, suspend, or terminate any affiliate account at any time.</p>
              <p>Affiliates must not:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>make false, misleading, exaggerated, or deceptive claims;</li>
                <li>spam users or send unsolicited messages;</li>
                <li>use illegal advertising methods;</li>
                <li>impersonate Prompt Studio or Magzin LLC;</li>
                <li>bid on protected brand terms in paid search without written permission;</li>
                <li>use fake accounts, self-referrals, bots, cookie stuffing, or fraudulent methods;</li>
                <li>promote Prompt Studio on websites or channels involving illegal, hateful, adult, violent, misleading, or infringing content;</li>
                <li>hide or fail to disclose affiliate relationships where disclosure is legally required.</li>
              </ol>
              <p>Affiliates are responsible for clearly disclosing their affiliate relationship when promoting Prompt Studio products or memberships. A disclosure should be clear, visible, and understandable, such as: &ldquo;I may earn a commission if you purchase through my link.&rdquo;</p>
              <p>We may withhold, reverse, or cancel commissions if we believe a sale resulted from fraud, abuse, refund, chargeback, policy violation, or non-compliant promotion.</p>
              <p>Participation in the affiliate program does not create an employment, partnership, joint venture, franchise, agency, or representative relationship between you and Prompt Studio.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">7</span>
                License to Use Prompt Studio Content
              </h2>
              <p>Subject to your compliance with these Terms and payment of any applicable fees, Prompt Studio grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use purchased or available content for personal or commercial creative use, unless otherwise stated on the product page.</p>
              <p>You may use prompts to generate AI videos, creative assets, concepts, or related works, provided that your use complies with applicable laws, third-party AI tool terms, and these Terms.</p>
              <p>Unless expressly permitted, you may not:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>resell Prompt Studio prompts as standalone prompt products;</li>
                <li>redistribute, copy, share, leak, sublicense, or publish paid Prompt Studio content;</li>
                <li>create a competing prompt marketplace or database using Prompt Studio content;</li>
                <li>scrape, download, or extract content at scale;</li>
                <li>remove copyright notices or branding;</li>
                <li>claim ownership of Prompt Studio content as your original prompt collection;</li>
                <li>use Prompt Studio content to train, fine-tune, or build competing AI systems or datasets without written permission.</li>
              </ol>
              <p>All rights not expressly granted are reserved by Prompt Studio and Magzin LLC.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">8</span>
                User Content
              </h2>
              <p>You may have the ability to submit, upload, publish, share, or provide content to Prompt Studio, including prompts, text, descriptions, images, examples, comments, feedback, reviews, or other materials (&ldquo;User Content&rdquo;).</p>
              <p>You retain ownership of your User Content, but by submitting it to Prompt Studio, you grant Magzin LLC a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to use, host, store, copy, reproduce, modify, display, publish, distribute, promote, and create derivative works from your User Content for operating, improving, marketing, and promoting Prompt Studio.</p>
              <p>You represent and warrant that:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>you own or have the necessary rights to your User Content;</li>
                <li>your User Content does not infringe any intellectual property, privacy, publicity, or other rights;</li>
                <li>your User Content does not contain unlawful, harmful, defamatory, deceptive, obscene, or abusive material;</li>
                <li>your User Content complies with these Terms and applicable laws.</li>
              </ol>
              <p>We may remove, reject, edit, restrict, or disable access to User Content at our discretion.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">9</span>
                Marketplace Content and Third-Party Content
              </h2>
              <p>Prompt Studio may include marketplace listings, affiliate products, third-party tools, external links, creator content, or references to third-party AI platforms.</p>
              <p>We do not guarantee that third-party products, tools, platforms, or services will be accurate, available, secure, suitable, or error-free.</p>
              <p>Your use of third-party tools, including AI video generation tools, may be subject to separate terms, privacy policies, payment rules, and usage restrictions from those third parties.</p>
              <p>Prompt Studio is not responsible for third-party services, content, outputs, errors, policies, or damages.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">10</span>
                AI-Generated Outputs
              </h2>
              <p>Prompt Studio provides prompts and related content that may be used with AI tools. We do not control the final output generated by third-party AI systems.</p>
              <p>You are solely responsible for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>reviewing AI-generated content before publication or commercial use;</li>
                <li>ensuring your outputs comply with applicable laws;</li>
                <li>verifying that generated content does not infringe third-party rights;</li>
                <li>complying with the terms of any AI platform you use;</li>
                <li>obtaining permissions, releases, or licenses when needed.</li>
              </ul>
              <p>We do not guarantee that prompts will produce specific results, viral videos, income, sales, engagement, or commercial success.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">11</span>
                Acceptable Use
              </h2>
              <p>You agree not to use Prompt Studio to:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>violate any law, regulation, contract, or third-party right;</li>
                <li>infringe copyrights, trademarks, trade secrets, privacy rights, publicity rights, or other intellectual property rights;</li>
                <li>upload or distribute malware, viruses, or harmful code;</li>
                <li>scrape, crawl, harvest, or extract platform data without permission;</li>
                <li>interfere with platform security or functionality;</li>
                <li>attempt to reverse engineer or bypass access restrictions;</li>
                <li>create fake accounts or misrepresent your identity;</li>
                <li>engage in fraud, spam, phishing, or deceptive activity;</li>
                <li>harass, threaten, abuse, or harm others;</li>
                <li>promote illegal, hateful, exploitative, sexually explicit, violent, or harmful content;</li>
                <li>use Prompt Studio content to build a competing product or service without written permission;</li>
                <li>abuse the affiliate program or payment systems.</li>
              </ol>
              <p>We may investigate suspected violations and take action, including removing content, withholding payments, suspending access, terminating accounts, or reporting unlawful activity.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">12</span>
                Intellectual Property
              </h2>
              <p>Prompt Studio, including its name, logo, branding, design, software, website, prompts, content, databases, text, images, graphics, videos, product structure, and related materials, is owned by or licensed to Magzin LLC and is protected by intellectual property laws.</p>
              <p>Except for the limited rights expressly granted in these Terms, no rights are transferred to you.</p>
              <p>You may not use the Prompt Studio name, logo, trademarks, branding, or copyrighted materials without our prior written permission.</p>
              <p className="font-semibold text-foreground">&copy; 2026 Prompt Studio. All rights reserved.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">13</span>
                Copyright Complaints
              </h2>
              <p>
                If you believe that content on Prompt Studio infringes your copyright, you may contact us at:{' '}
                <a href="mailto:support@prompstudio.com" className="text-primary hover:underline">
                  support@prompstudio.com
                </a>
              </p>
              <p>Please include:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>your name and contact information;</li>
                <li>a description of the copyrighted work;</li>
                <li>the URL or location of the allegedly infringing content;</li>
                <li>a statement that you have a good faith belief that the use is unauthorized;</li>
                <li>a statement that the information you provide is accurate;</li>
                <li>your physical or electronic signature.</li>
              </ol>
              <p>We may remove or disable access to allegedly infringing content and may terminate repeat infringers where appropriate.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">14</span>
                No Professional Advice
              </h2>
              <p>Prompt Studio may provide educational, creative, marketing, or business-related materials. Such materials are provided for general informational and creative purposes only.</p>
              <p>Prompt Studio does not provide legal, financial, tax, investment, business, or professional advice. You are responsible for obtaining professional advice before making decisions based on content from the platform.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">15</span>
                Disclaimers
              </h2>
              <p>Prompt Studio is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.</p>
              <p>To the maximum extent permitted by law, Magzin LLC disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, title, non-infringement, accuracy, availability, and uninterrupted operation.</p>
              <p>We do not warrant that:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Prompt Studio will be uninterrupted, secure, or error-free;</li>
                <li>any content will be accurate, complete, or current;</li>
                <li>prompts will generate specific results;</li>
                <li>AI outputs will be original, lawful, non-infringing, or commercially successful;</li>
                <li>defects or errors will be corrected.</li>
              </ol>
              <p>You use Prompt Studio at your own risk.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">16</span>
                Limitation of Liability
              </h2>
              <p>To the maximum extent permitted by law, Magzin LLC, Prompt Studio, and their owners, officers, employees, contractors, affiliates, partners, licensors, and service providers will not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages, including lost profits, lost revenue, lost data, lost goodwill, business interruption, or damages arising from AI-generated outputs.</p>
              <p>To the maximum extent permitted by law, our total liability for any claim arising out of or related to these Terms or Prompt Studio will not exceed the greater of:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>the amount you paid to Prompt Studio in the three months before the claim arose; or</li>
                <li>USD $100.</li>
              </ol>
              <p>Some jurisdictions do not allow certain limitations of liability, so some limitations may not apply to you.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">17</span>
                Indemnification
              </h2>
              <p>You agree to defend, indemnify, and hold harmless Magzin LLC, Prompt Studio, and their owners, officers, employees, contractors, affiliates, partners, licensors, and service providers from and against any claims, damages, losses, liabilities, costs, and expenses, including reasonable attorneys&rsquo; fees, arising from or related to:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>your use of Prompt Studio;</li>
                <li>your violation of these Terms;</li>
                <li>your User Content;</li>
                <li>your AI-generated outputs;</li>
                <li>your violation of any law or third-party rights;</li>
                <li>your affiliate marketing activities;</li>
                <li>your misuse of Prompt Studio content.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">18</span>
                Termination
              </h2>
              <p>We may suspend, restrict, or terminate your access to Prompt Studio at any time if we believe you violated these Terms, created risk, engaged in fraud, or misused the platform.</p>
              <p>You may stop using Prompt Studio at any time.</p>
              <p>Upon termination, your right to access the platform and any account-based services will end. Sections that by their nature should survive termination will continue to apply, including intellectual property, payment obligations, disclaimers, limitation of liability, indemnification, dispute resolution, and governing law.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">19</span>
                Changes to the Terms
              </h2>
              <p>We may update these Terms from time to time.</p>
              <p>When we make changes, we may update the &ldquo;Last Updated&rdquo; date or notify users through the platform or by email. Your continued use of Prompt Studio after changes become effective means you accept the updated Terms.</p>
              <p>If you do not agree to the updated Terms, you must stop using Prompt Studio.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">20</span>
                Governing Law
              </h2>
              <p>These Terms are governed by the laws of the State of New York, United States, without regard to conflict of law principles.</p>
              <p>Subject to the dispute resolution section below, you agree that any legal action or proceeding arising out of or related to these Terms or Prompt Studio will be brought in the state or federal courts located in New York County, New York.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">21</span>
                Dispute Resolution
              </h2>
              <p>
                Before filing a claim, you agree to first contact us at{' '}
                <a href="mailto:support@prompstudio.com" className="text-primary hover:underline">
                  support@prompstudio.com
                </a>{' '}
                and attempt to resolve the dispute informally.
              </p>
              <p>If a dispute cannot be resolved informally, either party may pursue available legal remedies in accordance with applicable law.</p>
              <p>At our discretion, we may require certain disputes to be resolved through binding individual arbitration where permitted by law and where properly disclosed to you. Any arbitration terms, class action waiver, or jury trial waiver should be separately reviewed and approved by legal counsel before implementation.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">22</span>
                Privacy
              </h2>
              <p>Your use of Prompt Studio is also subject to our Privacy Policy.</p>
              <p>Our Privacy Policy should explain how we collect, use, disclose, store, and protect personal information, including email addresses, account information, authentication data, marketing preferences, payment-related information, and affiliate-related information.</p>
              <p>By using Prompt Studio, you acknowledge that we may process personal information as described in our Privacy Policy.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">23</span>
                Electronic Communications
              </h2>
              <p>By using Prompt Studio, creating an account, or providing your email address, you consent to receive electronic communications from us.</p>
              <p>These communications may include account notices, purchase confirmations, product updates, support messages, legal notices, affiliate program updates, and marketing communications where permitted by law.</p>
              <p>You agree that electronic communications satisfy any legal requirement that such communications be in writing.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">24</span>
                Miscellaneous
              </h2>
              <p>These Terms constitute the entire agreement between you and Magzin LLC regarding Prompt Studio.</p>
              <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in effect.</p>
              <p>Our failure to enforce any right or provision of these Terms does not waive that right or provision.</p>
              <p>You may not assign or transfer these Terms without our prior written consent. We may assign or transfer these Terms in connection with a merger, acquisition, sale of assets, corporate reorganization, or by operation of law.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">25</span>
                Contact Us
              </h2>
              <p>For questions about these Terms, please contact:</p>
              <div className="bg-muted/40 border border-border/40 rounded-xl p-5 text-sm space-y-1">
                <p className="font-semibold text-foreground">Magzin LLC</p>
                <p>800 Third Avenue Associates</p>
                <p>New York, NY 10022</p>
                <p>United States</p>
                <p className="pt-2">
                  Email:{' '}
                  <a href="mailto:support@prompstudio.com" className="text-primary hover:underline">
                    support@prompstudio.com
                  </a>
                </p>
              </div>
              <p className="text-xs text-muted-foreground pt-4">&copy; 2026 Prompt Studio. All rights reserved.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
