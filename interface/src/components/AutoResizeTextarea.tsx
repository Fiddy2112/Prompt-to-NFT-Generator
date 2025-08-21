import { useRef } from "react";

type AutoResizeTextareaProps = {
  prompt: string;
  setPrompt: (value: string) => void;
};

const AutoResizeTextarea = ({ prompt, setPrompt }: AutoResizeTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={prompt}
      onChange={handleChange}
      placeholder="Enter your AI prompt"
      rows={1}
      className="border px-3 py-2 w-full rounded resize-none overflow-hidden transition-all"
    />
  );
};

export default AutoResizeTextarea;
