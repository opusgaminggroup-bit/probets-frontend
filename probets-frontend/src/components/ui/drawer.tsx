'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

export function Drawer({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-screen w-[95vw] max-w-2xl z-50 bg-[#121217] border-l border-[#FFD700]/25 p-6 overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold text-[#FFD700]">{title}</Dialog.Title>
          <div className="mt-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
