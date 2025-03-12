import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid hsl(var(--border))',
        },
        error: {
          style: {
            borderColor: 'hsl(var(--destructive))',
          },
        },
        success: {
          style: {
            borderColor: 'hsl(var(--chart-2))',
          },
        },
      }}
    />
  );
}