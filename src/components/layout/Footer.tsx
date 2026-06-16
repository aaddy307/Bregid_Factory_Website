import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-4 border-t border-outline-variant/40 bg-background/80 text-center text-xs text-on-surface-variant mt-auto">
      <a
        href="https://ahmed.nexcoreinstitute.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-leather-tan transition-colors duration-200 hover:underline"
      >
        made by ahmed khan all rights reserve
      </a>
    </footer>
  );
}
