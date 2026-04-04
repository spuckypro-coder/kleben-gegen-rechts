"use client";

import { useEffect } from "react";

export default function InstagramFeed() {
  useEffect(() => {
    const d = document;
    const s = d.createElement("script");
    s.type = "module";
    s.src = "https://w.behold.so/widget.js";
    d.head.append(s);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="inline-block mb-3 px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest">
            Instagram
          </div>
          <h2 className="text-3xl font-black uppercase">
            <span className="text-white">Folg uns</span>{" "}
            <span className="text-red-500">@klebengegenrechts</span>
          </h2>
        </div>
        <a
          href="https://www.instagram.com/klebengegenrechts/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:block px-5 py-2 border-2 border-white font-black uppercase text-sm hover:bg-white hover:text-black transition-colors"
        >
          Profil ansehen →
        </a>
      </div>

      {/* @ts-expect-error custom element */}
      <behold-widget feed-id="wt1nQUMELrTDhSLytxkT"></behold-widget>

      <div className="mt-6 text-center sm:hidden">
        <a
          href="https://www.instagram.com/klebengegenrechts/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 border-2 border-white font-black uppercase text-sm hover:bg-white hover:text-black transition-colors"
        >
          Profil ansehen →
        </a>
      </div>
    </section>
  );
}
