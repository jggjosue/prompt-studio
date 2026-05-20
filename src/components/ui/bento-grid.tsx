import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-xl transition duration-300 shadow-sm hover:shadow-md p-6 dark:bg-card dark:border-white/[0.1] bg-card border border-border justify-between flex flex-col space-y-4 hover:border-primary/20",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-300 flex flex-col flex-1 justify-end">
        {icon && <div className="mb-2 text-primary">{icon}</div>}
        <div className="font-headline font-bold text-foreground mb-2 mt-2 text-lg">
          {title}
        </div>
        <div className="font-sans font-medium text-muted-foreground text-xs leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};
