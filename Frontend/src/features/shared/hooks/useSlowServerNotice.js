import { useState, useEffect } from "react";

export function useSlowServerNotice(isLoading, timeoutMs = 4000) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    let timer;
    if (isLoading) {
      setIsSlow(false);
      timer = setTimeout(() => {
        setIsSlow(true);
      }, timeoutMs);
    } else {
      setIsSlow(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, timeoutMs]);

  return isSlow;
}
