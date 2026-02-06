'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import Link from 'next/link';

export default function PromptGenerator() {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="grid w-full gap-2">
            <Textarea
              name="keywords"
              placeholder="Enter keywords to inspire the AI, e.g., 'mystical forest, ancient runes, glowing mushrooms'"
              rows={3}
              className="text-base"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-end">
            <Button asChild className="w-full md:w-auto">
              <Link
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Prompt
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
