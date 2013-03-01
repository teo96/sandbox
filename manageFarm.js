// ==UserScript==
// @id             iitc-plugin-managefarm@teo96
// @name           iitc: manage a portal farm
// @version        0.0.2
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
  $('#toolbox').append('<a onclick="window.plugin.manageFarm.view()">export portal list</a> ');
    addHook('portalAdded', window.plugin.manageFarm.extractPortalData);
}

window.plugin.manageFarm.view = function() {
  var s= '';
  $.each(window.portals, function(ind, portal) {
      var d = portal.options.details;   
      s += portal.options.team + '\t' + d.portalV2.descriptiveText.TITLE + ' \t' + getPortalLevel(d).toString().replace('.', ',') + ' \t'  
      
   var r = portal.options.details.resonatorArray.resonators;
   r.reverse();
   //sort reso by levels
  /* $.each(r, function(ind, reso) {
       if(!reso)
           var thisR = new Array();
           thisR[0] = reso.level; // reso level
            thisR[1] = window.getPlayerName(reso.ownerGuid); //reso deployed by
       	   thisR[2] = reso.distanceToPortal; // distance to portal 
           thisR[3] = reso.energyTotal; // energy total 
      	   thisR[4] = RESO_NRG[reso.level]; //max energy
           i++;
   });
   */
    
    $.each(r, function(ind, reso) {
       if(!reso) 
           s+='\t'; 
       else
      s += + reso.level + '\t';
   });
   
   $.each(d.portalV2.linkedModArray, function(ind, mod) {
       if (!mod) 
           s+='\t'; 
       else
      s+= mod.rarity.capitalize().replace('_', ' ') + '\t';
       //getPlayerName(mod.installingUser)
   });    
   s+= getAttackApGain(d).totalAp + '\n';
  });

  
 
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
