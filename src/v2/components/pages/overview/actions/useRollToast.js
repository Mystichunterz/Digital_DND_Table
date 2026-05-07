import { useEffect, useState } from "react";

export const useRollToast = (timeoutMs = 1800) => {
  const [rollToast, setRollToast] = useState(null);

  useEffect(() => {
    if (!rollToast) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setRollToast(null), timeoutMs);

    return () => clearTimeout(timeoutId);
  }, [rollToast, timeoutMs]);

  return { rollToast, setRollToast };
};
