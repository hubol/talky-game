// Use this method to start a PIXI application
// options is an object as described by http://pixijs.download/release/docs/PIXI.Application.html#Application
function startApplication(options)
{
  const app = createApplication(options);
  addApplicationToDocument(app);
  return app;
}

PIXI.Container.prototype.moveUntilCollides = function (otherComponentOrComponents, speed)
{
  return moveUntilCollides(this, otherComponentOrComponents, speed);
}

PIXI.Container.prototype.collides = function(otherComponentOrComponents, offset)
{
  return collides(this, otherComponentOrComponents, offset);
}

Math.lerp = function (a, b, factor)
{
  return a * (1 - factor) + b * factor;
}

function moveUntilCollides(component, otherComponentOrComponents, speed)
{
  const signX = Math.sign(speed.x);
  const signY = Math.sign(speed.y);

  while (Math.abs(speed.x) >= 1 || Math.abs(speed.y) >= 1)
  {
    if (Math.abs(speed.x) >= 1)
    {
      if (component.collides(otherComponentOrComponents, { x: signX, y: 0 }))
      {
        speed.x = 0;
      }
      else
      {
        component.x += signX;
        speed.x -= signX;
      }
    }
    if (Math.abs(speed.y) >= 1)
    {
      if (component.collides(otherComponentOrComponents, { x: 0, y: signY }))
      {
        speed.y = 0;
      }
      else
      {
        component.y += signY;
        speed.y -= signY;
      }
    }
  }
}

function collides(component, otherComponentOrComponents, offset)
{
  if (Array.isArray(otherComponentOrComponents))
  {
    for (let i = 0; i < otherComponentOrComponents.length; i++)
    {
      if (collides(component, otherComponentOrComponents[i], offset))
        return true;
    }

    return false;
  }

  const componentBounds = component.getBounds();
  if (offset)
  {
    componentBounds.x += offset.x;
    componentBounds.y += offset.y;
  }
  const otherComponentBounds = otherComponentOrComponents.getBounds();
  return areRectanglesOverlapping(componentBounds, otherComponentBounds);
}

function areRectanglesOverlapping(a, b)
{
  return a.x + a.width > b.x
    && a.x < b.x + b.width
    && a.y + a.height > b.y
    && a.y < b.y + b.height;
}

// Below are utilities, do not worry about them

function createApplication(options)
{
  const app = new PIXI.Application(options);
  startKeyListener();
  app.ticker.add(advanceKeyListener);
  return app;
}

function addApplicationToDocument(app)
{
  app.view.id = "gameCanvas";
  document.body.appendChild(app.view);
}

const Key = {
  isDown(key) {
    return key in currentKeysState && currentKeysState[key];
  },
  isUp(key) {
    return !this.isDown(key);
  },
  justWentDown(key) {
    return previouslyUp(key) && this.isDown(key);
  },
  justWentUp(key) {
    return previouslyDown(key) && this.isUp(key);
  }
};

function previouslyDown(key) {
    return key in previousKeysState && previousKeysState[key];
}
function previouslyUp(key) {
    return !previouslyDown(key);
}
let previousKeysState = {};
let currentKeysState = {};
let workingKeysState = {};
function handleKeyDown(event) {
    workingKeysState[event.code] = true;
}
function handleKeyUp(event) {
    workingKeysState[event.code] = false;
}
let startedKeyListener = false;
function startKeyListener() {
    if (startedKeyListener)
        throw new Error("Cannot start key listener twice!");
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keypress", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    startedKeyListener = true;
}
function advanceKeyListener() {
    if (!startedKeyListener)
        throw new Error("Key listener must be started to advance!");
    previousKeysState = currentKeysState;
    currentKeysState = Object.assign({}, workingKeysState);
}

window.onload = () => window.focus();