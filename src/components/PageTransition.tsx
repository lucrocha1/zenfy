import { ReactNode } from 'react';

export const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {children}
    </div>
  );
};
