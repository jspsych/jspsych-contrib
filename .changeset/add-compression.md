---
"@jspsych-contrib/plugin-pipe": minor
---

Add gzip compression for request bodies, enabled by default via a new `compression` parameter. This allows uploading datasets larger than the 32 MB server limit by compressing them before sending. Text data (JSON, CSV) typically compresses 2-10x, effectively raising the upload limit to 60-300+ MB for most experiment data. Compression uses the browser's built-in `CompressionStream` API and gracefully falls back to uncompressed uploads in unsupported browsers.
