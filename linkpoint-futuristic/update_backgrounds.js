const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const bgReplacements = [
    {
        section: 'id="rentals"',
        oldBg: `<div class="section-bg-image anim-kb-zoom" style="background-image: url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=3840&q=100')"></div>`,
        newBg: `<div class="section-bg-image anim-kb-zoom" style="background-image: url('./apartment.png'); width: 100%; height: 100%; background-size: cover; background-position: center;"></div>`
    },
    {
        section: 'id="buy"',
        oldBg: `<div class="section-bg-image anim-kb-pan" style="background-image: url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=3840&q=100')"></div>`,
        newBg: `<video class="section-bg-image anim-kb-zoom" autoplay loop muted playsinline style="object-fit: cover; width: 100%; height: 100%;"><source src="./video3.mp4" type="video/mp4"></video>`
    },
    {
        section: 'id="sell"',
        oldBg: `<div class="section-bg-image anim-pulse" style="background-image: url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=3840&q=100')"></div>`,
        newBg: `<video class="section-bg-image anim-kb-zoom" autoplay loop muted playsinline style="object-fit: cover; width: 100%; height: 100%;"><source src="./video4.mp4" type="video/mp4"></video>`
    },
    {
        section: 'id="bnbs"',
        oldBg: `<div class="section-bg-image anim-kb-zoom" style="background-image: url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=3840&q=100')"></div>`,
        newBg: `<video class="section-bg-image anim-kb-zoom" autoplay loop muted playsinline style="object-fit: cover; width: 100%; height: 100%;"><source src="./video2.mp4" type="video/mp4"></video>`
    },
    {
        section: 'id="commercial"',
        oldBg: `<div class="section-bg-image anim-kb-pan" style="background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=3840&q=100')"></div>`,
        newBg: `<video class="section-bg-image anim-kb-zoom" autoplay loop muted playsinline style="object-fit: cover; width: 100%; height: 100%;"><source src="./video1.mp4" type="video/mp4"></video>`
    }
];

bgReplacements.forEach(rep => {
    if (html.includes(rep.oldBg)) {
        html = html.replace(rep.oldBg, rep.newBg);
        console.log('Replaced background for', rep.section);
    } else {
        console.log('Could not find old background for', rep.section);
    }
});

fs.writeFileSync('index.html', html);
