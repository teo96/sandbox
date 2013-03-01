// ==UserScript==
// @id             iitc-plugin-export-portal@teo96
// @name           iitc:export portals informations
// @version        0.0.2
// @namespace      https://github.com/teo96/sandbox/blob/master/
// @updateURL      https://raw.github.com/teo96/sandbox/master/export-portal.js
// @downloadURL    https://raw.github.com/teo96/sandbox/master/export-portal.js
// @description    export a list of portal with resonator mods information
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
}

window.plugin.manageFarm.view = function() {
  var s= '';
  $.each(window.portals, function(ind, portal) {
      var d = portal.options.details;   
      s += portal.options.team + '\t' + d.portalV2.descriptiveText.TITLE + ' \t' + getPortalLevel(d).toString().replace('.', ',') + ' \t'  
      
   var r = portal.options.details.resonatorArray.resonators;
   var myR = [];
   var i=0;
   $.each(r, function(ind, reso) {
           // reso level, reso deployed by, distance to portal, energy total, max 
           myR[i] = [reso.level, window.getPlayerName(reso.ownerGuid), reso.distanceToPortal, reso.energyTotal, RESO_NRG[reso.level]]
           //console.log(myR[i].toString());
           i++;
   });
   
   //console.log('avant ' + myR[0][0] + myR[1][0] + myR[2][0] + myR[3][0] + myR[4][0] + myR[5][0] + myR[6][0] + myR[7][0] + '\n');
   myR.sort(function (a, b) {return b[0] - a[0]});
   //console.log('aprés '  + myR[0][0] + myR[1][0] + myR[2][0] + myR[3][0] + myR[4][0] + myR[5][0] + myR[6][0] + myR[7][0]);
   $.each(myR, function(ind, reso) {
       if(!reso) 
           s+='\t'; 
       else
      s += + reso[0] + '\t';
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
