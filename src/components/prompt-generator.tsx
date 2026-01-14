'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handlePromptGeneration, type FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, Loader2, Clipboard } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      Generate Prompt
    </Button>
  );
}

export default function PromptGenerator() {
  const initialState: FormState = { message: '' };
  const [state, formAction] = useFormState(handlePromptGeneration, initialState);
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    if (state.prompt) {
      navigator.clipboard.writeText(state.prompt);
      toast({
        title: 'Copied to clipboard!',
        description: 'The generated prompt has been copied.',
      });
    }
  };

  useEffect(() => {
    if (state.message === 'success' && state.prompt) {
       toast({
        title: 'Prompt Generated!',
        description: 'A new creative prompt is ready for you.',
      });
    } else if (state.message !== '' && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.issues ? state.issues.join(', ') : state.message,
      });
    }
  }, [state, toast]);


  return (
    <Card>
      <CardContent className="p-6">
        <form action={formAction} className="space-y-4">
          <div className="grid w-full gap-2">
            <Textarea
              name="keywords"
              placeholder="Enter keywords to inspire the AI, e.g., 'mystical forest, ancient runes, glowing mushrooms'"
              rows={3}
              className="text-base"
            />
            {state.issues && (
              <p className="text-sm text-destructive">{state.issues.join(', ')}</p>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-end">
            <SubmitButton />
          </div>
        </form>

        {state.prompt && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2 font-headline">
              Generated Prompt:
            </h3>
            <div className="relative rounded-md border bg-muted p-4 pr-12">
              <p className="text-muted-foreground">{state.prompt}</p>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleCopyToClipboard}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
