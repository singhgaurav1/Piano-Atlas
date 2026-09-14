# Piano Atlas

An interactive 3D anatomy of the **Steinway & Sons Model D** concert grand, in the same spirit as [Human Atlas](https://github.com/ashemag/human-atlas) and [Model X Studio](https://github.com/ashemag/model-x-studio). Take the instrument apart into **every key, hammer, damper, string and tuning pin**, follow a note from key to string, and read the published specification behind each part.

## Explore

- Orbit, zoom, and tap any piece of the concert grand.
- Toggle eight systems: case, stand, keyboard, action, dampers, strings, soundboard, plate.
- Slide from the assembled instrument to a spaced inventory of every modeled piece.
- Search notes (middle C, A440), groups (pedals, patents, bridges) and systems.
- Isolate a selection and play a synthesized pitch for any note.
- Every detail panel cites its sources; modeled values are labeled as such.

## Run locally

Requires Node.js 20.19 or newer. No API keys.

```sh
npm ci
npm run dev
```

Open http://localhost:3017. To build the static site, run `npm run build`; the output is in `dist/`.

## Validate

```sh
npm run check
npx tsx scripts/validate-atlas.mjs
npm run build
```

Validation covers note arithmetic (88 keys, A4 = 440 Hz, 243 speaking lengths), unique part ids, system membership, cited sources, and a non-empty exploded inventory.

## Model source and scope

The atlas is built from **published Steinway Model D specifications** (length 274 cm, width 156 cm, weight 483 kg, 20,418 kg string tension, materials and patents) together with a reconstructed 88-note scale. It is **not** a scanned factory instrument or a parts catalog.

Full citations are in [SOURCES.md](SOURCES.md). Principal references:

- [Steinway & Sons, Model D specifications](https://www.steinway.com/pianos/steinway/grand/model-d)
- [Piano Technicians Guild, Model D (243 speaking lengths)](https://www.ptg.org/teacher-resources/history-of-the-piano)
- [Wikipedia, Steinway D-274](https://en.wikipedia.org/wiki/Steinway_D-274)
- Original U.S. patents for the duplex scale, rim, sostenuto, Accelerated Action, diaphragmatic soundboard and Hexagrip pinblock

This is an independent educational explorer, **not affiliated with Steinway & Sons**.

## Deploy

Import this repository into Vercel as a Vite project. The included `vercel.json` configures `npm ci`, `npm run build`, and the `dist` output directory.

## License

Original application code is released under the [MIT License](LICENSE). Third-party dependencies retain their respective licenses. Steinway, Steinway & Sons and Model D are trademarks of their owners; they are used here only to identify the instrument being described.
