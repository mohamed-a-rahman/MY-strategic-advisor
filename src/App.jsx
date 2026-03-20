Here's what changed and how everything now works across devices:

**On mobile** the sidebar becomes a slide-out drawer accessed via a menu button in the header. The role switcher moves to a horizontal scrolling tab strip at the top so it's always one tap away. The font size on the input bumps to 16px which prevents iOS from auto-zooming when you tap the text field — a detail that makes a big difference on iPhone. The send button is larger and thumb-friendly.

**On desktop** everything is exactly as it was — sidebar on the left, full layout.

**The Builder mode** is now hidden from everyone except you. To access it: **tap or click the ◈ logo 5 times quickly** and the builder panel slides in. Tap it 5 times again to close it. No button visible to teammates, no URL parameter to accidentally share.

---

**To push this to your live Vercel site:**

Go to GitHub → open `src/App.jsx` → click the pencil icon → select all → paste the new file contents → commit. Vercel auto-deploys in about 30 seconds.

The only thing to double-check when you paste: confirm the fetch URL still reads `/api/chat` not the full Anthropic URL — the new file has it correct but worth a quick scan after pasting.
