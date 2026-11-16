// Small, decorative line drawings; all labels are supplied by the surrounding text.
const paths={
 timer:'<circle cx="12" cy="14" r="8"/><path d="M9 2h6M12 2v4m6 1 2-2M12 10v5l3 2"/>',
 screen:'<rect x="2" y="3" width="20" height="15" rx="2"/><path d="M8 22h8m-4-4v4M6 7h5v7H6zm9 0h3m-3 4h3m-3 3h3"/>',
 share:'<circle cx="5" cy="12" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><path d="m8 10 8-4m-8 8 8 4"/>',
 car:'<path d="m3 10 2-6h14l2 6M3 10h18v9H3zm0 9v2m18-2v2M7 14h1m8 0h1M7 4l-1 6m11-6 1 6"/>',
 tools:'<path d="m14 6 4 4 4-4a7 7 0 0 1-8 9l-6 6a3 3 0 0 1-4-4l6-6a7 7 0 0 1 9-8z"/>',
 track:'<path d="M8 3h8a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6V9a6 6 0 0 1 6-6zM8 7h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM10 2v6"/>',
 measure:'<path d="m3 16 13-13 5 5L8 21zm5-5 2 2m2-6 2 2m-9 6 2 2m9-14 2 2"/>',
 layers:'<path d="m12 3 10 5-10 5L2 8zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
 print:'<path d="M6 9V2h12v7M6 17H3V9h18v8h-3M6 14h12v8H6zm11-2h1"/>',
 palette:'<path d="M12 2a10 10 0 1 0 0 20h2a3 3 0 0 0 2-5c-1-1 0-3 2-3h2a2 2 0 0 0 2-2A10 10 0 0 0 12 2z"/><circle cx="7" cy="8" r="1"/><circle cx="12" cy="6" r="1"/><circle cx="17" cy="8" r="1"/><circle cx="5" cy="13" r="1"/>',
 gauge:'<path d="M4 19a10 10 0 1 1 16 0M12 4v2M4 12h2m12 0h2m-8 3 5-7"/><circle cx="12" cy="15" r="2"/>',
 chart:'<path d="M3 3v18h18M6 16l4-6 4 3 6-9"/>'
};
export function featureIcon(name){return `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.share}</svg>`;}
