var back = {
  angle: 0,
  fps: 30
}

var tF = function() {return Boolean(between(0,1));}
var between = function(min, max) {
  return Math.floor((Math.random() * (max - min + 1)) + min);
}
var colorConstructor = function() {
  return {
    value: tinycolor.random(),
    mods: {
      spin:{
        type: "spin",
        streak: between(Math.floor(back.fps/2), back.fps * 5),
        upDownStop: between(-1, 1)
      },
      light: {
        type: "light",
        streak: between(Math.floor(back.fps/2), back.fps * 2),
        upDownStop: between(-1, 1)
      },
      sat: {
        type: "sat",
        streak: between(Math.floor(back.fps/2), back.fps * 2),
        upDownStop: between(-1, 1)
      }
    }
  }
}

back.color1 = colorConstructor();
back.color2 = colorConstructor();

var setBack = function(state) {
  var $back = $(".background");
  $back.css({height: window.innerHeight + "px",
    width: window.innerWidth + "px"});
  var leads = ["-webkit-linear-gradient",
    "-moz-linear-gradient",
    "-o-linear-gradient",
    "linear-gradient"];
  leads.forEach(function(lead) {
    $back.css("background-image", lead + "(" + state.angle + "deg, #"
      + state.color1.value.toHex() + " 0%, #"
      + state.color2.value.toHex() + " 100%)");
  });
}
var objUpdate = function(obj) {
  if (obj.streak <= 0) {
    var mult = 2;
    if (obj.type = "spin") mult = 5;
    return {
      type: obj.type,
      streak: between(Math.floor(back.fps/2), back.fps * mult),
      upDownStop: between(-1, 1)
    }
  } else {
    return {
      type: obj.type,
      streak: obj.streak - 1,
      upDownStop: obj.upDownStop
    }
  }
}
var iterate = function(colorObj) {
  Object.keys(colorObj.mods).forEach(function(mod) {
    colorObj.mods[mod] = objUpdate(colorObj.mods[mod]);
  });
  colorObj.value = colorObj.value
    .spin(colorObj.mods.spin.upDownStop)
    .darken(colorObj.mods.light.upDownStop * 0)
    .saturate(colorObj.mods.sat.upDownStop * 0)
  return colorObj; //darkness and saturation temporarily disabled
}
var updateBackground = function(state) {
  setBack(state);
  state.color1 = iterate(state.color1);
  state.color2 = iterate(state.color2);
  back.angle = state.angle + 1;
  if (back.angle > 360) back.angle = back.angle - 360;
  return state;
}

var interval = setInterval(function() {
  back = updateBackground(back);
}, 10);
