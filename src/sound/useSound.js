import { useContext } from 'react';
import { SoundContext } from './SoundContext.jsx';

export function useSound() {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error('useSound must be used inside SoundProvider.');
  }

  return context;
}
