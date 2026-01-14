'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is Prompt Studio?',
    answer:
      'Prompt Studio is your comprehensive AI prompt library featuring thousands of quality AI video prompts and AI image prompts. We help creators discover high-quality examples, get inspired, and generate professional AI-generated videos and images using expertly crafted prompts for various AI models.',
  },
  {
    question: 'How does Prompt Studio work?',
    answer:
      'You can browse our gallery for inspiration, use our prompt generator to create new ideas, and explore different AI models. Once you find or create a prompt you like, you can use it with your favorite AI image or video generator.',
  },
  {
    question: 'Is Prompt Studio free to use?',
    answer:
      'Yes, browsing our gallery and generating prompts is completely free. Some advanced features may require an account.',
  },
  {
    question: 'What AI models does Prompt Studio support?',
    answer:
      'We support a wide range of popular AI models for both image and video generation. Our platform is designed to be compatible with the latest and most powerful tools available.',
  },
  {
    question: 'Can I use Prompt Studio prompts with any AI generator?',
    answer:
      'Absolutely! Our prompts are designed to be versatile and can be used with any AI image or video generation tool that accepts text-based prompts.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'You can contact our support team by emailing support@promptstudio.com. We are always happy to help!',
  },
];

export default function Faq() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-28">
      <div className="container max-w-4xl">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Everything you need to know about AI video and image prompts
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
    </section>
  );
}
