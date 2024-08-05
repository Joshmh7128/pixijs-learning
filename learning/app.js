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

    // now we can draw a rectangle using a new graphics instance
    const rectangle = new PIXI.Graphics()
    // we use .rect to define it as a rectangle then input the x, y, width, and height
    // be sure to call the shape function before .fill or .stroke, if you call it afterwards it will not render!
    .rect(200,200,200,200)
    // we then have to fill the rectangle
    .fill({
        color: 0xffea00,
        alpha: 1
    })
    // we can also use a stroke on the outside of the rectangle
    .stroke({
        width: 8,
        color:0x00ff00
    });

    // there are lots of other shapes, such as 
    // line, triangle, star, and more. You can find examples here: https://waelyasmina.net/articles/pixi-js-tutorial-for-complete-beginners/#setting_up:~:text=There%20are%20various%20shapes%20to%20choose%20from%2C%20and%20here%20are%20a%20few%20examples%3A

    // to make some text we can say
    const text = new PIXI.Text({
        text: 'Hello PIXI ',
        style: {
            // fill the same as color
            fill: '#ffffff',
            // we can change the font
            fontFamily: 'Arial',
            fontSize: 60,
            fontStyle: 'italic',
            fontWeight: 'bold',
            stroke: { color: '#000000', width: 5},
            dropShadow: {
                color: '#000000',
                blur: 4,
                angle: Math.PI / 6,
                distance: 6,
            },
            wordWrap: true,
            wordWrapWidth: 440
        } // you can find this example here: https://waelyasmina.net/articles/pixi-js-tutorial-for-complete-beginners/#setting_up:~:text=Speaking%20of%20text%20color%2C%20we%20have%20a%20wide%20variety%20of%20styles%20to%20apply%20to%20the%20text.%20These%20include%20font%20family%2C%20weight%2C%20size%2C%20color%2C%20shadows%2C%20stroke%2C%20and%20more.
    });

    // if you want to install new fonts, you can find the code here: https://waelyasmina.net/articles/pixi-js-tutorial-for-complete-beginners/#setting_up:~:text=Including%20the%20font%20using%20HTML%3A

    // we can also create TextStyle objects to use with a lot of our texts
    const ourStyle = new PIXI.TextStyle({
        // fill the same as color
        fill: '#ffffff',
        // we can change the font
        fontFamily: 'Arial',
        fontSize: 60,
        fontStyle: 'italic',
        fontWeight: 'bold',
        stroke: { color: '#000000', width: 5},
        dropShadow: {
            color: '#000000',
            blur: 4,
            angle: Math.PI / 6,
            distance: 6,
        },
        wordWrap: true,
        wordWrapWidth: 440
    });

    // then to use the style we can do
    const text2 = new PIXI.Text({
        text: 'Hello there',
        ourStyle,
        // we can modify our postion here too
        x: 100,
        y: 100
    })

    // PIXI operates using a stage analogy, where all of the objects in the game are children of the stage.
    // we add the objects to the stage by usingthe addChild() function
    application.stage.addChild(text);
    application.stage.addChild(text2);
    application.stage.addChild(rectangle);

    // time to load an image
    // in order to use images in our project, we have to load images into Texture assets, use the Texture to create a Sprite, and then add the Sprite to the Stage
    // lets import an image asset step by step

    // step 1, get the image from a folder and save it as a texture
    const testTexture = await PIXI.Assets.load('./images/desert-block.png');
    // step 2
    const testSprite = new PIXI.Sprite(testTexture);
    // we can also change its scale
    testSprite.scale.x = 2;
    testSprite.scale.y = 2;
    // we can also set the scale in one function to get the same result
    testSprite.scale.set(2,2);
    // we can then transform the object using a few different methods
    testSprite.x = 200;
    testSprite.y = 200;
    // or
    testSprite.position.x = 200;
    testSprite.position.y = 200;
    // or
    testSprite.position.set(200,200);
    // we can also rotate the object
    testSprite.rotation = 0;
    // remember: we have to set the pivot point of our sprite to the center of the object, otherwise it will be in the top right by default
    testSprite.anchor.x = 0.5;
    testSprite.anchor.y = 0.5;

    // in order for our events to work, we need to set the eventMode to static
    testSprite.eventMode = 'static';

    // lets do some interaction to make the rectangle move wherever I click
    testSprite.on('pointerdown', (event) => {
        testSprite.position.x += 200;
        testSprite.position.y += 200;
    } );

    // let's also change the cursor when the player hovers over it
    testSprite.cursor = 'pointer';

    application.stage.addChild(testSprite);

    /// if we want things to happen in the game, we need to use a ticker
    /// tickers essentially run the game, and all of the code within them is executed at the framerater of the user's monitor
    /// in most cases this will be 60fps, in others it may be 120fps, or more

    // let's create a time variable to track how far along in the game we are
    let time = 0;

    // then run the ticker once every frame, increasing time and moving our sprite
    application.ticker.add(() => {
        testSprite.position.x = Math.sin(time/100) * 100 + 300;
        testSprite.position.y = Math.cos(time/100) * 100 + 300;
        time += 1;
    });

    // when we want to load an asset but that asset might be too big to load quickly, 
    // we want to make sure we have the asset before we try to use it
    //       we use the await keyword to make sure this line waits before executing the next one
    const gunkTexture = await PIXI.Assets.load('./images/ground-gunk.png');
    const gunkSprite = new PIXI.Sprite(gunkTexture);
    gunkSprite.position.set(300, 300);
    application.stage.addChild(gunkSprite);

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
    playerIdleSprite.scale = 10;
    // !!!
    // to stop our sprite from looking blurry, be sure to make the scale mode "NEAREST"
    playerIdleTexture.source.scaleMode = 'nearest';
    // !!!
    // then, add it to the stage
    application.stage.addChild(playerIdleSprite);

    // now that that's setup, lets tile some sprites around the area. PIXI has a constructor setup for this, but it is a bit easier to do it by hand
    const tileSize = 32;
    const floorTileTexture = await PIXI.Assets.load('/images/desert-tile-1.png');
    floorTileTexture.source.scaleMode = 'nearest';
    for (let x = 0; x < screen.width; x += tileSize) {
        for (let y = 0; y < screen.height; y += tileSize)
            {
            var spr = new PIXI.Sprite(floorTileTexture);
            // here we use the addChildAt function and place the objects as low as they can be placed
            application.stage.addChildAt(spr,0).position.set(x,y);
        }
    }

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
    // we can then do specific things with our keys
    function capturePlayerInput()
    {
        // reset it each frame
        input.px = 0;
        input.py = 0;      

        if (wKey.isDown) input.py = -1;
        if (sKey.isDown) input.py = 1;
        if (dKey.isDown) input.px = 1;
        if (aKey.isDown) input.px = -1;
    }
    // then let's apply our movement to our character
    function applyPlayerMovement()
    {
        if (input.px + input.py > 1)
        {
            var finalInput = input.px + input.py;
            var mult = 1 - (finalInput - 1); // lower this by the amount that it is over 1
            input.x *= mult;
            input.y *= mult;
        }

        playerIdleSprite.position.x += input.px * moveSpeed;
        playerIdleSprite.position.y += input.py * moveSpeed;
    }

    // now apply movement to the player
    application.ticker.add(() => {
        capturePlayerInput();
        applyPlayerMovement();
    });

})();