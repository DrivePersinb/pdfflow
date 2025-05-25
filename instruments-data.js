// instruments-data.js
const instrumentsData = [
    {
        id: 1,
        name: "Yamaha PSR-E373",
        brand: "Yamaha",
        category: "Keyboard",
        image: "images/yamaha-psr-e373.jpg",
        price: 15000,
        short_description: "61-key portable keyboard with touch response and a wide variety of sounds.",
        detailed_description: "The Yamaha PSR-E373 is an ideal portable keyboard for beginners and hobbyists. It features a 61-key touch-sensitive keyboard, 622 high-quality instrument Voices, and 205 auto accompaniment Styles. The 'Keys to Success' lesson functions help you learn new songs, and the USB TO HOST terminal allows for connection to a computer or smart device.",
        specs: [ // Specs are now an array for ordered and categorized display
            { "key": "Keys", "value": "61 (Touch Sensitive)" },
            {
                "category": "Sound",
                "items": [
                    { "key": "Polyphony", "value": "48-note" },
                    { "key": "Tones", "value": "622 (including GM/XGlite compatible)" },
                    { "key": "Rhythms", "value": "205" }
                ]
            },
            {
                "category": "Effects & Connectivity",
                "items": [
                    { "key": "Effects", "value": "DSP, Reverb, Chorus, Master EQ" },
                    { "key": "Connectivity", "value": "USB to HOST, AUX IN, Headphones" }
                ]
            },
            { "key": "Dimensions (WxDxH)", "value": "945 x 369 x 118 mm" },
            { "key": "Weight", "value": "4.6 kg" },
            { "key": "Power Supply", "value": "PA-130 or equivalent, or six AA batteries" }
        ],
        faqs: [
            { q: "Is this keyboard good for beginners?", a: "Yes, the PSR-E373 is excellent for beginners due to its touch-sensitive keys, wide range of sounds, and built-in lesson functions." },
            { q: "Can I connect it to a computer?", a: "Yes, it has a USB TO HOST port for MIDI and audio transfer to a computer or smart device." },
            { q: "Does it come with a power adapter?", a: "This can vary by retailer. Please check the product listing. It can also run on 6 AA batteries." }
        ],
        buyLinks: [
            { marketplace: "Amazon IN", url: "https://www.amazon.in/s?k=Yamaha+PSR-E373" },
            { marketplace: "Bajaoo", url: "https://www.bajaoo.com/products/yamaha-psr-e373-portable-keyboard" }
        ]
    },
    {
        id: 2,
        name: "Fender Player Stratocaster",
        brand: "Fender",
        category: "Guitar",
        image: "images/fender-strat.jpg",
        price: 55000,
        short_description: "Classic Stratocaster sound and style with modern features.",
        detailed_description: "The Player Stratocaster delivers the authentic Fender feel and style. With its classic sound—bell-like high end, punchy mids, and robust low end, combined with crystal-clear articulation—the Player Stratocaster is packed with authentic Fender feel and style.",
        specs: [
            {
                "category": "Body & Neck",
                "items": [
                    { "key": "Body Material", "value": "Alder" },
                    { "key": "Neck Material", "value": "Maple" },
                    { "key": "Fretboard Material", "value": "Pau Ferro or Maple" },
                    { "key": "Frets", "value": "22 Medium Jumbo" },
                    { "key": "Scale Length", "value": "25.5\" (648 mm)" }
                ]
            },
            {
                "category": "Electronics",
                "items": [
                    { "key": "Pickups", "value": "Player Series Alnico 5 Strat Single-Coil (SSS or HSS)" },
                    { "key": "Bridge", "value": "2-Point Synchronized Tremolo" }
                ]
            },
            { "key": "Finish", "value": "Gloss Polyester" },
            { "key": "Nut Width", "value": "1.650\" (42 mm)" }
        ],
        faqs: [
            { q: "What's the difference between Pau Ferro and Maple fretboards?", a: "Maple fretboards tend to have a brighter tone and snappier attack, while Pau Ferro is tonally similar to Rosewood, offering a warmer sound. The choice is often down to player preference and aesthetics." },
            { q: "Is this guitar made in USA or Mexico?", a: "The Fender Player Series guitars are typically made in Fender's Ensenada, Mexico facility." }
        ],
        buyLinks: [
            { marketplace: "Amazon IN", url: "https://www.amazon.in/s?k=Fender+Player+Stratocaster" },
            { marketplace: "Furtados Online", url: "https://www.furtadosonline.com/fender-player-stratocaster-electric-guitar/p" }
        ]
    },
    // ... Add other instruments, updating their `specs` to the new array format and adding `faqs`.
    {
        id: 3,
        name: "Roland TD-1DMK",
        brand: "Roland",
        category: "Drums",
        image: "images/roland-td1dmk.jpg",
        price: 45000,
        short_description: "Affordable V-Drums kit with mesh-head snare and expressive sounds.",
        detailed_description: "The Roland TD-1DMK is a complete electronic drum kit perfect for drummers of any level. It offers a fulfilling drumming experience in a compact kit that’s easy to move around. The simple-yet-powerful module includes a variety of expressive drum kits, connected to dual-mesh pads for snare and toms which match the feel of playing on acoustic drums but offer quietness ideal for late-night practice.",
        specs: [
            { "key": "Kit Configuration", "value": "Snare (Mesh), Tom x3, Crash, Ride, Hi-hat, Kick Pedal, Hi-hat Pedal" },
            {
                "category": "Module Features",
                "items": [
                    { "key": "Drum Kits", "value": "15" },
                    { "key": "Coach Functions", "value": "10" },
                    { "key": "Songs", "value": "15" },
                    { "key": "Metronome", "value": "Yes" }
                ]
            },
            { "key": "Connectivity", "value": "USB MIDI, Mix In, Phones/Output" },
            { "key": "Pads", "value": "Dual-trigger mesh snare" }
        ],
        faqs: [
            { q: "Does this kit include a kick pedal?", a: "Yes, the TD-1DMK typically includes a kick pedal and a hi-hat control pedal." },
            { q: "Are the tom pads also mesh?", a: "No, in the standard TD-1DMK, only the snare pad is mesh. The tom pads are rubber." }
        ],
        buyLinks: [
            { marketplace: "Bajaoo", url: "https://www.bajaoo.com/products/roland-td-1dmk-v-drums-electronic-drum-kit" },
            { marketplace: "Amazon IN", url: "https://www.amazon.in/s?k=Roland+TD-1DMK" }
        ]
    }
];