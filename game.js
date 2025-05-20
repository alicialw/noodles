// Pixi.js application
let app;
let sprites = {};
const ORIGINAL_ASSET_SIZE = 1024; // Original asset size

// Current state
const state = {
    protein: false,
    fiber: false,
    healthyFat: false,
    soupiness: 3,
    spiciness: 2,
    saltiness: 3,
    sweetness: 1,
    sourness: 1
};

// Initialize the application
function init() {
    app = new PIXI.Application({
        width: 1024,
        height: 1024,
        backgroundColor: 0xffffff,
        transparent: true,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
    });

    const container = document.getElementById('canvas-container');
    container.appendChild(app.view);

    // CSS
    app.view.style.width = '100%';
    app.view.style.height = 'auto';
    app.view.style.objectFit = 'contain';

    loadAssets();
    setupControls();
}

// Load all assets
function loadAssets() {
    const assets = [
        // Base vase
        'media/game/base_vase.png',

        // Healthy fat
        'media/game/healthyfat_yes_soupy_1.png', 'media/game/healthyfat_yes_soupy_2.png', 'media/game/healthyfat_yes_soupy_3.png',
        'media/game/healthyfat_yes_soupy_4.png', 'media/game/healthyfat_yes_soupy_5.png',
        'media/game/healthyfat_no_soupy_1.png', 'media/game/healthyfat_no_soupy_2.png', 'media/game/healthyfat_no_soupy_3.png',
        'media/game/healthyfat_no_soupy_4.png', 'media/game/healthyfat_no_soupy_5.png',

        // Protein
        'media/game/protein_yes_soupy_1.png', 'media/game/protein_yes_soupy_2.png', 'media/game/protein_yes_soupy_3.png',
        'media/game/protein_yes_soupy_4.png', 'media/game/protein_yes_soupy_5.png',
        'media/game/protein_no_soupy_1.png', 'media/game/protein_no_soupy_2.png', 'media/game/protein_no_soupy_3.png',
        'media/game/protein_no_soupy_4.png', 'media/game/protein_no_soupy_5.png',

        // Fiber
        'media/game/fiber_yes_soupy_1.png', 'media/game/fiber_yes_soupy_2.png', 'media/game/fiber_yes_soupy_3.png',
        'media/game/fiber_yes_soupy_4.png', 'media/game/fiber_yes_soupy_5.png',
        'media/game/fiber_no_soupy_1.png', 'media/game/fiber_no_soupy_2.png', 'media/game/fiber_no_soupy_3.png',
        'media/game/fiber_no_soupy_4.png', 'media/game/fiber_no_soupy_5.png',

        // Spiciness
        'media/game/spicy_0.png', 'media/game/spicy_1.png', 'media/game/spicy_2.png',
        'media/game/spicy_3.png', 'media/game/spicy_4.png', 'media/game/spicy_5.png',

        // Flavor
        'media/game/flavor_0.png', 'media/game/flavor_1.png', 'media/game/flavor_2.png',
        'media/game/flavor_3.png', 'media/game/flavor_4.png', 'media/game/flavor_5.png'
    ];

    PIXI.Assets.load(assets).then(setupVessel).catch(error => {
        console.error("Error loading assets:", error);
    });
}

