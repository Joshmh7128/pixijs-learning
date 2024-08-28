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
    const wTS = 44; // wTS = wall tile spacing
    let wallRects = []; // this array holds all of our wall tiles in the game, so we can check against them later
    
    // we can build off of our world center
    let worldCenter = 1024;

    // since we want to make a map of our walls, we can build a list of coordinates to place them
    var wallPositions = [
        // the center room
        // front wall right
            {
            "x" : worldCenter,
            "y" : worldCenter-(wTS*5),
        },
        {
            "x" : worldCenter+(wTS),
            "y" : worldCenter-(wTS*5),
        },
        {
            "x" : worldCenter+(wTS*2),
            "y" : worldCenter-(wTS*5),
        },
        {
            "x" : worldCenter+(wTS*3),
            "y" : worldCenter-(wTS*5),
        },
        // front wall left
        {
            "x" : worldCenter-(wTS*2),
            "y" : worldCenter-(wTS*5),
        },
        {
            "x" : worldCenter-(wTS*3),
            "y" : worldCenter-(wTS*5),
        },
        {
            "x" : worldCenter-(wTS*4),
            "y" : worldCenter-(wTS*5),
        },
        {
            "x" : worldCenter-(wTS*5),
            "y" : worldCenter-(wTS*5),
        },
        // left side wall
        {
            "x" : worldCenter-(wTS*5),
            "y" : worldCenter-(wTS*6),
        },    
        {
            "x" : worldCenter-(wTS*5),
            "y" : worldCenter-(wTS*7),
        },    
        {
            "x" : worldCenter-(wTS*5),
            "y" : worldCenter-(wTS*8),
        },    
        {
            "x" : worldCenter-(wTS*5),
            "y" : worldCenter-(wTS*9),
        },
            
        {
            "x" : worldCenter-(wTS*5),
            "y" : worldCenter-(wTS*10),
        },
        // right side wall
        {
            "x" : worldCenter+(wTS*3),
            "y" : worldCenter-(wTS*6),
        },    
        {
            "x" : worldCenter+(wTS*3),
            "y" : worldCenter-(wTS*7),
        },    
        {
            "x" : worldCenter+(wTS*3),
            "y" : worldCenter-(wTS*8),
        },    
        {
            "x" : worldCenter+(wTS*3),
            "y" : worldCenter-(wTS*9),
        },
            
        {
            "x" : worldCenter+(wTS*3),
            "y" : worldCenter-(wTS*10),
        },
        // back wall
        {
            "x" : worldCenter,
            "y" : worldCenter-(wTS*10),
        },
        {
            "x" : worldCenter+(wTS),
            "y" : worldCenter-(wTS*10),
        },
        {
            "x" : worldCenter+(wTS*2),
            "y" : worldCenter-(wTS*10),
        },
        {
            "x" : worldCenter+(wTS*3),
            "y" : worldCenter-(wTS*10),
        },
        {
            "x" : worldCenter-(wTS),
            "y" : worldCenter-(wTS*10),
        },
        {
            "x" : worldCenter-(wTS*2),
            "y" : worldCenter-(wTS*10),
        },
        {
            "x" : worldCenter-(wTS*3),
            "y" : worldCenter-(wTS*10),
        },
        {
            "x" : worldCenter-(wTS*4),
            "y" : worldCenter-(wTS*10),
        },
        {
            "x" : worldCenter-(wTS*5),
            "y" : worldCenter-(wTS*10),
        },
    ];

    // then let's loop and place some walls
    for (let i = 0; i < wallPositions.length; i ++) {
        // get our positions
        let x = wallPositions[i].x;
        let y = wallPositions[i].y;

        // create a new sprite
        var spr = new PIXI.Sprite(desertBlockTexture);
        // noice that, here we use the normal "addChild" function so that our objects are always placed at the highest possible depth
        worldContainer.addChild(spr).position.set(x,y);
        // now lets create a new rectangle over the blocks, so that we can have collisions with players and enemies
        var rec = new PIXI.Graphics()
                // we use .rect to define it as a rectangle then input the x, y, width, and height
                // be sure to call the shape function before .fill or .stroke, if you call it afterwards it will not render!
                .rect(6,3,48,48) // these are the demensions we want to have for the COLLIISION of the wall
                // we then have to fill the rectangle
                .fill({
                color: 0x000000,
                // in order to make sure we can't see these rects for our collisions, we set their alpha to 0
                alpha: 0}
        );
        // add it to this block
        worldContainer.addChildAt(rec, 0);
        rec.position = spr.position;
        // then calculate the pivot point 
        //rec.pivot.x = rec.position.x + rec.width/2;
        //rec.pivot.y = rec.position.y + rec.height/2;
        // then add our sprite to the array
        wallRects.push(rec);
    }

    // now lets create our locked door
    const lockedDoorTexture = await PIXI.Assets.load('./images/locked-desert-block.png');
    lockedDoorTexture.source.scaleMode = 'nearest';
    const lockedDoorSprite = new PIXI.Sprite(lockedDoorTexture);
    // now place the door in the world, and give it an associated rect
    worldContainer.addChild(lockedDoorSprite);
    lockedDoorSprite.position.set(worldCenter-wTS, worldCenter-wTS*5);
    // now create a hitbox for the door
    var lockedDoorRect = new PIXI.Graphics()
    .rect(6,3,34,48)
    .fill({
    color: 0x000000,
    // in order to make sure we can't see these rects for our collisions, we set their alpha to 0
    alpha: 0});
    // then position the rect
    lockedDoorRect.position = lockedDoorSprite.position;
    // add it to the world
    worldContainer.addChild(lockedDoorRect);
    // and add it to our walls
    wallRects.push(lockedDoorRect);

    // the player does not have the key
    let playerHasKey = false;

    // now we can write a function to check if the player is near the door, and if they have a key
    function lockedDoorCheck()
    {
        // this function will run every frame, and check to see if the player has a key yet
        // then if we are close to the door and have a key, destroy the door
        if (playerHasKey && getDistanceToPlayer(lockedDoorSprite) < 400)
        {
            // turn off the sprite
            lockedDoorSprite.alpha = 0;
            // remove the rect from the collision list
            lockedDoorRect.position.set(0,0);
        }
    }

    // now lets add the key to the world


    /// if we want things to happen in the game, we need to use a ticker
    /// tickers essentially run the game, and all of the code within them is executed at the framerater of the user's monitor
    /// in most cases this will be 60fps, in others it may be 120fps, or more

    // let's create a time variable to track how far along in the game we are
    let time = 0;

    // then run the ticker once every frame, increasing time and moving our sprite
    application.ticker.add(() => {
        lockedDoorCheck();
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
  
    let renderFloor = true;
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
    const playerAtlasData =
    {
        frames: {
            idle1:{
                frame: {x: 0, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            },
            idle2:{
                frame: {x: 24, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            },
            idle3:{
                frame: {x: 48, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            },
            idle4:{
                frame: {x: 24*3, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            },
            run1:{
                frame: {x: 24*4, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            },
            run2:{
                frame: {x: 24*5, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            },
            run3:{
                frame: {x: 24*6, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            },
            run4:{
                frame: {x: 24*7, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            },
            run5:{
                frame: {x: 24*8, y:0, w:24, h:24},
                sourceSize: {w:24, h:24},
            }
        },

        // then after our frames, add the information about the object
        meta: {
            image: '/images/fish-sheet.png',
            size: {w: 216, h: 24}
        },

        // and then lets declare our animations on the sheet
        animations: {
            // array the frams by name
            idle: ['idle1', 'idle2', 'idle3', 'idle4'],
            run: ['run1','run2','run3','run4','run5']
        }
    }

    // then lets import the spritesheet
    const playerTexture = await PIXI.Assets.load(playerAtlasData.meta.image);
    const playerSpritesheet = new PIXI.Spritesheet(playerTexture, playerAtlasData);
    // then parse the spritesheet so that we can use it
    await playerSpritesheet.parse();
    // now let's create an animated sprite for our player
    let playerIdleSprite = new PIXI.AnimatedSprite(playerSpritesheet.animations.idle);
    let playerRunSprite = new PIXI.AnimatedSprite(playerSpritesheet.animations.run);
    // make sure the run sprite isn't visible yet
    playerRunSprite.alpha = 0;
    // now, make sure you play the object so that the animation begins
    playerIdleSprite.play();
    playerRunSprite.play();
    // we can also set the animation speed
    playerIdleSprite.animationSpeed = 0.2;
    playerRunSprite.animationSpeed = 0.2;
    let localPlayerScale = -0.4; // how much is the player's local scale modified in the world container?
    playerIdleSprite.scale = worldScale + localPlayerScale; // scale our player with the world
    playerRunSprite.scale = worldScale + localPlayerScale; // scale our player with the world
    // set our scale mode
    playerTexture.source.scaleMode = 'nearest';
    // then, add it to the stage
    // we need to set our sprite's anchor to the center
    playerIdleSprite.anchor.x = 0.5;
    playerIdleSprite.anchor.y = 0.5;
    // position them in the center of the world
    playerIdleSprite.position.x = worldX / 2;
    playerIdleSprite.position.y = worldY / 2;
    // we need to set our sprite's anchor to the center
    playerRunSprite.anchor.x = 0.5;
    playerRunSprite.anchor.y = 0.5;
    // position them in the center of the world
    playerRunSprite.position.x = worldX / 2;
    playerRunSprite.position.y = worldY / 2;

    // now lets make a container for our player
    const playerContainer = new PIXI.Container();
    playerContainer.addChild(playerIdleSprite);
    playerContainer.addChild(playerRunSprite);
    worldContainer.addChild(playerContainer);

    // then so that we can check collisions later, add an invisible rectangle over the player
    const playerBox = new PIXI.Graphics()
    .rect(-6,-6,16,16)
    // we then have to fill the rectangle
    .fill({
        color: 0x000000,
        alpha: 1
    });
    // then child the playerBox to the player
    playerBox.position.x = playerIdleSprite.position.x;
    playerBox.position.y = playerIdleSprite.position.y;
    playerContainer.addChildAt(playerBox, application.stage.children.length);

    // function for checking the distance between and object and the player
    function getDistanceToPlayer(obj)
    {   
        var objdis = obj.getGlobalPosition();
        var playerPos = playerContainer.getGlobalPosition();
        var pdisx = objdis.x - (playerPos.x + (1024 * worldScale));
        var pdisy = objdis.y - (playerPos.y + (1024 * worldScale));
        var pdis = Math.abs(pdisx) + Math.abs(pdisy);
        return pdis;
    }

    // now lets add some NPCs
    const npcTexture = await PIXI.Assets.load('images/bandit.png');
    npcTexture.source.scaleMode = 'nearest';
    npcTexture.pivot = 0.5;
    const npcOutside = new PIXI.Sprite(npcTexture);
    const npcInside = new PIXI.Sprite(npcTexture);
    // now make two NPCs, one inside the walls and outside the walls
    npcOutside.position.set(worldCenter + 48*3, worldCenter - 48*2);
    npcInside.position.set(worldCenter - 48, worldCenter - 48*6);
    npcInside.pivot.set(npcInside.width / 2, npcInside.height / 2);
    npcOutside.pivot.set(npcOutside.width / 2, npcOutside.height / 2);
    npcOutside.scale = 2;
    npcInside.scale = 2;
    
    // then add them both to the world container
    worldContainer.addChild(npcInside);
    worldContainer.addChild(npcOutside);

    // now that the NPCs are in, lets do some checks to make sure we show the right text

    // you can find more about the keyboard code below, here - https://github.com/kittykatattack/learningPixi?tab=readme-ov-file#keyboard
    // here is a full list of key codes to be used - https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values

    // now add in our rendering text
    const npcOutsideText = new PIXI.Text({
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

    // now add in our rendering text
    const npcInsideText = new PIXI.Text({
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
        
    // set the text positions
    npcOutsideText.position.x = npcOutside.position.x - 132;
    npcOutsideText.position.y = npcOutside.position.y - 48;

    npcInsideText.position.x = npcInside.position.x - 132;
    npcInsideText.position.y = npcInside.position.y - 48;

    // add to world
    worldContainer.addChild(npcOutsideText);
    worldContainer.addChild(npcInsideText);
    // the default text
    npcOutsideText.text = "There's a key to the east of here."

    // runs every frame to check if we're interacting with NPCs
    function npcTextCheck()
    {
        // if we're near the outside npc and holding space, show the text
        if (space.isDown && getDistanceToPlayer(npcOutside) < 250)
        {
            // outside npc
            if (!playerHasKey)
                npcOutsideText.text = "There's a key to the east of here.";
            else
                npcOutsideText.text = "Great, my friend will tell you how to escape.";
        } else {
            npcOutsideText.text = "";
        }
        
        // inside npc
        if (space.isDown && getDistanceToPlayer(npcInside) < 250)
        {
            // outside npc
            npcInsideText.text = "There is an exit to the west.";
        } else {
            npcInsideText.text = "";
        }
    }

    // now add our key
    const keyTexture = await PIXI.Assets.load('images/key.png');
    keyTexture.source.scaleMode = 'nearest';
    const keySprite = new PIXI.Sprite(keyTexture);
    keySprite.position.set(worldCenter + 48 * 12, worldCenter);
    keySprite.scale.set(2,2);
    keySprite.pivot.set(keySprite.width / 2, keySprite.height / 2);
    worldContainer.addChild(keySprite);

    // now make a function to track our key progress
    function keyCheck()
    {
        // now if we are close to the key, destroy it, and change our key boolean
        if (getDistanceToPlayer(keySprite) < 100)
        {
            playerHasKey = true;
            // make it invisible
            keySprite.alpha = 0;
        }
    }

    // run a ticker for our npc text checks and key checks
    application.ticker.add(() => {
        npcTextCheck();
        keyCheck();
        pdischeckText.text = getDistanceToPlayer(keySprite);
    });

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
    let input = {px, py};
    input.px = 0;
    input.py = 0;
    let moveSpeed = 3;

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
    const space = keyboard(' ');
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

    let lastInput = input;

    function managePlayerSprites()
    {
        // now lets say that when we have movement our sprite should change
        // moving right or up
        if (input.px > 0 || input.py != 0)
        {
            // set scale
            playerIdleSprite.scale.x = (worldScale + localPlayerScale) * 1;
            playerRunSprite.scale.x = (worldScale + localPlayerScale) * 1;
            // set alpha
            playerIdleSprite.alpha = 0;
            playerRunSprite.alpha = 1;
        }

        // moving left
        if (input.px < 0)
        {
            // set scale
            playerIdleSprite.scale.x = (worldScale + localPlayerScale) * -1;
            playerRunSprite.scale.x = (worldScale + localPlayerScale) * -1;
            // set alpha
            playerIdleSprite.alpha = 0;
            playerRunSprite.alpha = 1;
        }
        
        // not moving
        if (input.px == 0 && input.py == 0)
        {
            // set alpha
            playerIdleSprite.alpha = 1;
            playerRunSprite.alpha = 0;
        }
    }
   
    // then let's apply our character's movement to our world
    function applyPlayerMovement()
    {
        // always make sure the player's box is at their position so that our collisions are accurate
        playerBox.position = playerIdleSprite.getGlobalPosition();

        // then make sure our inputs are not too fast
        if (input.px + input.py > 1)
        {
            var finalInput = input.px + input.py;
            var mult = 1 - (finalInput - 1); // lower this by the amount that it is over 1
            input.x *= mult;
            input.y *= mult;
        }

        // run this while doing movement
        managePlayerSprites();

        // now we want to check and ensure that we can move to the new position. If the player's new proposed movement position is
        // within the bounds of a wall collider, then we cannot move there. to do this we loop through all of our walls and check if the player's new 
        // proposed position overlaps with any of them
        for (let i = 0; i < wallRects.length; i ++)
        {
            // now check our position using the pointInBounds() function 
            if (pointInBounds(playerBox.position.x, playerBox.position.y, wallRects[i])) {
                // console.log("player collision!")
            }

            // then perform a raycast from our player to the box, and don't move if we can't go there
            if (raycast(playerBox.position.x, playerBox.position.y, input.px, input.py, 20, wallRects[i])) {
                // console.log("RAYCAST HIT");
                return;
            }
        }

        // set our last-frame positions
        worldXLF = worldContainer.position.x;
        worldYLF = worldContainer.position.y;
        // then move our world around, so that we can move through it
        worldContainer.position.x -= input.px * moveSpeed;
        worldContainer.position.y -= input.py * moveSpeed;
        // adjust our world scale
        worldContainer.scale = worldScale;
        // now get our world delta
        let worldXDelta = worldXLF - worldContainer.position.x;
        let worldYDelta = worldYLF - worldContainer.position.y;
        // since we want the player to move exactly the same amount as the world is, we need to get how much the world has moved since last frame, and move the player with it
        // after that move our player around, so that they always stay in the centered on the screen
        // to make sure this works correctly we need to modify the global object position
        playerContainer.position.x += worldXDelta / worldScale; // we divide this number by the world scale so that it moves according to the relative scale of the environment
        playerContainer.position.y += worldYDelta / worldScale; // when we change the container size it is changing in pixels, so the delta will be more / less pixels in size.
    
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
    function checkColliderOverlap(rectA, rectB)
    {
        // get our first rectangle's top left, top right, bottom left, and bottom right points
        var aPx, aPy, aTLX, aTLY, aTRX, aTRY, aBLX, aBLY, aBRX, aBRY;

        // pivot
        aPx = rectA.getGlobalPosition().x;
        aPy = rectA.getGlobalPosition().y;

        colcheckText.text = aPx + ", " + aPy;

        // shape
        aTLX = aPx - rectA.width/2 * worldScale;
        aTLY = aPy - rectA.height/2 * worldScale;
        aTRX = aPx + rectA.width/2 * worldScale;
        aTRY = aPy - rectA.height/2 * worldScale;        
        aBLX = aPx - rectA.width/2 * worldScale;
        aBLY = aPy + rectA.height/2 * worldScale;
        aBRX = aPx + rectA.width/2 * worldScale;
        aBRY = aPy + rectA.height/2 * worldScale;

        var aTopLeft = [aTLX, aTLY];
        var aTopRight = [aTRX, aTRY];
        var aBottomLeft = [aBLX, aBLY];
        var aBottomRight = [aBRX, aBRY];

        // get the same points for the second rectangle
        var bPx, bPy, bTLX, bTLY, bTRX, bTRY, bBLX, bBLY, bBRX, bBRY;
        
        // pivot
        bPx = rectB.getGlobalPosition().x;
        bPy = rectB.getGlobalPosition().y;
        // shape
        bTLX = bPx;
        bTLY = bPy;
        bTRX = bPx + rectB.width * worldScale;
        bTRY = bPy;        
        bBLX = bPx;
        bBLY = bPy + rectB.height * worldScale;
        bBRX = bPx + rectB.width * worldScale;
        bBRY = bPy + rectB.height * worldScale;

        var bTopLeft = [bTLX, bTLY];
        var bTopRight = [bTRX, bTRY];
        var bBottomLeft = [bBLX, bBLY];
        var bBottomRight = [bBRX, bBRY];
        
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
        (pointInBoundsPTLBR(aTopLeft, bTopLeft, bBottomRight) ||
        pointInBoundsPTLBR(aTopRight, bTopLeft, bBottomRight) || 
        pointInBoundsPTLBR(aBottomRight, bTopLeft, bBottomRight) ||
        pointInBoundsPTLBR(aBottomLeft, bTopLeft, bBottomRight)) == true
        
        ||        
        
        (pointInBoundsPTLBR(bTopLeft, aTopLeft, aBottomRight) ||
        pointInBoundsPTLBR(bTopRight, aTopLeft, aBottomRight) || 
        pointInBoundsPTLBR(bBottomRight, aTopLeft, aBottomRight) ||
        pointInBoundsPTLBR(bBottomLeft, aTopLeft, aBottomRight)) == true
        )
        {
            // console.log("collision occurred between " + rectA.name + " and " + rectB.name + " at position: " );
            return true;
        }
    }

    // checks if a point is within a bound, using a point, top left position, and bottom right position
    function pointInBoundsPTLBR(point, topLeft, bottomRight)
    {
        // if we're in between the two X points and the two Y points
        if ((point[0] > topLeft[0] & point[0] < bottomRight[0]) & (point[1] > topLeft[1] & point[1] < bottomRight[1]))
        {
            // collision has occured because a point within the two bounds overlapped with another of the bounds!
            console.log(point[0] + ", " + point[1]);
            return true;
        }
    }

    // checks if a point is within a bounds using a pointx, pointy, and a collider
    function pointInBounds(pointx, pointy, collider)
    {
        // pivot
        let bPx = collider.getGlobalPosition().x;
        let bPy = collider.getGlobalPosition().y;
        // shape
        let bTLX = bPx;
        let bTLY = bPy; 
        let bBRX = bPx + collider.width * worldScale;
        let bBRY = bPy + collider.height * worldScale;

        // if we're in between the two X points and the two Y points
        if ((pointx > bTLX & pointx < bBRX) & (pointy > bTLY & pointy < bBRY))
        {
            // collision has occured because a point within the two bounds overlapped with another of the bounds!
            // console.log(pointx + ", " + pointy);
            return true;
        }
    }

    // checks all the points in a line from a position, in a direction
    function raycast(positionx, positiony, directionx, directiony, length, targetRect)
    {
        // first normalize our direction based on which 
        // let dir = normalizeXY(directionx, directiony);
        let dir = [directionx, directiony];
        // if something is NaN then set it to 0 
        dir[0] = isNaN(dir[0]) ? 0 : dir[0];
        dir[1] = isNaN(dir[1]) ? 0 : dir[1];

        // loop from the start position
        for (let x = 1; x < length; x++)
        {
            for (let y = 1; y < length; y++)
            {
                let cx = positionx + (x * dir[0]);
                let cy = positiony + (y * dir[1]);

                // change our text to showcase where we are checking out raycast
                colcheckText.text = (cx) + ", " + (cy);
                // check the position for the target rect
                if (pointInBounds(cx, cy, targetRect))
                {
                    return pointInBounds(cx, cy, targetRect);
                }
            }
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

                
    const pdischeckText = new PIXI.Text({
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
    pdischeckText.position.y = 44;
    application.stage.addChild(pdischeckText)

    // lets place a sprite in the scene as our cursor
    const cursorTexture = await PIXI.Assets.load('./images/cursor.png');
    cursorTexture.source.scaleMode = 'nearest';
    const cursorSprite = new PIXI.Sprite(cursorTexture);
    cursorSprite.scale = 2;
    cursorSprite.anchor = 0.5;
    // then lets add it to the stage
    application.stage.addChild(cursorSprite);

     // in order to check collisions, we have to run a loop through all of the colliders we want to check
    // in this case, we want to compare the cursor to our walls, so we compare our cursor's position to all of the walls
    for (let i = 0; i < wallRects.length; i++)
        {
            // now compare the player's box to all of the boxes of the tiles
            if (checkColliderOverlap(cursorSprite, wallRects[i]))
            {
                console.log("collision registered");
                colcheckText.style.fill = '00ff00'
                break;
            } else
            {
                colcheckText.style.fill = 'ffffff'
            }
        }

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