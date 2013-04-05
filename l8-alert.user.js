// ==UserScript==
// @id             iitc-L8-alert@teo96
// @name           teo96:L8 alert
// @version        0.0.2
// @namespace      
// @updateURL      https://github.com/teo96/sandbox/raw/master/l8-alert.user.js
// @downloadURL    https://github.com/teo96/sandbox/raw/master/l8-alert.user.js
// @description    Display an alert if a L8 portal is detected / in construction
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// ==/UserScript==

function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};


// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.L8Alert = function() {};
window.plugin.L8Alert.listL8 = [];
minL8 = 4;
teamClass = (PLAYER.team === 'RESISTANCE' ? 'enl' : 'res');    

window.plugin.L8Alert.setupCallback = function() {
    $('#sidebar').append('<div class="' + teamClass + '" id="L8Alert"></div>');
    $('#L8Alert').css({'color':'#ffce00', 'font-size':'90%', 'padding':'4px 2px'});
    
    // do an initial calc for sidebar sizing purposes
    window.plugin.L8Alert.onPositionMove();
    
    // make the value update when the map data updates
    var handleDataResponseOrig = window.handleDataResponse;
    window.handleDataResponse = function(data, textStatus, jqXHR) {
        handleDataResponseOrig(data, textStatus, jqXHR);
        window.plugin.L8Alert.onPositionMove();
    }
}

window.plugin.L8Alert.onPositionMove = function() {
   
    window.plugin.L8Alert.listL8 = [];
    var L8Portal= 0;
    
    
    $.each(window.portals, function(ind, portal) {
        var d = portal.options.details;
        var l8 = 0;
        
        if(d.controllingTeam.team !== PLAYER.team) {
            $.each(d.resonatorArray.resonators, function(ind, reso) {
                if(reso !== null) {
                    if (reso.level == 8){l8++;}
                }
            });     
            if(l8 > 0 ) {
                var o = new myP(portal, l8);
                window.plugin.L8Alert.listL8.push(o);  
                if (l8 == 8){L8Portal++;}
            }
        }
    });
    
    // sort array by number of L8 resonators
    window.plugin.L8Alert.listL8.sort(function (a, b) {return b.numL8 - a.numL8});
    
    var html='Loading ...';
    if (window.plugin.L8Alert.listL8.length>0){
        
        html = (L8Portal > 0 ? 'Alert : <b>' + L8Portal + '</b> L8 portals' : 'No L8 Portal : ');
        html +='<table>';
        $.each(window.plugin.L8Alert.listL8, function (ind,portal2){
            if (portal2.numL8 >= minL8){
                var colorLine = '';
                switch (portal2.numL8){
                    case 8:
                        colorLine = '#ff0000';
                        break;
                    case 7:
                    case 6:
                        colorLine = '#ffaa00';
                        break;
                    case 5:
                    case 4:
                    case 3:
                    case 2:
                    case 1:
                        colorLine = '#ffff00';
                        break;
                }
                html += '<tr style="cursor:pointer; color:' + colorLine + ' !important"><td>' + window.plugin.L8Alert.getPortalLink(portal2.portal) + '</td>';
                html += '<td>' + portal2.numL8 + '</td></tr>';
            }
        });
        html += '</table>';
    }
    else
    {html = 'No portal with at least '+ minL8 + ' L8 resonators';}
 
    
    $('#L8Alert').html(html);   
}
    
var myP = function(portal, numL8) {
    this.portal = portal;
    this.numL8 = numL8;
}    



window.plugin.L8Alert.getPortalLink = function(portal) {
    
    var p = portal.options;
    var latlng = [p.details.locationE6.latE6/1E6, p.details.locationE6.lngE6/1E6].join();
    var jsSingleClick = 'window.renderPortalDetails(\''+p.guid+'\');return false';
    var jsDoubleClick = 'window.zoomToAndShowPortal(\''+p.guid+'\', ['+latlng+']);return false';
    //var perma = 'https://ingress.com/intel?latE6='+portal.locationE6.latE6+'&lngE6='+portal.locationE6.lngE6+'&z=17&pguid='+guid;
    
    //Use Jquery to create the link, which escape characters in TITLE and ADDRESS of portal
    var a = $('<div>',{
        text: p.details.portalV2.descriptiveText.TITLE,
        onClick: jsSingleClick,
        onDblClick: jsDoubleClick
    })[0].outerHTML;
    return a;
}

var setup =  function() {
    window.plugin.L8Alert.setupCallback();
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