// Setup
function setupVessel() {
    sprites.container = new PIXI.Container();
    sprites.container.position.set(app.screen.width / 2, app.screen.height / 2);
    app.stage.addChild(sprites.container);

    // Base vase
    sprites.base = new PIXI.Sprite(PIXI.Assets.get('media/game/base_vase.png'));
    sprites.base.anchor.set(0.5);
    sprites.container.addChild(sprites.base);

    // Flavor container
    sprites.flavorContainer = new PIXI.Container();
    sprites.container.addChild(sprites.flavorContainer);

    // Healthy fat
    sprites.healthyFat = { yes: [], no: [] };
    for (let i = 1; i <= 5; i++) {
        const yesSprite = new PIXI.Sprite(PIXI.Assets.get(`media/game/healthyfat_yes_soupy_${i}.png`));
        yesSprite.anchor.set(0.5);
        yesSprite.visible = false;
        sprites.container.addChild(yesSprite);
        sprites.healthyFat.yes.push(yesSprite);

        const noSprite = new PIXI.Sprite(PIXI.Assets.get(`media/game/healthyfat_no_soupy_${i}.png`));
        noSprite.anchor.set(0.5);
        noSprite.visible = false;
        sprites.container.addChild(noSprite);
        sprites.healthyFat.no.push(noSprite);
    }

    // Protein layers
    sprites.protein = { yes: [], no: [] };
    for (let i = 1; i <= 5; i++) {
        const yesSprite = new PIXI.Sprite(PIXI.Assets.get(`media/game/protein_yes_soupy_${i}.png`));
        yesSprite.anchor.set(0.5);
        yesSprite.visible = false;
        yesSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY; // Add multiply blend mode
        sprites.container.addChild(yesSprite);
        sprites.protein.yes.push(yesSprite);

        const noSprite = new PIXI.Sprite(PIXI.Assets.get(`media/game/protein_no_soupy_${i}.png`));
        noSprite.anchor.set(0.5);
        noSprite.visible = false;
        noSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY; // Add multiply blend mode
        sprites.container.addChild(noSprite);
        sprites.protein.no.push(noSprite);
    }

    // Fiber layers
    sprites.fiber = { yes: [], no: [] };
    for (let i = 1; i <= 5; i++) {
        const yesSprite = new PIXI.Sprite(PIXI.Assets.get(`media/game/fiber_yes_soupy_${i}.png`));
        yesSprite.anchor.set(0.5);
        yesSprite.visible = false;
        yesSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY; // Add multiply blend mode
        sprites.container.addChild(yesSprite);
        sprites.fiber.yes.push(yesSprite);

        const noSprite = new PIXI.Sprite(PIXI.Assets.get(`media/game/fiber_no_soupy_${i}.png`));
        noSprite.anchor.set(0.5);
        noSprite.visible = false;
        noSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY; // Add multiply blend mode
        sprites.container.addChild(noSprite);
        sprites.fiber.no.push(noSprite);
    }

    // Sweet
    sprites.flavor = [];
    for (let i = 0; i <= 5; i++) {
        const sprite = new PIXI.Sprite(PIXI.Assets.get(`media/game/flavor_${i}.png`));
        sprite.anchor.set(0.5);
        sprite.visible = false;
        sprites.flavorContainer.addChild(sprite);
        sprites.flavor.push(sprite);
    }

    // Salt
    sprites.salt = [];
    for (let i = 0; i <= 5; i++) {
        const saltSprite = new PIXI.Sprite(PIXI.Assets.get(`media/game/flavor_${i}.png`));
        saltSprite.anchor.set(0.5);
        saltSprite.position.y = -72;
        saltSprite.visible = false;
        sprites.flavorContainer.addChild(saltSprite);
        sprites.salt.push(saltSprite);
    }

    // Sour
    sprites.sour = [];
    for (let i = 0; i <= 5; i++) {
        const sourSprite = new PIXI.Sprite(PIXI.Assets.get(`media/game/flavor_${i}.png`));
        sourSprite.anchor.set(0.5);
        sourSprite.position.y = 72;
        sourSprite.visible = false;
        sprites.flavorContainer.addChild(sourSprite);
        sprites.sour.push(sourSprite);
    }

    // Spiciness
    sprites.spiciness = [];
    for (let i = 0; i <= 5; i++) {
        const sprite = new PIXI.Sprite(PIXI.Assets.get(`media/game/spicy_${i}.png`));
        sprite.anchor.set(0.5);
        sprite.visible = false;
        sprite.blendMode = PIXI.BLEND_MODES.SCREEN;
        sprites.flavorContainer.addChild(sprite);
        sprites.spiciness.push(sprite);
    }

    const warmOverlay = new PIXI.Graphics();
    warmOverlay.beginFill(0xf2e6d6);
    warmOverlay.drawRect(-app.screen.width / 2, -app.screen.height / 2, app.screen.width, app.screen.height);
    warmOverlay.endFill();
    warmOverlay.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    sprites.container.addChild(warmOverlay);

    // Update the visualization based on initial state
    updateVisualization();
}

