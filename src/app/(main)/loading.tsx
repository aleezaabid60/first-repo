import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
