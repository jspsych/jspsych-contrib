// Local overrides for the extension-chiasm example.
//
// Copy this file to `config.local.js` (alongside it) and fill in your own
// `experimentId` and `authToken`. The real `config.local.js` is gitignored
// so your secrets stay out of source control; this template is checked in
// so collaborators know what fields are available.
//
// `experimentId` and `authToken` are both required.
//
// `participantId` is optional here for local demo runs; index.html falls back
// to "demo-participant" when omitted. In a real experiment you typically set
// this once — e.g. from URL params, Prolific metadata, or your own subject
// registry — and pass it into the extension's init params in index.html (or
// your experiment script). You do not need to duplicate it elsewhere.
//
// Never commit a real token. Rotate it in the Chiasm dashboard if it leaves
// this file.

window.CHIASM_LOCAL_CONFIG = {
  experimentId: "REPLACE_ME_WITH_YOUR_CHIASM_EXPERIMENT_ID",
  // participantId: "your-participant-id",
  authToken: "REPLACE_ME_WITH_YOUR_CHIASM_TOKEN",
};