// Update the visualization based on the current state
function updateVisualization() {
    if (!sprites.base) return;

    // Get the current soupiness index
    const soupIndex = state.soupiness - 1;

    // Update healthy fat visibility
    if (sprites.healthyFat) {
        for (let i = 0; i < sprites.healthyFat.yes.length; i++) {
            sprites.healthyFat.yes[i].visible = state.healthyFat && (i === soupIndex);
            sprites.healthyFat.no[i].visible = !state.healthyFat && (i === soupIndex);
        }
    }

    // Update protein visibility
    if (sprites.protein) {
        for (let i = 0; i < sprites.protein.yes.length; i++) {
            sprites.protein.yes[i].visible = state.protein && (i === soupIndex);
            sprites.protein.no[i].visible = !state.protein && (i === soupIndex);
        }
    }

    // Update fiber visibility
    if (sprites.fiber) {
        for (let i = 0; i < sprites.fiber.yes.length; i++) {
            sprites.fiber.yes[i].visible = state.fiber && (i === soupIndex);
            sprites.fiber.no[i].visible = !state.fiber && (i === soupIndex);
        }
    }

    // First hide all flavor elements
    if (sprites.flavor) {
        for (let i = 0; i < sprites.flavor.length; i++) {
            sprites.flavor[i].visible = false;
        }
    }

    if (sprites.salt) {
        for (let i = 0; i < sprites.salt.length; i++) {
            sprites.salt[i].visible = false;
        }
    }

    if (sprites.sour) {
        for (let i = 0; i < sprites.sour.length; i++) {
            sprites.sour[i].visible = false;
        }
    }

    // Then show only the active flavor elements
    if (sprites.flavor && state.sweetness < sprites.flavor.length) {
        sprites.flavor[state.sweetness].visible = true;
        console.log(`Showing sweet sprite ${state.sweetness}`);
    }

    if (sprites.salt && state.saltiness < sprites.salt.length) {
        sprites.salt[state.saltiness].visible = true;
        console.log(`Showing salt sprite ${state.saltiness} at y=${sprites.salt[state.saltiness].position.y}`);
    }

    if (sprites.sour && state.sourness < sprites.sour.length) {
        sprites.sour[state.sourness].visible = true;
        console.log(`Showing sour sprite ${state.sourness} at y=${sprites.sour[state.sourness].position.y}`);
    }

    // Update spiciness overlay (on top of everything)
    if (sprites.spiciness) {
        for (let i = 0; i < sprites.spiciness.length; i++) {
            sprites.spiciness[i].visible = (i === state.spiciness);
        }
    }
}

// Set up initial values for controls based on state
function setInitialControlValues() {
    // Toggle controls
    document.getElementById('protein').checked = state.protein;
    document.getElementById('fiber').checked = state.fiber;
    document.getElementById('healthyFat').checked = state.healthyFat;

    // Slider controls
    document.getElementById('soupiness').value = state.soupiness;
    document.getElementById('spiciness').value = state.spiciness;
    document.getElementById('saltiness').value = state.saltiness;
    document.getElementById('sweetness').value = state.sweetness;
    document.getElementById('sourness').value = state.sourness;
}

// Set up event listeners for UI controls
function setupControls() {
    // Toggle controls
    document.getElementById('protein').addEventListener('change', (e) => {
        state.protein = e.target.checked;
        updateVisualization();
    });

    document.getElementById('fiber').addEventListener('change', (e) => {
        state.fiber = e.target.checked;
        updateVisualization();
    });

    document.getElementById('healthyFat').addEventListener('change', (e) => {
        state.healthyFat = e.target.checked;
        updateVisualization();
    });

    // Slider controls
    document.getElementById('soupiness').addEventListener('input', (e) => {
        state.soupiness = parseInt(e.target.value);
        updateVisualization();
    });

    document.getElementById('spiciness').addEventListener('input', (e) => {
        state.spiciness = parseInt(e.target.value);
        updateVisualization();
    });

    document.getElementById('saltiness').addEventListener('input', (e) => {
        state.saltiness = parseInt(e.target.value);
        updateVisualization();
    });

    document.getElementById('sweetness').addEventListener('input', (e) => {
        state.sweetness = parseInt(e.target.value);
        updateVisualization();
    });

    document.getElementById('sourness').addEventListener('input', (e) => {
        state.sourness = parseInt(e.target.value);
        updateVisualization();
    });

    // Save button
    document.getElementById('save-button').addEventListener('click', saveVessel);

    // Set initial values for controls
    setInitialControlValues();
}

// Save the vessel as an image

function saveVessel() {
    const renderTexture = PIXI.RenderTexture.create({
        width: 1024,
        height: 1024
    });

    const background = new PIXI.Graphics();
    background.beginFill(0xffffff);
    background.drawRect(0, 0, 1024, 1024);
    background.endFill();

    const tempContainer = new PIXI.Container();
    tempContainer.addChild(background);

    const originalParent = sprites.container.parent;
    const originalIndex = originalParent.children.indexOf(sprites.container);
    const originalPosition = {
        x: sprites.container.position.x,
        y: sprites.container.position.y
    };

    originalParent.removeChild(sprites.container);

    tempContainer.addChild(sprites.container);
    sprites.container.position.set(512, 512);

    app.renderer.render(tempContainer, { renderTexture });

    tempContainer.removeChild(sprites.container);
    if (originalIndex >= 0) {
        originalParent.addChildAt(sprites.container, originalIndex);
    } else {
        originalParent.addChild(sprites.container);
    }
    sprites.container.position.set(originalPosition.x, originalPosition.y);

    const canvas = app.renderer.extract.canvas(renderTexture);

    renderTexture.destroy(true);
    tempContainer.destroy(true);

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "noodle-bloom.png";
    link.href = image;
    link.click();
}

// Initialize when the page loads
window.addEventListener('load', init);