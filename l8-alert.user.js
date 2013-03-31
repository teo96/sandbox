// ==UserScript==
// @id             iitc-L8-alert@teo96
// @name           teo96:L8 alert
// @version        0.0.1
// @namespace      
// @updateURL      
// @downloadURL    
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
minL8 = 1;
    
window.plugin.L8Alert.setupCallback = function() {
    // add a new div to the bottom of the sidebar and style it
    $('#sidebar').append('<div id="L8Alert"></div>');
    $('#L8Alert').css({'color':'#ffce00', 'font-size':'90%', 'padding':'4px 2px'});
    
    // do an initial calc for sidebar sizing purposes
    //window.plugin.L8Alert.onPositionMove();
    
    // make the value update when the map data updates
    var handleDataResponseOrig = window.handleDataResponse;
    window.handleDataResponse = function(data, textStatus, jqXHR) {
        handleDataResponseOrig(data, textStatus, jqXHR);
        window.plugin.L8Alert.onPositionMove();
    }
}

window.plugin.L8Alert.onPositionMove = function() {
    var sometingToDisplay = false;
    var html='L8 Detection : <table>';
    console.log(window.portals);
    
    if (window.plugin.L8Alert.listL8.length>0){
        $.each(window.plugin.L8Alert.listL8, function (ind,portal){
            if (portal.numL8 >= minL8){
                sometingToDisplay = true;
              html += '<tr><td>' + window.plugin.L8Alert.getPortalLink(portal.portal) + '</td>';
                html += '<td>' + portal.numL8 + '</td></tr>';
            }
        });
    }
    if (!sometingToDisplay){
        html += 'No portal with ' + minL8 + ' L8 resonators';
    }
    html += '</table>';
    $('#L8Alert').html(html);   
}
    
var myP = function(portal, numL8) {
    this.portal = portal;
    this.numL8 = numL8;
}    

window.plugin.L8Alert.portalAdded = function(data) {
 
  var d = data.portal.options.details;
  var l8 = 0;
  if(getTeam(d) !== 0) {
      $.each(d.resonatorArray.resonators, function(ind, reso) {
          if(reso !== null) {
              if (reso.level == 8){l8++;}
          }
      });     
      if(l8 > 0 ) {
          var o = new myP(data, l8);
          window.plugin.L8Alert.listL8.push(o);  
      }
  }
}


window.plugin.L8Alert.portalDataLoaded = function(data) {
   // window.plugin.L8Alert.listL8 = [];
   /*$.each(data.portals, function(ind, portal) {
    if(window.portals[portal[0]]) {
      window.plugin.L8Alert.portalAdded({portal: window.portals[portal[0]]});
    }
  });*/
}

window.plugin.L8Alert.getPortalLink = function(portal) {
    
    var p = portal.portal.options;
    var latlng = [p.details.locationE6.latE6/1E6, p.details.locationE6.lngE6/1E6].join();
    var jsSingleClick = 'window.renderPortalDetails(\''+p.guid+'\');return false';
    var jsDoubleClick = 'window.zoomToAndShowPortal(\''+p.guid+'\', ['+latlng+']);return false';
    //var perma = 'https://ingress.com/intel?latE6='+portal.locationE6.latE6+'&lngE6='+portal.locationE6.lngE6+'&z=17&pguid='+guid;
    
    //Use Jquery to create the link, which escape characters in TITLE and ADDRESS of portal
    var a = $('<a>',{
        "class": 'help',
        text: p.details.portalV2.descriptiveText.TITLE,
        //href: perma,
        onClick: jsSingleClick,
        onDblClick: jsDoubleClick
    })[0].outerHTML;
    var div = '<div class="plugin-L8Alert-portallink">'+a+'</div>';
    return div;
}


var setup =  function() {
    $("<style>")
    .prop("type", "text/css")
    .html(".plugin-L8Alert-portallink {\
            max-height: 15px !important;\
			overflow: hidden;\
			//text-overflow:ellipsis;\
          }")
    .appendTo("head");
    
    
    window.addHook('portalAdded', window.plugin.L8Alert.portalAdded);
    window.addHook('portalDataLoaded', window.plugin.L8Alert.portalDataLoaded);
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
