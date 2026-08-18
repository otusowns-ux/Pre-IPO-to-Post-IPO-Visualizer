# IPO Visualizer

Vanilla HTML / CSS / ES-module project with two visualizers:

- **SpaceX IPO** — funding eras, IPO day, and staggered year-one exits
- **Generic Pre → Post IPO** — sandbox model of private rounds → public market

No bundler or npm install required.

## Run locally

ES modules need HTTP (opening `file://` will fail). From the project root:

```bash
python3 -m http.server 8765
```

Then open:

- http://localhost:8765/ — landing
- http://localhost:8765/spacex.html
- http://localhost:8765/generic.html

## Structure

```
css/           shared + story themes
js/shared/     math, canvas helpers, animation loop, DOM helpers
js/generic/    generic IPO story
js/spacex/     SpaceX story
generic.html
spacex.html
index.html     landing page
```
