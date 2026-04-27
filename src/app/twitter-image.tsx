// Twitter / X uses the same 1200x630 card we generate for OG. Re-export so
// Next emits a dedicated <meta name="twitter:image"> alongside the OG one.

export {
  default,
  alt,
  size,
  contentType,
} from './opengraph-image';
