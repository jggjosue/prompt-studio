'use client';

import React, { useMemo } from 'react';
import { useEditor } from '@/components/editor/editor-store-context';
import { PageRenderer } from '@/components/page-builder/page-renderer';
import { editorDocumentToPageSchema } from '@/lib/page-builder/editor-adapter';

export function EditorPagePreview({ name }: { name: string }) {
  const document = useEditor(state => state.document);
  const schema = useMemo(() => editorDocumentToPageSchema(document, name), [document, name]);
  return <div className="h-full overflow-auto bg-white"><PageRenderer schema={schema} /></div>;
}
