'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export default function Faq() {
  const t = useTranslations('faq');
  const items = t.raw('items') as Array<{ question: string; answer: string }>;

  const faqSchema = useMemo(
    () =>
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }),
    [items]
  );

  return (
    <section
      className="w-full py-8 md:py-20"
      aria-labelledby="faq-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchema }}
      />
      <div className="container max-w-4xl">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h2
            id="faq-heading"
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline"
          >
            {t('title')}
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            {t('subtitle')}
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {items.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger className="text-lg font-semibold text-left font-headline">
                <span className="sr-only">Question: </span>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
