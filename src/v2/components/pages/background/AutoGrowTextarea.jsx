import { useLayoutEffect, useRef } from "react";

const AutoGrowTextarea = ({ value, ...props }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return <textarea ref={ref} value={value} rows={1} {...props} />;
};

export default AutoGrowTextarea;
