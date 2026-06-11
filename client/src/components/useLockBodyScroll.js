import { useEffect } from "react";

export const useLockBodyScroll = (locked) => {
  useEffect(() => {
    if (!locked) {
      return undefined;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [locked]);
};
