const log = console.log;

// the application
(async() => {

    // make sure we initialize our application
    const application = new PIXI.Application();

    // in here we can change our initialization properties
    await application.init({ 
        width: 1024,
        height: 768,
        /// we can also say
        // resizeTo: window,
        /// or, to resize it to the current window size
        // width: window.innerWidth,
        // height: window.innerHeight,

        // if we want to change the opacity of the background
        backgroundAlpha: 1,
        // we can also change the background color
        backgroundColor: 0xA3A3A3
    });

    // we need to set the position of the canvas to absolute, so that we don't have to resize our page
    application.canvas.style.position = 'absolute';

    document.body.appendChild(application.canvas);

    // time to load an image
    // in order to use images in our project, we have to load images into Texture assets, use the Texture to create a Sprite, and then add the Sprite to the Stage
    // lets import an image asset step by step

    // step 1, get the image from a folder and save it as a texture
    const desertBlockTexture = await PIXI.Assets.load('./images/desert-block.png');
    // !!! to stop our sprite from looking blurry, be sure to make the scale mode 'nearest'
    desertBlockTexture.source.scaleMode = 'nearest';
    // step 2
    const desertBlockSprite = new PIXI.Sprite(desertBlockTexture);
    // we can also change its scale
    desertBlockSprite.scale.x = 1;
    desertBlockSprite.scale.y = 1;
    // we can also set the scale in one function to get the same result
    desertBlockSprite.scale.set(1,1);
    // we can then transform the object using a few different methods
    desertBlockSprite.x = 32;
    desertBlockSprite.y = 32;
    // or
    desertBlockSprite.position.x = 32;
    desertBlockSprite.position.y = 32;
    // or
    desertBlockSprite.position.set(32,32);
    // we can also rotate the object
    desertBlockSprite.rotation = 0;
    // remember: we have to set the pivot point of our sprite to the center of the object, otherwise it will be in the top right by default
    desertBlockSprite.anchor.x = 0.5;
    desertBlockSprite.anchor.y = 0.5;

    // let's also change the cursor when the player hovers over it
    desertBlockSprite.cursor = 'pointer';

    // since we want it to appear the player is moving through the world, we have to add a container for our world objects.
    // because there are no cameras in PIXI, we have to simulate one by moving the world around the player in the opposite direction of movement
    // this can be a bit complex to grasp. for more information about containers, see https://waelyasmina.net/articles/pixi-js-tutorial-for-complete-beginners/#containers:~:text=the%20canvas%20respectively.-,Containers,-A%20Container%20in
    
    // make our container
    const worldContainer = new PIXI.Container();
    // lets also define a size for our map in pixels. this will extend off the screen
    const worldX = 2000; const worldY = 2000;
    const worldSize = { worldX, worldY };
    // lets center the pivot of our container so that the world itself is centered in the game
    worldContainer.pivot.x = worldX / 2; // half our world width
    worldContainer.pivot.y = worldY / 2; // half our world height
    // now lets center the worldContainer to the center of the screen, so that the game starts in the center
    worldContainer.position.x = application.canvas.width/2;
    worldContainer.position.y = application.canvas.height/2;
    // add it to the world and place it beneath everything using the function '.addChildAt(obj, depth)'
    application.stage.addChildAt(worldContainer,0);
     // this variable controls the scale of the world container, allowing us to zoom in and out
    let worldScale = 2; // we'll come back to this later.
    
    // then once the world container is created, add the object to it
    // depth of objects is determined by the order they are added. newer objects are placed higher up
    // notice as well: we are using the 'worldContainer' instead of 'application' in this case
    worldContainer.addChild(desertBlockSprite);
    
    // since we want our environment to be populated with lots of walls, lets add a lot of them using a for loop
    // now lets place our tiles throughout the world.

    // lets set a chance amount that a tile is placed every placement, so that we get a nice spread of them throughout the map
    const wallPlacementChance = 10;

    // set the wall tile spacing to larger than the size of the sprite so that we can place them spaced out in the environment
    const wallTileSpacing = 48 * 2;
    let wallTiles = []; // this array holds all of our wall tiles in the game, so we can check against them later
    
    // then let's loop and place some walls
    for (let x = 0; x < worldSize.worldX; x += wallTileSpacing) {
        for (let y = 0; y < worldSize.worldY; y += wallTileSpacing)
            {
                // lets check against our placement chance to see if we are placing a tile
                if (Math.floor(Math.random() * 100) < wallPlacementChance) {
                    // create a new sprite
                    var spr = new PIXI.Sprite(desertBlockTexture);
                    // noice that, here we use the normal "addChild" function so that our objects are always placed at the highest possible depth
                    worldContainer.addChild(spr).position.set(x,y);
                    // now lets create a new rectangle over the blocks, so that we can have collisions with players and enemies
                    var rec = new PIXI.Graphics()
                            // we use .rect to define it as a rectangle then input the x, y, width, and height
                            // be sure to call the shape function before .fill or .stroke, if you call it afterwards it will not render!
                            .rect(6,3,34,48) // these are teh demensions we want to have for the COLLIISION of the wall
                            // we then have to fill the rectangle
                            .fill({
                            color: 0x000000,
                            alpha: 1}
                    );
                    // add it to this block
                    worldContainer.addChild(rec);
                    rec.position = spr.position;
                    // then calculate the pivot point 
                    //rec.pivot.x = rec.position.x + rec.width/2;
                    //rec.pivot.y = rec.position.y + rec.height/2;
                    // then add our sprite to the array
                    wallTiles.push(rec);
                }
        }
    }

    /// if we want things to happen in the game, we need to use a ticker
    /// tickers essentially run the game, and all of the code within them is executed at the framerater of the user's monitor
    /// in most cases this will be 60fps, in others it may be 120fps, or more

    // let's create a time variable to track how far along in the game we are
    let time = 0;

    // then run the ticker once every frame, increasing time and moving our sprite
    application.ticker.add(() => {

        // running code here will run once ever frame
        time += 1;
    });

    // when we want to load an asset but that asset might be too big to load quickly, 
    // we want to make sure we have the asset before we try to use it
    //       we use the await keyword to make sure this line waits before executing the next one
    const gunkTexture = await PIXI.Assets.load('./images/ground-gunk.png');
    const gunkSprite = new PIXI.Sprite(gunkTexture);
    gunkSprite.position.set(300, 300);
    worldContainer.addChild(gunkSprite);

    // now that that's setup, lets tile some sprites around the area. PIXI has a constructor setup for this, but it is a bit easier to do it by hand
    // we can import all four of our sprites from our folder
    const floorTileTexture1 = await PIXI.Assets.load('/images/desert-tile-1.png');
    floorTileTexture1.source.scaleMode = 'nearest';
    const floorTileTexture2 = await PIXI.Assets.load('/images/desert-tile-2.png');
    floorTileTexture2.source.scaleMode = 'nearest';
    const floorTileTexture3 = await PIXI.Assets.load('/images/desert-tile-3.png');
    floorTileTexture3.source.scaleMode = 'nearest';
    const floorTileTexture4 = await PIXI.Assets.load('/images/desert-tile-4.png'); // our flower
    floorTileTexture4.source.scaleMode = 'nearest';

    // lets put those textures into an array so we can use them more easily
    const floorTileTextures = [floorTileTexture1, floorTileTexture2, floorTileTexture3, floorTileTexture4];

    // set the floor tile size to the size of the sprite so that we can place them correctly
    const floorTileSize = 64;
  
    let renderFloor = false;
    // now lets place our tiles throughout the world.
    if (renderFloor)
    {
        for (let x = 0; x < worldSize.worldX; x += floorTileSize) {
            for (let y = 0; y < worldSize.worldY; y += floorTileSize)
                {
                    // let's choose one of our floor tile textures at random
                    var i = Math.floor(Math.random() * 3);
                    // since our fourth tile is a flower and we want that to be extra rare, lets make a small chance for it to appear when i = 2
                    if (i == 2) {
                        // now about every one in 80 tiles is a flower
                        var c = Math.floor(Math.random() * 10);
                        i = c <= 1 ? i+1 : i;
                    }
                    // then pick one of the textures to be the one we are using
                    var t = floorTileTextures[i];
                    // create a new sprite using the texture we've chosen
                    var spr = new PIXI.Sprite(t);
                    // lets make sure their anchors are centered too
                    spr.anchor = 0.5;
                    // since in this case our textures are slightly smaller than they should be, we can modify their scale here
                    spr.scale = 2;
                    // here we use the addChildAt function and place the objects as low as they can be placed
                    // notice as well: we are using the 'worldContainer' instead of 'application' in this case
                    worldContainer.addChildAt(spr,0).position.set(x,y);
            }
        }
    }

    // since our objects are very small, we want to be able to 

    // lets import a sprite sheet, in this case we'll do the idle fish
    // lets create the data for the atlast
    const playerIdleAtlasData =
    {
        frames: {
            idle1:{
                frame: {x: 0, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            },
            idle2:{
                frame: {x: 28, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            },
            idle3:{
                frame: {x: 56, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            },
            idle4:{
                frame: {x: 84, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            }
        },

        // then after our frames, add the information about the object
        meta: {
            image: '/images/fish-idle.png',
            size: {w: 108, h: 24}
        },

        // and then lets declare our animations on the sheet
        animations: {
            // array the frams by name
            idle: ['idle1', 'idle2', 'idle3', 'idle4']
        }
    }

    // then lets import the spritesheet
    const playerIdleTexture = await PIXI.Assets.load(playerIdleAtlasData.meta.image);
    const playerIdleSpritesheet = new PIXI.Spritesheet(playerIdleTexture, playerIdleAtlasData);
    // then parse the spritesheet so that we can use it
    await playerIdleSpritesheet.parse();
    // now let's create an animated sprite for our player
    const playerIdleSprite = new PIXI.AnimatedSprite(playerIdleSpritesheet.animations.idle);
    // now, make sure you play the object so that the animation begins
    playerIdleSprite.play();
    // we can also set the animation speed
    playerIdleSprite.animationSpeed = 0.1;
    let localPlayerScale = -0.4; // how much is the player's local scale modified in the world container?
    playerIdleSprite.scale = worldScale + localPlayerScale; // scale our player with the world
    // set our scale mode
    playerIdleTexture.source.scaleMode = 'nearest';
    // then, add it to the stage
    // we need to set our sprite's anchor to the center
    playerIdleSprite.anchor.x = 0.5;
    playerIdleSprite.anchor.y = 0.5;
    // position them in the center of the world
    playerIdleSprite.position.x = worldX / 2;
    playerIdleSprite.position.y = worldY / 2;

    worldContainer.addChild(playerIdleSprite);

    // then so that we can check collisions later, add an invisible rectangle over the player
    const playerBox = new PIXI.Graphics()
    .rect(-6,-6,12,12)
    // we then have to fill the rectangle
    .fill({
        color: 0x000000,
        alpha: 1
    });
    // then child the playerBox to the player
    playerBox.position.x = playerIdleSprite.position.x;
    playerBox.position.y = playerIdleSprite.position.y;
    application.stage.addChildAt(playerBox, application.stage.children.length);


    // you can find more about the keyboard code below, here - https://github.com/kittykatattack/learningPixi?tab=readme-ov-file#keyboard
    // here is a full list of key codes to be used - https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values

    // now we need a function to perform keyboard inputs
    function keyboard(value) {
        const key = {};
        key.value = value;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = (event) => {
          if (event.key === key.value) {
            if (key.isUp && key.press) {
              key.press();
            }
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
          }
        };
      
        //The `upHandler`
        key.upHandler = (event) => {
          if (event.key === key.value) {
            if (key.isDown && key.release) {
              key.release();
            }
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
          }
        };
      
        //Attach event listeners
        const downListener = key.downHandler.bind(key);
        const upListener = key.upHandler.bind(key);
        
        window.addEventListener("keydown", downListener, false);
        window.addEventListener("keyup", upListener, false);
        
        // Detach event listeners
        key.unsubscribe = () => {
          window.removeEventListener("keydown", downListener);
          window.removeEventListener("keyup", upListener);
        };
        
        return key;
      }

    // we want to work with movement, so lets setup some axes
    var px = 0; var py = 0;
    let input = {px , py};
    let moveSpeed = 2;

    // now we can create our key objects to listen for specific keys
    const wKey = keyboard('w');
    const sKey = keyboard('s');
    const dKey = keyboard('d');
    const aKey = keyboard('a');
    const plusKey = keyboard('=');
    const minusKey = keyboard('-');
    const arrowUp = keyboard('ArrowUp');
    const arrowDown = keyboard('ArrowDown');
    const arrowRight = keyboard('ArrowRight');
    const arrowLeft = keyboard('ArrowLeft');
    const rKey = keyboard('r');
    // we can then do specific things with our keys
    function capturePlayerInput()
    {
        // reset it each frame
        input.px = 0;
        input.py = 0;      

        // now, get our input directions
        if (wKey.isDown) input.py = -1;
        if (sKey.isDown) input.py = 1;
        if (dKey.isDown) input.px = 1;
        if (aKey.isDown) input.px = -1;

        if (arrowUp.isDown) moveCamera(0,1);
        if (arrowDown.isDown) moveCamera(0,-1);
        if (arrowRight.isDown) moveCamera(-1,0);
        if (arrowLeft.isDown) moveCamera(1,0);
    }

    // now handle our key presses through the events of the objects
    plusKey.press = () => {
        worldScale += 0.1;
        worldContainer.position.x = application.canvas.width/2;
        worldContainer.position.y = application.canvas.height/2;

        // also reset the player's position locally in the world container
        playerIdleSprite.position.x = worldContainer.pivot.x;
        playerIdleSprite.position.y = worldContainer.pivot.y;
    }

    minusKey.press = () => {
        worldScale -= 0.1;
        worldContainer.position.x = application.canvas.width/2;
        worldContainer.position.y = application.canvas.height/2;
        
        // also reset the player's position locally in the world container
        playerIdleSprite.position.x = worldContainer.pivot.x;
        playerIdleSprite.position.y = worldContainer.pivot.y;
    }

    rKey.press = () => {
        setCameraPosition(0,0);
    }

    // the world x and y on the last frame
    let worldXLF = 0;
    let worldYLF = 0;

    // then let's apply our character's movement to our world
    function applyPlayerMovement()
    {
        // always make sure the player's box is at their position
        playerBox.position = playerIdleSprite.getGlobalPosition();

        if (input.px + input.py > 1)
        {
            var finalInput = input.px + input.py;
            var mult = 1 - (finalInput - 1); // lower this by the amount that it is over 1
            input.x *= mult;
            input.y *= mult;
        }

        // set our last-frame positions
        worldXLF = worldContainer.position.x;
        worldYLF = worldContainer.position.y;
        // then move our world around, so that we can move through it
        worldContainer.position.x -= input.px * moveSpeed;
        worldContainer.position.y -= input.py * moveSpeed;
        
        worldContainer.scale = worldScale;

        // now get our world delta
        let worldXDelta = worldXLF - worldContainer.position.x;
        let worldYDelta = worldYLF - worldContainer.position.y;
        // since we want the player to move exactly the same amount as the world is, we need to get how much the world has moved since last frame, and move the player with it
        // after that move our player around, so that they always stay in the centered on the screen

        // check if the player is colliding with all of our box colliders
        for (let i = 0; i < wallTiles.length; i++)
        {
            // now compare the player's box to all of the boxes of the tiles
            attemptPlayerMovement(cursorSprite, wallTiles[i]);
        }

        // to make sure this works correctly we need to modify the global object position
        playerIdleSprite.position.x += worldXDelta / worldScale; // we divide this number by the world scale so that it moves according to the relative scale of the environment
        playerIdleSprite.position.y += worldYDelta / worldScale; // when we change the container size it is changing in pixels, so the delta will be more / less pixels in size.
    
        // pointInBounds([mousePositionX, mousePositionY], [0,0], [80,100]);
    }

    let debugTL = new PIXI.Graphics()
    .rect(0,0,10,10)
    // we then have to fill the rectangle
    .fill({
        color: 0xff0000, // red
        alpha: 1
    });

    let debugTR = new PIXI.Graphics()
    .rect(0,0,10,10)
    // we then have to fill the rectangle
    .fill({
        color: 0x00ff00, // green
        alpha: 1
    });

    let debugBL = new PIXI.Graphics()
    .rect(0,0,10,10)
    // we then have to fill the rectangle
    .fill({
        color: 0x00ffff, // blue
        alpha: 1
    });

    let debugBR = new PIXI.Graphics()
    .rect(0,0,10,10)
    // we then have to fill the rectangle
    .fill({
        color: 0xff00ff, // magenta
        alpha: 1
    });

    // new container for debug
    const debugContainer = new PIXI.Container();
    application.stage.addChildAt(debugContainer,application.stage.children.length);
    debugContainer.addChild(debugTL);
    debugContainer.addChild(debugTR);    
    debugContainer.addChild(debugBL);
    debugContainer.addChild(debugBR);

    // this function checks a position ahead of the player, to check if the movement is valid or not
    function attemptPlayerMovement(rectA, rectB)
    {
        // get our first rectangle's top left, top right, bottom left, and bottom right points
        var aPx, aPy, aTLX, aTLY, aTRX, aTRY, aBLX, aBLY, aBRX, aBRY;

        // pivot
        aPx = rectA.getGlobalPosition().x;
        aPy = rectA.getGlobalPosition().y;

        colcheckText.text = aPx + ", " + aPy;

        // shape
        aTLX = aPx - rectA.width/2;
        aTLY = aPy - rectA.height/2;
        aTRX = aPx + rectA.width/2;
        aTRY = aPy - rectA.height/2;        
        aBLX = aPx - rectA.width/2;
        aBLY = aPy + rectA.height/2;
        aBRX = aPx + rectA.width/2;
        aBRY = aPy + rectA.height/2;

        var aTopLeft = [aTLX, aTLY];
        var aTopRight = [aTRX, aTRY];
        var aBottomLeft = [aBLX, aBLY];
        var aBottomRight = [aBRX, aBRY];

        // get the same points for the second rectangle
        var bPx, bPy, bTLX, bTLY, bTRX, bTRY, bBLX, bBLY, bBRX, bBRY;
        
        colcheckText2.text = aPx + ", " + aPy;
        // pivot
        bPx = rectB.getGlobalPosition().x;
        bPy = rectB.getGlobalPosition().y;
        // shape
        bTLX = bPx - rectB.width/2;
        bTLY = bPy - rectB.height/2;
        bTRX = bPx + rectB.width/2;
        bTRY = bPy + rectB.height/2;        
        bBLX = bPx - rectB.width/2;
        bBLY = bPy - rectB.height/2;
        bBRX = bPx + rectB.width/2;
        bBRY = bPy + rectB.height/2;

        var bTopLeft = [bTLX, bTLY];
        var bTopRight = [bTRX, bTRY];
        var bBottomLeft = [bBLX, bBLY];
        var bBottomRight = [bBRX, bBRY];

        // // show our debug
        // debugTR.position.x = aTopRight[0];
        // debugTR.position.y = aTopRight[1];

        // debugTL.position.x = aTopLeft[0];
        // debugTL.position.y = aTopLeft[1];

        // debugBR.position.x = aBottomRight[0];
        // debugBR.position.y = aBottomRight[1];

        // debugBL.position.x = aBottomLeft[0];
        // debugBL.position.y = aBottomLeft[1];
        
        debugTR.position.x = bTopRight[0];
        debugTR.position.y = bTopRight[1];

        debugTL.position.x = bTopLeft[0];
        debugTL.position.y = bTopLeft[1];

        debugBR.position.x = bBottomRight[0];
        debugBR.position.y = bBottomRight[1];

        debugBL.position.x = bBottomLeft[0];
        debugBL.position.y = bBottomLeft[1];


        // now compare all of the positions from rectA to the the positions in rectB for overlaps,
        // then compare all the positions in rectB for A overlaps
        if (
        (pointInBounds(aTopLeft, bTopLeft, bBottomRight) ||
        pointInBounds(aTopRight, bTopLeft, bBottomRight) || 
        pointInBounds(aBottomRight, bTopLeft, bBottomRight) ||
        pointInBounds(aBottomLeft, bTopLeft, bBottomRight))
        )
        {
            colcheckText2.style.fill = '#ff0000';
        } else {
            // colcheckText2.style.fill = '#ffffff';
        }
    }

    // checks if a point is within a bound
    function pointInBounds(point, topLeft, bottomRight)
    {
        // if we're in between the two X points and the two Y points
        if ((point[0] > topLeft[0] & point[0] < bottomRight[0]) & (point[1] > topLeft[1] & point[1] < bottomRight[1]))
        {
            // collision has occured because a point within the two bounds overlapped with another of the bounds!
            console.log("collision: " + point[0] + ", " + point[1]);
            return true;
        } else {
            return false;
        }
    }

    // now apply movement to the player
    application.ticker.add(() => {
        capturePlayerInput();
        applyPlayerMovement();
    });

    /// now we want to work on the camera for our environment
    /// since we already have our world setup, our camera can manipulate that relatively for things like
    /// linear interpolation, screenshake, or other movements

    // let's start with our camera container
    const cameraContainer = new PIXI.Container();
    // then lets add it to the application
    application.stage.addChild(cameraContainer);
    // now lets add our worldContainer to the cameraContainer
    cameraContainer.addChild(worldContainer);

    // here's a function to move the cameraContainer around
    function moveCamera(x,y)
    {
        cameraContainer.position.x += x;
        cameraContainer.position.y += y;
    }

    // here's a function to set the camera's position
    function setCameraPosition(x,y)
    {
        cameraContainer.position.x = x;
        cameraContainer.position.y = y;
    }

    /// in order to make a camera that moves relative to the player as a very nice game-feel camera, we're going to interpolate
    /// its position between the center of the screen and the mouse's position on the screen, so lets store and get the mouse position
    let mousePositionX = 0;
    let mousePositionY = 0;

    // enable interactivity
    application.stage.eventMode = 'static';

    application.stage.addEventListener('pointermove', (e) => {
        mousePositionX = e.global.x;
        mousePositionY = e.global.y;
    });
    
    /// this function runs once per frame in its own ticker
    function cameraInterpolation()
    {
        // this is the percentage the mouse moves outward
        t = 0.5;
        // get the center point of our current screen
        let cX = application.canvas.width/2;
        let cY = application.canvas.height/2;
        // now using the position of the mouse and the center of the screen, create an interpolated position
        // lerp equation conventionally used is lerp = a + (b - a) * t, where a is our destination, b is our starting point, and t is our percentage
        var lerpPosX = mousePositionX + (cX - (mousePositionX)) * t;
        var lerpPosY = mousePositionY + (cY - (mousePositionY)) * t;
        // now set our camera's position to the lerp positions
        setCameraPosition(-lerpPosX + cX, -lerpPosY + cY);
        mousePosText.text = mousePositionX + ", " + mousePositionY;
    }

    const mousePosText = new PIXI.Text({
            text: mousePositionX + ", " + mousePositionY,
            style: {
                // fill the same as color
                fill: '#ffffff',
                // we can change the font
                fontFamily: 'Arial',
                fontSize: 20,
                fontStyle: 'italic',
                fontWeight: 'bold',
                stroke: { color: '#000000', width: 5},
            } });
    
    const colcheckText = new PIXI.Text({
            text: "",
            style: {
                // fill the same as color
                fill: '#ffffff',
                // we can change the font
                fontFamily: 'Arial',
                fontSize: 20,
                fontStyle: 'italic',
                fontWeight: 'bold',
                stroke: { color: '#000000', width: 5},
            } });

                
    const colcheckText2 = new PIXI.Text({
        text: "",
        style: {
            // fill the same as color
            fill: '#ffffff',
            // we can change the font
            fontFamily: 'Arial',
            fontSize: 20,
            fontStyle: 'italic',
            fontWeight: 'bold',
            stroke: { color: '#000000', width: 5},
        } });
    
    
    application.stage.addChild(mousePosText); 
    colcheckText.position.y = 22;       
    application.stage.addChild(colcheckText);
    colcheckText2.position.y = 44;       
    application.stage.addChild(colcheckText2);        

    // lets place a sprite in the scene as our cursor
    const cursorTexture = await PIXI.Assets.load('./images/cursor.png');
    cursorTexture.source.scaleMode = 'nearest';
    const cursorSprite = new PIXI.Sprite(cursorTexture);
    cursorSprite.scale = 2;
    cursorSprite.anchor = 0.5;
    // then lets add it to the stage
    application.stage.addChild(cursorSprite);

    // run our special ticker for camera and cursor operations
    application.ticker.add(() => {
        cameraInterpolation();
        // also handles the cursor position
        cursorSprite.position.x = mousePositionX;
        cursorSprite.position.y = mousePositionY;
    });
    
    


    /// this section features graphics functions that can assist in your process of making simple shapes, text, and colors. 
    /// they are not used in this specific demo, but you can modify them as you work with them.

    // // #region graphics functions
    // // now we can draw a rectangle using a new graphics instance
    // const rectangle = new PIXI.Graphics()
    // // we use .rect to define it as a rectangle then input the x, y, width, and height
    // // be sure to call the shape function before .fill or .stroke, if you call it afterwards it will not render!
    // .rect(200,200,200,200)
    // // we then have to fill the rectangle
    // .fill({
    //     color: 0xffea00,
    //     alpha: 1
    // })
    // // we can also use a stroke on the outside of the rectangle
    // .stroke({
    //     width: 8,
    //     color:0x00ff00
    // });

    // // there are lots of other shapes, such as 
    // // line, triangle, star, and more. You can find examples here: https://waelyasmina.net/articles/pixi-js-tutorial-for-complete-beginners/#setting_up:~:text=There%20are%20various%20shapes%20to%20choose%20from%2C%20and%20here%20are%20a%20few%20examples%3A

    // // to make some text we can say
    // const text = new PIXI.Text({
    //     text: 'Hello PIXI ',
    //     style: {
    //         // fill the same as color
    //         fill: '#ffffff',
    //         // we can change the font
    //         fontFamily: 'Arial',
    //         fontSize: 60,
    //         fontStyle: 'italic',
    //         fontWeight: 'bold',
    //         stroke: { color: '#000000', width: 5},
    //         dropShadow: {
    //             color: '#000000',
    //             blur: 4,
    //             angle: Math.PI / 6,
    //             distance: 6,
    //         },
    //         wordWrap: true,
    //         wordWrapWidth: 440
    //     } // you can find this example here: https://waelyasmina.net/articles/pixi-js-tutorial-for-complete-beginners/#setting_up:~:text=Speaking%20of%20text%20color%2C%20we%20have%20a%20wide%20variety%20of%20styles%20to%20apply%20to%20the%20text.%20These%20include%20font%20family%2C%20weight%2C%20size%2C%20color%2C%20shadows%2C%20stroke%2C%20and%20more.
    // });

    // // if you want to install new fonts, you can find the code here: https://waelyasmina.net/articles/pixi-js-tutorial-for-complete-beginners/#setting_up:~:text=Including%20the%20font%20using%20HTML%3A

    // // we can also create TextStyle objects to use with a lot of our texts
    // const ourStyle = new PIXI.TextStyle({
    //     // fill the same as color
    //     fill: '#ffffff',
    //     // we can change the font
    //     fontFamily: 'Arial',
    //     fontSize: 60,
    //     fontStyle: 'italic',
    //     fontWeight: 'bold',
    //     stroke: { color: '#000000', width: 5},
    //     dropShadow: {
    //         color: '#000000',
    //         blur: 4,
    //         angle: Math.PI / 6,
    //         distance: 6,
    //     },
    //     wordWrap: true,
    //     wordWrapWidth: 440
    // });

    // // then to use the style we can do
    // const text2 = new PIXI.Text({
    //     text: 'Hello there',
    //     ourStyle,
    //     // we can modify our postion here too
    //     x: 100,
    //     y: 100
    // })

    // // PIXI operates using a stage analogy, where all of the objects in the game are children of the stage.
    // // we add the objects to the stage by usingthe addChild() function
    // application.stage.addChild(text);
    // application.stage.addChild(text2);
    // application.stage.addChild(rectangle);

    // #endregion



})();