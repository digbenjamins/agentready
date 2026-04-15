/** Small 16x16 SVG brand icons for AI models used in the MCDA report */

const iconClass = "inline-block shrink-0";

export function GptIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${iconClass} ${className}`} fill="none">
      <path d="M22.28 9.37a5.93 5.93 0 0 0-.52-4.86 6.01 6.01 0 0 0-6.46-2.83A5.98 5.98 0 0 0 10.8.02a6.01 6.01 0 0 0-5.73 4.15 5.96 5.96 0 0 0-3.99 2.89 6.01 6.01 0 0 0 .74 7.03 5.93 5.93 0 0 0 .52 4.86 6.01 6.01 0 0 0 6.46 2.83 5.96 5.96 0 0 0 4.5 1.66 6.01 6.01 0 0 0 5.73-4.15 5.96 5.96 0 0 0 3.99-2.89 6.01 6.01 0 0 0-.74-7.03z" fill="#10a37f"/>
      <path d="M9.37 21.5a4.5 4.5 0 0 1-2.88-5.68l.12-.37 3.9 2.25v.45a4.5 4.5 0 0 1-1.14 3.35zm-5.5-4.63a4.47 4.47 0 0 1-.54-2.37l.01-.4 3.9-2.25 3.9 2.25v4.5l-3.37-1.95a4.5 4.5 0 0 1-3.9-1.78zm-.71-8.24a4.48 4.48 0 0 1 2.35-1.98l.36-.13v4.5l-3.9 2.25-.01-.4a4.5 4.5 0 0 1 1.2-4.24z" fill="#fff" opacity="0.7"/>
    </svg>
  );
}

export function ClaudeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${iconClass} ${className}`} fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#D97757"/>
      <path d="M14.8 7.5L9.5 16.5h2.2l1.3-2.3h3.4l1.3 2.3H20L14.8 7.5zm.1 5l-1.1-2-1.1 2h2.2zM4 16.5h2.2l5.3-9H9.3L4 16.5z" fill="#fff"/>
    </svg>
  );
}

export function GeminiIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${iconClass} ${className}`} fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
      <path d="M12 6.5c1.58 0 3.02.62 4.1 1.63l-.01.01L12 12V6.5z" fill="#EA4335"/>
      <path d="M12 12l4.09-3.87c1.13 1.2 1.74 2.75 1.74 4.37H12z" fill="#FBBC05"/>
      <path d="M12 12h5.83c-.13 2.15-1.24 4.08-2.93 5.22L12 12z" fill="#34A853"/>
      <path d="M12 12l2.9 5.22A5.98 5.98 0 0 1 12 18.5V12z" fill="#4285F4"/>
      <path d="M12 12v6.5c-2.27 0-4.27-1.2-5.4-3L12 12z" fill="#EA4335"/>
      <path d="M12 12L6.6 15.5A6.46 6.46 0 0 1 5.5 12H12z" fill="#FBBC05"/>
      <path d="M12 12H5.5c.15-2.1 1.2-3.97 2.82-5.13L12 12z" fill="#34A853"/>
      <path d="M12 12L8.32 6.87C9.38 6.1 10.64 5.67 12 5.67V12z" fill="#4285F4"/>
    </svg>
  );
}

export function GrokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${iconClass} ${className}`} fill="none">
      <rect width="24" height="24" rx="12" fill="#000"/>
      <path d="M7 7l4.5 5L7 17h2l3.5-3.9L16 17h2l-4.5-5L18 7h-2l-3.5 3.9L9 7H7z" fill="#fff" strokeWidth="0"/>
    </svg>
  );
}

export function PerplexityIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${iconClass} ${className}`} fill="none">
      <rect width="24" height="24" rx="12" fill="#1B1B1B"/>
      <path d="M12 4L7 8v4l5 4 5-4V8l-5-4zm0 2.5L15 9v3l-3 2.5L9 12V9l3-2.5z" fill="#20B2AA"/>
      <path d="M12 6.5L9 9v3l3 2.5V6.5z" fill="#20B2AA" opacity="0.6"/>
    </svg>
  );
}


export function MistralIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${iconClass} ${className}`} fill="none">
      <rect width="24" height="24" rx="12" fill="#F7D046"/>
      <rect x="5" y="5" width="4" height="4" fill="#000"/>
      <rect x="15" y="5" width="4" height="4" fill="#F7931A"/>
      <rect x="5" y="10" width="4" height="4" fill="#000"/>
      <rect x="10" y="10" width="4" height="4" fill="#000"/>
      <rect x="15" y="10" width="4" height="4" fill="#000"/>
      <rect x="5" y="15" width="4" height="4" fill="#000"/>
      <rect x="15" y="15" width="4" height="4" fill="#F7931A"/>
    </svg>
  );
}

export function LlamaIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${iconClass} ${className}`} fill="none">
      <rect width="24" height="24" rx="12" fill="#0668E1"/>
      <path d="M8.5 7C8.5 7 9.5 5 12 5s3.5 2 3.5 2v3c0 1-0.5 2-1 2.5l1 5.5h-2l-.7-4H11.2l-.7 4H8.5l1-5.5C9 12 8.5 11 8.5 10V7z" fill="#fff"/>
      <circle cx="10.5" cy="8.5" r="0.8" fill="#0668E1"/>
      <circle cx="13.5" cy="8.5" r="0.8" fill="#0668E1"/>
    </svg>
  );
}

/** Map model key to icon component */
export const MODEL_ICONS: Record<string, React.FC<{ className?: string }>> = {
  gpt: GptIcon,
  claude: ClaudeIcon,
  gemini: GeminiIcon,
  grok: GrokIcon,
  perplexity: PerplexityIcon,
  mistral: MistralIcon,
  llama: LlamaIcon,
};
