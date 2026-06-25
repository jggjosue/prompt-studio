import type { Metadata } from 'next';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | Prompt Studio',
  description:
    'Read the Prompt Studio Privacy Policy to learn how we collect, use, store, share, and protect your personal information.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-4xl px-4 md:px-6">
          <div className="mb-12 border-b border-border/60 pb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
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
                This Privacy Policy explains how Magzin LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, stores, shares, and protects personal information when you access or use Prompt Studio, including our website, marketplace, digital products, memberships, affiliate program, account features, and related services.
              </p>
              <p className="mb-4">
                Prompt Studio is a marketplace for AI video prompts. Our platform helps users gather inspiration, explore examples, discover prompt collections, and create stunning videos with AI.
              </p>
              <p className="text-sm italic">
                By using Prompt Studio, creating an account, purchasing products, joining a membership, subscribing to emails, or participating in our affiliate program, you agree to the practices described in this Privacy Policy.
              </p>
            </section>

            <hr className="border-border/60" />

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">1</span>
                Company Information
              </h2>
              <p>Prompt Studio is operated by:</p>
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

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">2</span>
                Information We Collect
              </h2>
              <p>We may collect personal information directly from you, automatically through your use of the platform, and from third-party service providers.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.1 Information You Provide to Us</h3>
              <p>We may collect information you voluntarily provide, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>name;</li>
                <li>email address;</li>
                <li>username;</li>
                <li>billing or purchase information;</li>
                <li>membership information;</li>
                <li>affiliate account information;</li>
                <li>payment-related information;</li>
                <li>customer support messages;</li>
                <li>feedback, reviews, comments, or other content you submit;</li>
                <li>marketing preferences;</li>
                <li>any other information you choose to provide.</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.2 Account and Authentication Information</h3>
              <p>Prompt Studio uses third-party authentication services, including Clerk, to help users create accounts and sign in.</p>
              <p>You may be able to sign in using:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Google authentication;</li>
                <li>email and password;</li>
                <li>other authentication methods we may support in the future.</li>
              </ul>
              <p>When you create or access an account, we may collect and process authentication-related information, such as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>email address;</li>
                <li>user ID;</li>
                <li>login method;</li>
                <li>authentication provider;</li>
                <li>session information;</li>
                <li>account status;</li>
                <li>profile information made available by Google or another provider;</li>
                <li>security and verification information.</li>
              </ul>
              <p>If you sign in with Google, Google may provide us with certain information depending on your account settings and permissions, such as your email address, name, profile image, and other basic profile information.</p>
              <p>Your use of Google sign-in may also be subject to Google&rsquo;s own terms and privacy policies.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.3 Purchase, Membership, and Transaction Information</h3>
              <p>If you purchase a digital product, subscribe to a membership, or participate in paid services, we may collect information related to your transaction, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>purchased products;</li>
                <li>membership plan;</li>
                <li>subscription status;</li>
                <li>transaction date;</li>
                <li>payment status;</li>
                <li>refund or chargeback status;</li>
                <li>billing-related information;</li>
                <li>payment processor information.</li>
              </ul>
              <p>We may use third-party payment processors to process payments. We do not intentionally store full credit card numbers on our own servers unless explicitly stated. Payment information is generally handled by our payment processing providers.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.4 Affiliate Program Information</h3>
              <p>If you apply for or participate in the Prompt Studio affiliate program, we may collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>name;</li>
                <li>email address;</li>
                <li>affiliate ID;</li>
                <li>referral links or codes;</li>
                <li>referred sales;</li>
                <li>commission amounts;</li>
                <li>payout status;</li>
                <li>tax or payment information where required;</li>
                <li>promotional channels;</li>
                <li>compliance-related information.</li>
              </ul>
              <p>We use this information to manage affiliate accounts, track referrals, calculate commissions, prevent fraud, and process payouts.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.5 Marketing Information</h3>
              <p>We may collect your email address and marketing preferences to send you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>product updates;</li>
                <li>new prompt releases;</li>
                <li>membership offers;</li>
                <li>promotional emails;</li>
                <li>platform updates;</li>
                <li>affiliate program updates;</li>
                <li>special offers;</li>
                <li>educational or creative content.</li>
              </ul>
              <p>
                You may unsubscribe from marketing emails at any time using the unsubscribe link in our emails or by contacting us at{' '}
                <a href="mailto:support@prompstudio.com" className="text-primary hover:underline">
                  support@prompstudio.com
                </a>
                .
              </p>
              <p>Even if you unsubscribe from marketing communications, we may still send you non-marketing emails related to your account, purchases, security, legal notices, or service updates.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">2.6 Automatically Collected Information</h3>
              <p>When you use Prompt Studio, we may automatically collect certain information, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address;</li>
                <li>device type;</li>
                <li>browser type;</li>
                <li>operating system;</li>
                <li>pages viewed;</li>
                <li>referring URLs;</li>
                <li>access times;</li>
                <li>click activity;</li>
                <li>approximate location based on IP address;</li>
                <li>cookies and similar tracking technologies;</li>
                <li>log data;</li>
                <li>analytics data.</li>
              </ul>
              <p>This information helps us operate, secure, improve, and personalize Prompt Studio.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">3</span>
                How We Use Your Information
              </h2>
              <p>We may use personal information for the following purposes:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>to provide and operate Prompt Studio;</li>
                <li>to create, manage, and secure user accounts;</li>
                <li>to authenticate users through Clerk, Google login, or email;</li>
                <li>to process purchases, memberships, subscriptions, and transactions;</li>
                <li>to deliver digital products and prompt collections;</li>
                <li>to manage affiliate accounts and calculate commissions;</li>
                <li>to send transactional emails;</li>
                <li>to send marketing and promotional communications;</li>
                <li>to provide customer support;</li>
                <li>to personalize user experience;</li>
                <li>to analyze platform performance and user behavior;</li>
                <li>to improve products, services, content, and features;</li>
                <li>to prevent fraud, abuse, unauthorized access, and security incidents;</li>
                <li>to enforce our Terms of Use;</li>
                <li>to comply with legal obligations;</li>
                <li>to protect our rights, users, partners, and business.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">4</span>
                Legal Bases for Processing
              </h2>
              <p>Depending on your location, we may process your personal information based on one or more legal bases, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>your consent;</li>
                <li>performance of a contract;</li>
                <li>our legitimate business interests;</li>
                <li>compliance with legal obligations;</li>
                <li>protection of rights and security;</li>
                <li>processing required to provide requested services.</li>
              </ul>
              <p>For example, we may process your email address to create your account, deliver products you purchased, send account-related messages, and, where permitted, send marketing communications.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">5</span>
                Cookies and Tracking Technologies
              </h2>
              <p>Prompt Studio may use cookies, pixels, analytics tools, and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>keep you signed in;</li>
                <li>remember preferences;</li>
                <li>analyze website traffic;</li>
                <li>understand user behavior;</li>
                <li>improve the platform;</li>
                <li>measure marketing performance;</li>
                <li>support affiliate tracking;</li>
                <li>prevent fraud and abuse.</li>
              </ul>
              <p>You may control cookies through your browser settings. However, disabling cookies may affect the functionality of certain parts of Prompt Studio.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">6</span>
                Email Marketing
              </h2>
              <p>If you provide your email address, create an account, purchase a product, join a membership, download content, or otherwise interact with Prompt Studio, we may send you emails about our products, services, offers, updates, and related content.</p>
              <p>Marketing emails may include information about:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>new AI video prompts;</li>
                <li>product launches;</li>
                <li>membership offers;</li>
                <li>marketplace updates;</li>
                <li>educational resources;</li>
                <li>affiliate opportunities;</li>
                <li>special promotions.</li>
              </ul>
              <p>
                You can opt out of marketing emails at any time by clicking the unsubscribe link in the email or contacting us at{' '}
                <a href="mailto:support@prompstudio.com" className="text-primary hover:underline">
                  support@prompstudio.com
                </a>
                .
              </p>
              <p>We may still send you important non-promotional emails, such as account notices, purchase confirmations or security updates, legal notices, and support messages.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">7</span>
                How We Share Information
              </h2>
              <p>We do not sell your personal information in the traditional sense.</p>
              <p>However, we may share personal information with trusted third parties when necessary to operate Prompt Studio, provide services, process transactions, manage accounts, or comply with legal requirements.</p>
              <p>We may share information with:</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.1 Authentication Providers</h3>
              <p>We use authentication providers such as Clerk to manage user accounts, login sessions, authentication, and account security.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.2 Google Login</h3>
              <p>If you choose to sign in with Google, certain account information may be shared between Google and Prompt Studio to enable authentication.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.3 Payment Processors</h3>
              <p>We may share transaction-related information with payment processors to process purchases, memberships, subscriptions, refunds, and payouts.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.4 Email and Marketing Providers</h3>
              <p>We may use third-party email or marketing providers to send transactional emails, marketing emails, newsletters, product updates, and promotional communications.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.5 Analytics and Performance Providers</h3>
              <p>We may use analytics tools to understand how users interact with Prompt Studio and improve the platform.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.6 Affiliate and Referral Systems</h3>
              <p>If you participate in our affiliate program, we may use affiliate tracking tools to monitor referrals, calculate commissions, detect fraud, and process payouts.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.7 Legal and Compliance</h3>
              <p>We may disclose information if required to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>comply with applicable laws;</li>
                <li>respond to legal requests;</li>
                <li>enforce our Terms of Use;</li>
                <li>prevent fraud or abuse;</li>
                <li>protect rights, safety, and security;</li>
                <li>respond to claims or disputes.</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">7.8 Business Transfers</h3>
              <p>If Magzin LLC is involved in a merger, acquisition, financing, reorganization, bankruptcy, sale of assets, or similar transaction, personal information may be transferred as part of that transaction.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">8</span>
                Third-Party Services
              </h2>
              <p>Prompt Studio may integrate with or link to third-party services, including authentication providers, payment processors, analytics providers, affiliate systems, email marketing platforms, and AI tools.</p>
              <p>These third-party services may collect and process information according to their own privacy policies.</p>
              <p>We are not responsible for the privacy practices, content, security, or policies of third-party services. You should review their privacy policies before using them.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">9</span>
                Google User Data
              </h2>
              <p>If you use Google sign-in, we may receive basic Google account information needed to create or access your Prompt Studio account, such as your email address, name, and profile image, depending on the permissions granted.</p>
              <p>We use Google user data only for purposes related to account authentication, account management, user identification, security, and providing Prompt Studio services.</p>
              <p>We do not use Google user data for unauthorized purposes, and we do not sell Google user data.</p>
              <p>If required by Google policies, our use and transfer of information received from Google APIs will adhere to applicable Google API Services User Data Policy requirements, including any Limited Use requirements that may apply.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">10</span>
                Data Retention
              </h2>
              <p>We retain personal information for as long as necessary to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>provide Prompt Studio;</li>
                <li>maintain your account;</li>
                <li>process purchases and memberships;</li>
                <li>manage affiliate records;</li>
                <li>comply with legal, tax, accounting, and reporting obligations;</li>
                <li>resolve disputes;</li>
                <li>enforce agreements;</li>
                <li>prevent fraud and abuse;</li>
                <li>maintain business records.</li>
              </ul>
              <p>When personal information is no longer needed, we may delete, anonymize, or securely retain it as required by law or legitimate business needs.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">11</span>
                Data Security
              </h2>
              <p>We use reasonable administrative, technical, and organizational measures to help protect personal information from unauthorized access, loss, misuse, disclosure, alteration, or destruction.</p>
              <p>However, no method of transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security.</p>
              <p>You are responsible for keeping your account credentials secure and notifying us if you believe your account has been compromised.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">12</span>
                Your Privacy Rights
              </h2>
              <p>Depending on your location, you may have rights regarding your personal information, including the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>access personal information we hold about you;</li>
                <li>correct inaccurate information;</li>
                <li>request deletion of personal information;</li>
                <li>object to certain processing;</li>
                <li>request restriction of processing;</li>
                <li>request a copy of your information;</li>
                <li>withdraw consent where processing is based on consent;</li>
                <li>opt out of marketing emails;</li>
                <li>opt out of certain sharing or targeted advertising where applicable.</li>
              </ul>
              <p>
                To exercise your rights, contact us at:{' '}
                <a href="mailto:support@prompstudio.com" className="text-primary hover:underline">
                  support@prompstudio.com
                </a>
              </p>
              <p>We may need to verify your identity before responding to certain requests.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">13</span>
                California Privacy Notice
              </h2>
              <p>If you are a California resident, you may have additional rights under California privacy laws.</p>
              <p>Depending on how the law applies to Prompt Studio, these rights may include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>the right to know what personal information we collect;</li>
                <li>the right to know how we use and share personal information;</li>
                <li>the right to request deletion;</li>
                <li>the right to request correction;</li>
                <li>the right to opt out of certain sales or sharing of personal information;</li>
                <li>the right to limit use of sensitive personal information where applicable;</li>
                <li>the right not to be discriminated against for exercising privacy rights.</li>
              </ul>
              <p>We do not knowingly sell personal information in exchange for money. Some analytics, advertising, or tracking activities may be considered &ldquo;sharing&rdquo; or &ldquo;selling&rdquo; under certain privacy laws. If applicable, we will provide appropriate opt-out options.</p>
              <p>
                To make a privacy request, contact us at:{' '}
                <a href="mailto:support@prompstudio.com" className="text-primary hover:underline">
                  support@prompstudio.com
                </a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">14</span>
                International Users
              </h2>
              <p>Prompt Studio is operated from the United States.</p>
              <p>If you access Prompt Studio from outside the United States, your information may be transferred to, stored in, or processed in the United States or other countries where our service providers operate.</p>
              <p>Data protection laws in these countries may differ from those in your location.</p>
              <p>By using Prompt Studio, you understand that your information may be processed in the United States and other jurisdictions.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">15</span>
                Children&rsquo;s Privacy
              </h2>
              <p>Prompt Studio is not intended for children under 13 years old.</p>
              <p>
                We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take reasonable steps to delete it.
              </p>
              <p>
                If you believe a child has provided us with personal information, please contact us at:{' '}
                <a href="mailto:support@prompstudio.com" className="text-primary hover:underline">
                  support@prompstudio.com
                </a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">16</span>
                Affiliate Program Privacy
              </h2>
              <p>If you join the Prompt Studio affiliate program, we may collect and process information necessary to manage your participation, including referral activity, sales, commissions, payment status, and compliance information.</p>
              <p>We may use affiliate-related information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>track referrals;</li>
                <li>calculate commissions;</li>
                <li>process payouts;</li>
                <li>detect fraud or abuse;</li>
                <li>enforce affiliate rules;</li>
                <li>comply with tax, accounting, and legal obligations.</li>
              </ul>
              <p>Affiliate participants are responsible for complying with applicable marketing, advertising, disclosure, privacy, and email laws when promoting Prompt Studio.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">17</span>
                User Content and Public Information
              </h2>
              <p>If Prompt Studio allows you to submit reviews, comments, marketplace content, profile information, prompts, examples, or other content, some of that information may be visible to other users or the public.</p>
              <p>Do not submit personal information that you do not want to be visible.</p>
              <p>We may remove or restrict user content in accordance with our Terms of Use.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">18</span>
                AI Tools and Generated Content
              </h2>
              <p>Prompt Studio provides prompts and related resources that may be used with third-party AI tools.</p>
              <p>We do not control how third-party AI tools process your inputs, prompts, uploaded files, generated outputs, or personal information.</p>
              <p>Before using any third-party AI tool, you should review its terms and privacy policy.</p>
              <p>You are responsible for ensuring that your use of prompts, AI tools, and generated content complies with applicable laws and third-party policies.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">19</span>
                Do Not Track
              </h2>
              <p>Some browsers offer a &ldquo;Do Not Track&rdquo; signal. Because there is no uniform standard for responding to such signals, Prompt Studio may not respond to Do Not Track signals unless required by applicable law.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">20</span>
                Changes to This Privacy Policy
              </h2>
              <p>We may update this Privacy Policy from time to time.</p>
              <p>When we update it, we may revise the &ldquo;Last Updated&rdquo; date above. If changes are material, we may notify you through the platform, by email, or by other reasonable means.</p>
              <p>Your continued use of Prompt Studio after the updated Privacy Policy becomes effective means you acknowledge the updated policy.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">21</span>
                Contact Us
              </h2>
              <p>If you have questions, requests, or concerns about this Privacy Policy or our privacy practices, contact us at:</p>
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
