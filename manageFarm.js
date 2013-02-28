// ==UserScript==
// @id             iitc-plugin-managefarm@teo96
// @name           iitc: manage a portal farm
// @version        0.0.1
// @namespace      https://github.com/breunigs/ingress-intel-total-conversion
// @updateURL      https://raw.github.com/breunigs/ingress-intel-total-conversion/gh-pages/plugins/guess-player-levels.user.js
// @downloadURL    https://raw.github.com/breunigs/ingress-intel-total-conversion/gh-pages/plugins/guess-player-levels.user.js
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
  $('#toolbox').append('<a onclick="window.plugin.manageFarm.view()">view farm</a> ');
  addHook('portalAdded', window.plugin.manageFarm.extractPortalData);
}

window.plugin.manageFarm.view = function() {
  var s= '';
  $.each(window.portals, function(ind, portal) {
      var d = portal.options.details;   
      s += d.portalV2.descriptiveText.TITLE + ' \t' + getPortalLevel(d).toString().replace('.', ',') + ' \t'  
      
          //getAttackApGain(d).totalAp + ' AP \n'; ; 
   var r = portal.options.details.resonatorArray.resonators;
   $.each(r, function(ind, reso) {
      if(!reso) return true;
      s += + reso.level + '\t';
   });
   $.each(d.portalV2.linkedModArray, function(ind, mod) {
     if (!mod) return true; 
      s+= mod.rarity.capitalize().replace('_', ' ') + '\t';
   });    
   s+='\n';
  });

 
 /* var namesR = plugin.guessPlayerLevels.sort(playersRes);
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
*/
  console.log(s);
  alert(s);
}


var setup =  function() {
  window.plugin.manageFarm.setupCallback();
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
