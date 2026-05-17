'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check, Info, X } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      "We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied, you can request a full refund within 30 days of your purchase.",
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes, you can cancel your subscription at any time from your account dashboard. Your subscription will remain active until the end of the current billing cycle.',
  },
  {
    question: 'Do credits roll over to the next month?',
    answer:
      'Credits for our subscription plans do not roll over. However, On-Demand Credits never expire.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. The changes will be prorated and applied to your next billing cycle.',
  },
  {
    question: 'What happens if I exceed my credit limit?',
    answer:
      'If you exceed your credit limit, you can purchase On-Demand Credits to continue generating content, or upgrade to a higher plan.',
  },
  {
    question: 'Are there any hidden fees?',
    answer:
      'No, there are no hidden fees. The price you see is the price you pay. Taxes may apply depending on your location.',
  },
  {
    question: 'Do you offer annual plans?',
    answer:
      'Yes, we offer annual plans that give you 2 months free compared to paying monthly. You can toggle between monthly and yearly pricing on this page.',
  },
  {
    question: 'How do I contact billing support?',
    answer:
      'You can contact our billing support team by emailing billing@promptstudio.com.',
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const pricingPlans = [
    {
      name: 'Free',
      description: 'For personal use and small projects',
      price: {
        monthly: 0,
        yearly: 0,
      },
      buttonText: 'Currently on Free Plan',
      buttonVariant: 'outline',
      isCurrent: true,
      features: [
        { text: '20 prompt views per day', included: true },
        { text: '20 credits upon sign up', included: true },
        { text: 'Text to image', included: true },
        { text: 'Image to image', included: true },
        { text: 'Text to video', included: true },
        { text: 'Multiple AI models supported', included: false, tooltip: 'Access to all available AI models' },
        { text: 'AI prompt optimization', included: false, tooltip: 'Improve your prompts for better results' },
        { text: 'Credits renew every month', included: false },
        { text: 'No watermark', included: false },
        { text: 'Priority support', included: false },
      ],
    },
    {
      name: 'Pro',
      description: 'For freelancers and small businesses',
      price: {
        monthly: 29,
        yearly: 290,
      },
      buttonText: 'Get Started',
      buttonVariant: 'default',
      isPopular: true,
      features: [
        { text: 'Unlimited prompt views per day', included: true },
        { text: '4,000 credits per month', included: true },
        { text: 'Text to image', included: true },
        { text: 'Image to image', included: true },
        { text: 'Text to video', included: true },
        { text: 'Multiple AI models supported', included: true, tooltip: 'Access to all available AI models' },
        { text: 'AI prompt optimization', included: true, tooltip: 'Improve your prompts for better results' },
        { text: 'Credits renew every month', included: true },
        { text: 'No watermark', included: true },
        { text: 'Priority support', included: true },
      ],
    },
    {
      name: 'Starter',
      description: 'For individuals and small-scale projects',
      price: {
        monthly: 9,
        yearly: 90,
      },
      buttonText: 'Get Started',
      buttonVariant: 'default',
      features: [
        { text: 'Unlimited prompt views per day', included: true },
        { text: '1,000 credits per month', included: true },
        { text: 'Text to image', included: true },
        { text: 'Image to image', included: true },
        { text: 'Text to video', included: true },
        { text: 'Multiple AI models supported', included: true, tooltip: 'Access to all available AI models' },
        { text: 'AI prompt optimization', included: true, tooltip: 'Improve your prompts for better results' },
        { text: 'Credits renew every month', included: true },
        { text: 'No watermark', included: true },
        { text: 'Priority support', included: true },
      ],
    },
  ];
  
  const [credits, setCredits] = useState(4000);
  const creditPrice = credits / 100;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
              Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose your plan or buy credits to start creating videos and
              images
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-12">
            <Label htmlFor="billing-cycle" className={cn(!isYearly ? 'text-foreground' : 'text-muted-foreground')}>
              Monthly
            </Label>
            <div className="relative flex items-center">
              <Switch
                id="billing-cycle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <div className="absolute -top-6 right-[-80px] bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded-full">
                2 Months Free
              </div>
            </div>
            <Label htmlFor="billing-cycle" className={cn(isYearly ? 'text-foreground' : 'text-muted-foreground')}>
              Yearly
            </Label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingPlans.map(plan => (
              <Card
                key={plan.name}
                className={cn(
                  'flex flex-col',
                  plan.isPopular ? 'border-primary border-2' : ''
                )}
              >
                {plan.isPopular && (
                  <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg -mt-px">
                    POPULAR
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                  <p className="text-muted-foreground h-10">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <div className="mb-8">
                    <span className="text-5xl font-bold">
                      $
                      {isYearly
                        ? plan.price.yearly / 12
                        : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {isYearly && <p className="text-sm text-muted-foreground">Billed as ${plan.price.yearly}/year</p>}
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map(feature => (
                      <li key={feature.text} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-primary" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className={cn(!feature.included && 'text-muted-foreground')}>
                          {feature.text}
                        </span>
                        {feature.tooltip && (
                           <Info className="w-4 h-4 text-muted-foreground" />
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <Button
                      variant={plan.buttonVariant as any}
                      className={cn("w-full", plan.isCurrent && "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20")}
                      disabled={plan.isCurrent}
                    >
                      {plan.buttonText}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-20">
             <Card className="p-8 bg-muted/30">
               <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold font-headline mb-2">On-Demand Credits</h2>
                    <p className="text-muted-foreground">Flexible credits for any time. Never expire.</p>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-primary font-bold text-3xl">${creditPrice.toFixed(2)}</span>
                        <span className="font-semibold text-xl">{credits.toLocaleString()} credits</span>
                     </div>
                     <Slider 
                        defaultValue={[4000]} 
                        max={20000} 
                        min={2000}
                        step={100}
                        onValueChange={(value) => setCredits(value[0])}
                     />
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>2,000</span>
                        <span>4,000</span>
                        <span>8,000</span>
                        <span>10,000</span>
                        <span>12,000</span>
                        <span>16,000</span>
                        <span>20,000</span>
                     </div>
                     <Button className="w-full">Create now and use them anytime</Button>
                  </div>
               </div>
             </Card>
          </div>

          <div className="mt-20 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold font-headline mb-4">FAQs</h2>
              <p className="text-lg text-muted-foreground">
                Common questions about our pricing plans.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
