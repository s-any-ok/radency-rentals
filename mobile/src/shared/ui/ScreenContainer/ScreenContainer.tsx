import { PropsWithChildren } from 'react';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '../../lib/cn';

type Props = PropsWithChildren<{
  edges?: Edge[];
  className?: string;
}>;

export const ScreenContainer = ({ children, edges = ['top'], className }: Props) => (
  <SafeAreaView
    edges={edges}
    className={cn('flex-1 bg-ink-50', className)}
  >
    {children}
  </SafeAreaView>
);
