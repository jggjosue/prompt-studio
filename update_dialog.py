import re

with open("src/components/web-page-prompt-dialog-new.tsx", "r") as f:
    content = f.read()

# Replace imports
content = content.replace("import { Input } from '@/components/ui/input';", "import { FreeEmailGate } from '@/components/free-email-gate';")
content = content.replace("  DialogDescription,\n  DialogFooter,\n", "")

# Remove unused states
content = re.sub(r"  // Email gate state[\s\S]*?const pageTitle =", "  const pageTitle =", content)

# Remove unused emails pre-fill useEffects
content = re.sub(r"  // Pre-fill email from signed-in user[\s\S]*?React\.useEffect\(\(\) => {\n    setPrompt\(page\.description\);\n  }, \[page\.description, page\.id\]\);", "  React.useEffect(() => {\n    setPrompt(page.description);\n  }, [page.description, page.id]);", content)

# Change view state
content = content.replace("const [view, setView] = React.useState<'closed' | 'email-gate' | 'prompt'>('closed');", "const [view, setView] = React.useState<'closed' | 'prompt'>('closed');")

# Change needsEmailGate
content = content.replace("const needsEmailGate = isFree && !hasPaidPlan && !emailSaved;", "const needsEmailGate = isFree && !hasPaidPlan;")

# Change handleViewPromptClick
new_click = """  const handleViewPromptClick = (e: React.MouseEvent) => {
    let accessGranted = false;
    
    if (hasPurchased) {
      accessGranted = true;
      trackAnalyticsEvent('web_view_prompt', {
        page_id: page.id,
        page_title: pageTitle,
        item_id: page.id,
        item_name: pageTitle,
        item_category: 'landing-page-prompt',
        membership: page.membership,
        action_source: 'prompt-dialog',
      });
    } else {
      runWithAccess(page.membership, () => {
        accessGranted = true;
        if (isSignedIn) {
          trackAnalyticsEvent('web_view_prompt', {
            page_id: page.id,
            page_title: pageTitle,
            item_id: page.id,
            item_name: pageTitle,
            item_category: 'landing-page-prompt',
            membership: page.membership,
            action_source: 'prompt-dialog',
          });
        }
      });
    }

    if (!accessGranted) {
      e.preventDefault();
      return;
    }

    if (!needsEmailGate) {
      e.preventDefault();
      openAndLoadPrompt();
    }
  };"""

content = re.sub(r"  const handleViewPromptClick = \(\) => \{[\s\S]*?  \};", new_click, content)

# Change handleEmailSubmit
content = re.sub(r"  const handleEmailSubmit = async[\s\S]*?  const triggerButton", "  const triggerButton", content)

# Change wrapper return
new_return = """  const wrappedTrigger = needsEmailGate ? (
    <FreeEmailGate
      title={t('viewPrompt')}
      description={t('unlockPromptDescription')}
      submitText={t('viewPromptNow')}
      onSuccess={openAndLoadPrompt}
    >
      {triggerButton}
    </FreeEmailGate>
  ) : (
    triggerButton
  );

  return (
    <>
      {wrappedTrigger}
      <Dialog open={view !== 'closed'} onOpenChange={open => { if (!open) setView('closed'); }}>
        {view === 'prompt' && ("""

content = re.sub(r"  return \(\n    <>\n      \{triggerButton\}[\s\S]*?        \{view === 'prompt' && \(", new_return, content)

with open("src/components/web-page-prompt-dialog-new.tsx", "w") as f:
    f.write(content)
