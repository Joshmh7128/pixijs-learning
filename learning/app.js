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

    // then make sure to add our text to the game
    application.stage.addChild(text);
    application.stage.addChild(text2);

    // then we add the object to the stage by usingthe addChild() function
    application.stage.addChild(rectangle);
})();