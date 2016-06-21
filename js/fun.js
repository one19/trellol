/*  global $ _ tinycolor Trello */

const between = (min, max) => {
  const tween = Math.floor((Math.random() * (max - min + 1)) + min);
  return tween;
};
const tF = () => {
  const trueOrFalse = Boolean(between(0, 1));
  return trueOrFalse;
};
window.back = {
  angle: 0,
  fps: 15,
  truthy: tF()
};
let back = window.back;

const colorConstructor = () => {
  const colorObject = {
    value: tinycolor.random(),
    mods: {
      spin: {
        type: 'spin',
        streak: between(Math.floor(back.fps / 2), back.fps * 5),
        upDownStop: between(-1, 1)
      },
      light: {
        type: 'light',
        streak: between(Math.floor(back.fps / 2), back.fps * 2),
        upDownStop: between(-1, 1)
      },
      sat: {
        type: 'sat',
        streak: between(Math.floor(back.fps / 2), back.fps * 2),
        upDownStop: between(-1, 1)
      }
    }
  };
  return colorObject;
};

back.color1 = colorConstructor();
back.color2 = colorConstructor();
back.color3 = colorConstructor();

// WANT TO SEE ME CUT MY RENDER STRESS BY 3/4???

const setBack = (state) => {
  const $back = $('.background');
  $back.css({ height: `${window.innerHeight}px`,
    width: `${window.innerWidth}px` });
  if (window.back.truthy) {
    $back.css('background-image', `radial-gradient(
      #${state.color1.value.toHex()} 0%,
      #${state.color2.value.toHex()} 50%,
      #${state.color3.value.toHex()} 100%)`);
  } else {
    $back.css('background-image', `linear-gradient(
      ${state.angle}deg,
      #${state.color1.value.toHex()} 0%,
      #${state.color2.value.toHex()} 50%,
      #${state.color3.value.toHex()} 100%)`);
  }
};
const objUpdate = (obj) => {
  if (obj.streak <= 0) {
    let mult = 2;
    if (obj.type === 'spin') { mult = 5; }
    return {
      type: obj.type,
      streak: between(Math.floor(back.fps / 2), back.fps * mult),
      upDownStop: between(-1, 1)
    };
  }
  return {
    type: obj.type,
    streak: obj.streak - 1,
    upDownStop: obj.upDownStop
  };
};
const iterate = (colorObj) => {
  const newColorObj = colorObj;
  Object.keys(newColorObj.mods).forEach((mod) => {
    newColorObj.mods[mod] = objUpdate(newColorObj.mods[mod]);
  });
  newColorObj.value = newColorObj.value
    .spin(newColorObj.mods.spin.upDownStop)
    .darken(newColorObj.mods.light.upDownStop * 0)
    .saturate(newColorObj.mods.sat.upDownStop * 0);
  return newColorObj; //  darkness and saturation temporarily disabled
};
const updateBackground = (state) => {
  const nextState = state;
  setBack(state);
  nextState.color1 = iterate(nextState.color1);
  nextState.color2 = iterate(nextState.color2);
  back.angle = nextState.angle + 1;
  if (back.angle > 360) back.angle = back.angle - 360;
  return nextState;
};

window.interval = setInterval(() => {
  back = updateBackground(back);
}, 10);
