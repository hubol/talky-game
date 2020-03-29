const { Sprite, Texture, Container } = PIXI;
const { Sound } = PIXI.sound;

Sound.from({ url: "sounds/music.mp3", autoPlay: true, loop: true });

const growSound = Sound.from("sounds/grow.mp3");
const shrinkSound = Sound.from("sounds/shrink.mp3");
const stepSound = Sound.from("sounds/step.mp3");
const bellTollSound = Sound.from("sounds/bell toll.mp3");
const seeYouTomorrowSound = Sound.from("sounds/see you tomorrow.mp3");

function alreadyVisitedToday()
{
  return window.localStorage.getItem("date") == new Date().getDate();
}

function saveVisitedToday()
{
  window.localStorage.setItem("date", new Date().getDate());
}

const app = startApplication({ width: 128, height: 128 });

const background = Sprite.from("images/background.png");
background.width = 128;
background.height = 128;

const flatwoodseyTexture = Texture.from("images/flatwoodsey.png");
const flatwoodsey = new Container();
flatwoodsey.wiggleFactor = 0;
flatwoodsey.consumedUpPress = false;

const flatwoodseyShadow = new Sprite(flatwoodseyTexture);
flatwoodseyShadow.x = 4;
flatwoodseyShadow.y = 4;
flatwoodseyShadow.width = 58;
flatwoodseyShadow.height = 94;
flatwoodseyShadow.tint = 0;
flatwoodseyShadow.alpha = 0.5;

const flatwoodseyFront = new Sprite(flatwoodseyTexture);
flatwoodseyFront.width = flatwoodseyShadow.width;
flatwoodseyFront.height = flatwoodseyShadow.height;

flatwoodsey.addChild(flatwoodseyShadow, flatwoodseyFront);

const playerTextures = [ Texture.from("images/player0.png"), Texture.from("images/player1.png"), Texture.from("images/player2.png") ];

const player = new Sprite(playerTextures[0]);
player.x = 96;
player.y = 128;
player.dx = 0;
player.dy = 0;
player.runAnimationUnit = 0;
player.anchor.set(0.5, 1);

const seeYouTomorrow = Sprite.from("images/see you tomorrow.png");
seeYouTomorrow.anchor.set(0, 1);
seeYouTomorrow.y = 128;
seeYouTomorrow.visible = false;

app.stage.addChild(background, seeYouTomorrow, flatwoodsey, player);

app.ticker.add(() => {
  flatwoodsey.wiggleFactor *= 0.95;

  if (Key.justWentDown("ArrowUp"))
    flatwoodsey.consumedUpPress = false;

  if (!flatwoodsey.consumedUpPress && player.collides(flatwoodsey))
  {
    if (message.alpha === 0)
    {
      message.alpha = 0.01;
    }

    saveVisitedToday();
    updateMessageText();

    flatwoodsey.consumedUpPress = true;
    bellTollSound.play({ speed: 1 + flatwoodsey.wiggleFactor * 0.1 });
    flatwoodsey.wiggleFactor += Math.PI * 4;
  }
    
  flatwoodsey.skew.x = Math.sin(flatwoodsey.wiggleFactor) * 0.02 * flatwoodsey.wiggleFactor;
});

function updateMessageText()
{
    const date = new Date();
    message.text = `It is going to be a great ${getDayOfWeek(date.getDay())}`;
}

app.ticker.add(() => {
  if (Key.isDown("ArrowRight"))
    player.dx += 0.5;
  if (Key.isDown("ArrowLeft"))
    player.dx -= 0.5;
  if (Key.isUp("ArrowRight") && Key.isUp("ArrowLeft"))
    player.dx *= 0.7;
  
  if (Key.justWentUp("ArrowUp"))
    growSound.play();
  else if (Key.justWentDown("ArrowUp"))
    shrinkSound.play();    

  const desiredScaleY = Key.isDown("ArrowUp") ? 8 : 1;

  player.dx = Math.max(-4, Math.min(player.dx, 4));
  if (Math.abs(player.dx) < 0.2)
    player.dx = 0;

  player.x = Math.min(124, Math.max(4, player.x + player.dx));
  player.y += player.dy;

  if (player.dx < 0)
    player.scale.x = -1;
  else if (player.dx > 0)
    player.scale.x = 1;

  player.scale.y = Math.lerp(player.scale.y, desiredScaleY, 0.5);

  if (player.dx !== 0 || player.dy !== 0)
  {
    player.runAnimationUnit = (player.runAnimationUnit + 0.1) % 1;
  }
  else
    player.runAnimationUnit = 0;

  const previousPlayerTexture = player.texture;
  player.texture = playerTextures[Math.floor(player.runAnimationUnit * 3)]

  if (player.texture !== previousPlayerTexture && player.texture === playerTextures[2])
    stepSound.play();
});

const messageStyle = new PIXI.TextStyle({
    fontSize: 12,
    fill: ['#ffffff', '#00ff99'], // gradient
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 78,
});

const message = new PIXI.Text("Error", messageStyle);
updateMessageText();
message.x = 50;
message.y = 0;

function getDayOfWeek(number)
{
  switch (number)
  {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
      return "Hemday"
  }
}

message.alpha = alreadyVisitedToday() ? 1 : 0;

app.ticker.add(() => {
  if (message.alpha > 0)
    message.alpha += 0.01;
  if (message.alpha >= 1 && !seeYouTomorrow.visible)
  {
    seeYouTomorrow.visible = true; 
    seeYouTomorrowSound.play();
  }
})

app.stage.addChild(message);