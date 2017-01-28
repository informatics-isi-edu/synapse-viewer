//
// synapse-viewer
//
// Usage example:
//  http://localhost/synapse/view.html?
//     http://localhost/data/synapse/segments-dummy.csv
//
//  http://localhost/synapse/view.html?
//     url=http://localhost/data/synapse/segments-dummy.csv
//     &url=http://localhost/data/synapse/segments2.csv
//

//  type: "threeD"
//  type: "subplots"

var  initPlot_data=[]; // very first set of original data
var  filteredPlot_data=[]; // filtered the content..
var  initPlot_name; // original file stubs of the data files
var  saveFirst=true;

var  scatterDivname="#myViewer_scatter";
var  subplotsDivname="#myViewer_subplots";
var  frameWidth=0;
var  frameHeight=0;


/*
#DF0F0F    red (0.847, 0.057, 0.057)
#868600    yellow (0.527, 0.527, 0)
#009600    green (0, 0.592, 0)
#008E8E    cyan (0, 0.559, 0.559)
#5050FC    blue (0.316, 0.316, 0.991)
#B700B7    magenta (0.718, 0, 0.718)
*/

var defaultColor=['#DF0F0F','#868600','#009600','#5050FC', '#B700B7','#008E8E'];
// should be a very small file and used for testing and so can ignore
// >>Synchronous XMLHttpRequest on the main thread is deprecated
// >>because of its detrimental effects to the end user's experience.
function ckExist(url) {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState == 4) {
 // okay
    }
  }
  http.open("GET", url, false);
  http.send();
  if(http.status !== 404) {
    return http.responseText;
    } else {
      return null;
  }
};

/*****MAIN*****/
jQuery(document).ready(function() {

  frameHeight=window.innerHeight;
  frameWidth=window.innerWidth;
window.console.log("READY:: ", frameWidth, ", ",frameHeight);

// if the framewidth is small, then make the pull out to span
// the whole width or else just partial
  var ctrlptr=$('#controlBlock');
  if(frameWidth < 300) {
       ctrlptr.addClass("col-xs-12");
  } else if (frameWidth < 600) { 
       ctrlptr.addClass("col-xs-6");
  } else {
       ctrlptr.addClass("col-xs-4");
  }

  var fstub='csv';

  // defaults from viewer-user.js

//http://localhost/synapse/view.html?http://localhost/data/synapse/segments-dummy.csv
  var args=document.location.href.split('?');
  if (args.length >= 2) {
     var urls=processArgs(args);
     if(urls.length >= 1) {
       initPlot_name=loadAndProcessCSVfromFiles(urls);
       if(initPlot_name == [])
         return;
       var plist=setupPlotList(initPlot_name);
       setupDataList2Plots();
//XXX, filter the initial data set here.. ie, override=7
//XXX, collect and set the 'global information'
       } else {
         alertify.error("Usage: view.html?http://datapath/data.csv");
         return;
     }
  }

  if(!enableEmbedded) {
    displayInitPlot();
  }


  var resizeTimer;
// under chaise/angular, the plot window has
// width/height=0 when accordian-group is-open=false
window.addEventListener('resize', function(event){
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    doResize(); 
  }, 250);
});
}) // MAIN

function doResize() {
  frameHeight=window.innerHeight;
  frameWidth=window.innerWidth;
window.console.log("ONSIZE:: ", frameWidth, ", ",frameHeight);
  if(enableEmbedded) {
    if(saveFirst) {
      displayInitPlot();
       saveFirst=false;
      return;
    }
  }
  resizePlots();
}


// initial plot to display,
// The first one, 3d and uses all the data
function displayInitPlot() {
  var plot_idx=0;
  refreshPlot(plot_idx);
if(HAS_SUBPLOTS) {
  var plot_idx=1;
  refreshPlot(plot_idx);
}
}

// just in case myColor is too little
function getDefaultColor(p) {
  var len=defaultColor.length;
  var t= (p+len) % len; 
  return defaultColor[t];
}

// return datalist and a color list
function getDataWithTrackList(tlist) {
   var dlist=[]; // data list
   var clist=[]; // color list
   var nlist=[]; // data name list 
   var slist=[]; // marker size list
   var olist=[]; // marker opacity list
   var vlist=[]; // trace visible list
   var cnt=Object.keys(tlist).length;
   for(var i=0;i<cnt; i++) {
     dlist.push(initPlot_data[i]);
     clist.push(getMyColor(i));
     nlist.push(initPlot_name[i]);
     slist.push(markerSize(i));
     olist.push(markerOpacity(i));
     if(tlist[i]) {
       vlist.push(true);
       } else {
         vlist.push(false);
     }
   }
   return [dlist, clist, nlist, slist, olist, vlist];
}

// could add code for restyle if really needs to
function resizePlots() {
  var plot_idx=0;
  refreshPlot(plot_idx);
}

// This complete recompute the plot
function refreshPlot(plot_idx) {
  var tlist=getDataListForPlot(plot_idx);
  var ptype=getPlotType(plot_idx);
  switch (ptype) {
    case '3D scatter' :
      $(scatterDivname).empty();
      var config=getDataWithTrackList(tlist); 
      addThreeD(plot_idx,'X','Y','Z', config, frameWidth-5, frameHeight-5);
      break;
    case 'Subplots' :
      $(subplotsDivname).empty();
      var config=getDataWithTrackList(tlist); 
      addSubplots(plot_idx, 'X','Y','Z', config, frameWidth-5, frameHeight-5);
      break;
  }

//THIS altering scene top
/*
  var scene = document.getElementById("scene");
  scene.style.top='10px';
  window.console.log(">>> secene top",scene.style.top);
*/
}
