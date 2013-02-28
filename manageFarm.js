// ==UserScript==
// @id             iitc-plugin-managefarm@teo96
// @name           iitc: manage a portal farm
// @version        0.0.1
// @namespace      https://github.com/teo96/sandbox
// @updateURL      https://raw.github.com/teo96/ingress-intel-total-conversion/gh-pages/plugins/guess-player-levels.user.js
// @downloadURL    https://raw.github.com/teo96/ingress-intel-total-conversion/gh-pages/plugins/guess-player-levels.user.js
// @description    Manage a portal farm
// @include        https://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// ==/UserScript==

function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};


// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.manageFarm = function() {};

window.plugin.manageFarm.setupCallback = function() {
  $('#toolbox').append('<a onclick="window.plugin.guessPlayerLevels.view()">view farm</a> ');
  addHook('portalAdded', window.plugin.manageFarm.extractPortalData);
}


window.plugin.manageFarm.extractPortalData = function(data) {
  var r = data.portal.options.details.resonatorArray.resonators;
  $.each(r, function(ind, reso) {
    if(!reso) return true;
    var p = 'level-'+reso.ownerGuid;
    var l = reso.level;
    if(!window.localStorage[p] || window.localStorage[p] < l)
      window.localStorage[p] = l;
  });
}

window.plugin.manageFarm.view = function() {
  var playersRes = {};
  var playersEnl = {};
  $.each(window.portals, function(ind, portal) {
    var r = portal.options.details.resonatorArray.resonators;
    $.each(r, function(ind, reso) {
      if(!reso) return true;
      var lvl = localStorage['level-' + reso.ownerGuid];
      var nick = getPlayerName(reso.ownerGuid);
      if(portal.options.team === TEAM_ENL)
        playersEnl[nick] = lvl;
      else
        playersRes[nick] = lvl;
    });
  });

  var s = 'the players have at least the following level:\n\n';
  s += 'Resistance:\t&nbsp;&nbsp;&nbsp;\tEnlightened:\t\n';

  var namesR = plugin.guessPlayerLevels.sort(playersRes);
  var namesE = plugin.guessPlayerLevels.sort(playersEnl);
  var max = Math.max(namesR.length, namesE.length);
  for(var i = 0; i < max; i++) {
    var nickR = namesR[i];
    var lvlR = playersRes[nickR];
    var lineR = nickR ? nickR + ':\t' + lvlR : '\t';

    var nickE = namesE[i];
    var lvlE = playersEnl[nickE];
    var lineE = nickE ? nickE + ':\t' + lvlE : '\t';

    s += lineR + '\t\t' + lineE + '\n';
  }

  s += '\n\nIf there are some unresolved names, simply try again.'
  console.log(s);
  alert(s);
}

window.plugin.guessPlayerLevels.sort = function(playerHash) {
  return Object.keys(playerHash).sort(function(a, b) {
    if(playerHash[a] < playerHash[b]) return 1;
    if(playerHash[a] > playerHash[b]) return -1;

    if (a.toLowerCase() < b.toLowerCase()) return -1;
    if (a.toLowerCase() > b.toLowerCase()) return 1;
    return 0;
  });
}


var setup =  function() {
  window.plugin.guessPlayerLevels.setupCallback();
  window.plugin.guessPlayerLevels.setupChatNickHelper();
}

// PLUGIN END //////////////////////////////////////////////////////////

if(window.iitcLoaded && typeof setup === 'function') {
  setup();
} else {
  if(window.bootPlugins)
    window.bootPlugins.push(setup);
  else
    window.bootPlugins = [setup];
}
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
