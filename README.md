Nextcloud Markdown Editor
=================

Extends the texteditor in Nextcloud with a live preview for markdown files

![Markdown Editor](screenshots/editor.png)

Features
---

### Embed images stored on your Nextcloud

![Embed Images](screenshots/embed.png)

### Use LaTeX to add math to your documents

![LaTeX math](screenshots/math.png)

### Fully rendered previews in the sidebar
 
 ![Sidebar previews](screenshots/preview.png)

Requirements
---

This requires Nextcloud and the Text Editor app to be installed from Nextcloud 10 or higher.

Installation
---

- Clone the app into the Nextcloud apps directory:

    ``git clone https://github.com/icewind1991/files_markdown.git``

- Activate the App.

    ``occ app:enable files_markdown``

Development
---

This app is written in typescript and requires nodejs and npm to build.

To build the project run `make` from the app directory.

For development you can automatically build the project every time
the source changes by running `make watch`.