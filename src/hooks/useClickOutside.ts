import { useEffect } from 'react';

export function useClickOutside(
  open: boolean,
  elementRef: React.RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
) {
  useEffect(() => {
    const element = elementRef.current;
    if (!open || !element) return;

    const onClick = (event: MouseEvent) => {
      if (element.contains(event.target as Node)) return;
      onOutsideClick();
    };

    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [elementRef, onOutsideClick, open]);
}
