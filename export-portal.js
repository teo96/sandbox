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
  $('#toolbox').append('<a onclick="window.plugin.manageFarm.view()">Export Portails</a> ');
}

window.plugin.manageFarm.view = function() {
//version github
var s= '';
  var nbrePortal = 0;
    
    $.each(window.portals, function(ind, portal) { 
        nbrePortal++;
        var d = portal.options.details;   
      s += d.portalV2.descriptiveText.TITLE + '\t' + portal.options.team + ' \t' + getPortalLevel(d).toString().replace('.', ',') + ' \t'  
      
   // create a array for resos with usefull info
   var r = portal.options.details.resonatorArray.resonators;
   var myR = [];
   var i=0;
   $.each(r, function(ind, reso) {
       if (reso) {    
       // reso level, reso deployed by, distance to portal, energy total, max 
       myR[i] = [reso.level, window.getPlayerName(reso.ownerGuid), reso.distanceToPortal, reso.energyTotal, RESO_NRG[reso.level]];
       } else { myR[i] = [0,'',0,0,0]; }
    i++;
   });
   //to debug this part
   //console.log('\n\n ARRAY CONSTRUCT:' + myR[0].toString());
   //sort resos by level
   myR.sort(function (a, b) {return b[0] - a[0]});
   
   //add resos level in the string
   $.each(myR, function(ind, reso) {
       if(!reso) 
           s+='\t'; 
       else
      s += + reso[0] + '\t';
   });
   //to debug this part
   //console.log('\n\n ADD RESOS : ' + s);
   
   //add shield rarity in the string
   $.each(d.portalV2.linkedModArray, function(ind, mod) {
       if (!mod) 
           s+='\t'; 
       else
      s+= mod.rarity.capitalize().replace('_', ' ') + '\t';
      
   });
      
   //add total ap gain 
   s+= getAttackApGain(d).totalAp;
   //to debug this part
   //console.log('\n\n ADD SHIELDS & TOTAL AP : ' + s);
   
   // add who deployed reso
   $.each(myR, function(ind, reso) {
       s+='\t'; 
       if(reso) 
           s += reso[1];
   });
   //to debug this part
   //console.log('\n\n WHO DEPLOYED RESO: ' + s);
      
   //add who deployed shield
   $.each(d.portalV2.linkedModArray, function(ind, mod) {
       s+='\t'; 
       if (mod) 
         s+= getPlayerName(mod.installingUser);           
   });    
   //to debug this part
   //console.log('\n\n WHO DEPLOYED SHIELD: ' + s);
   
   s+= '\n';
  });

  
  if (confirm('Voulez vous afficher les informations détaillées des ' + nbrePortal + ' portails détectés ?')) { 
      alert(s);
      console.log(s);
  }
   
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
