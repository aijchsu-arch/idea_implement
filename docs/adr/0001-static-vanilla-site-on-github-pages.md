# Static vanilla site on GitHub Pages, no build step

The focus timer ships as plain HTML/CSS/ES modules served by GitHub Pages and deployed by GitHub Actions. There is no framework or bundler, and tests run on `node:test`. The app is small and has no backend, so a build toolchain would add dependencies and CI steps without buying anything, and the repo already lives on GitHub. If the UI outgrows plain DOM code, revisit this and add a bundler rather than hand-rolling one.
