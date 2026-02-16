# Project Structure

This project is organized for static hosting (GitHub Pages) with no Node.js runtime required.

## Folders

- `index.html`: entry page (kept at root for GitHub Pages)
- `src/js/main.js`: ES module entry point
- `src/js/app/quiz-app.js`: quiz application logic
- `src/js/data/chars.js`: kana dataset
- `src/styles/main.css`: stylesheet entry point
- `src/styles/base.css`: variables, reset, base layout and typography
- `src/styles/components.css`: interactive UI components
- `src/styles/responsive.css`: media queries
- `script.js` and `styles.css`: legacy files kept in root (not used by `index.html`)

## Notes

- JavaScript runs as native browser modules (`type="module"`).
- Inline HTML handlers are supported through `window.startQuiz`, `window.submitAnswer`, and `window.submitComboAnswer`.
- No build tooling is required.
