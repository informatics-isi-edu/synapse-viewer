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


/*
#DF0F0F    red (0.847, 0.057, 0.057)
#868600    yellow (0.527, 0.527, 0)
#009600    green (0, 0.592, 0)
#008E8E    cyan (0, 0.559, 0.559)
#5050FC    blue (0.316, 0.316, 0.991)
#B700B7    magenta (0.718, 0, 0.718)
*/

var myColor=['#DF0F0F','#868600','#009600','#5050FC', '#B700B7','#008E8E'];
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

  var fstub='csv';

  // defaults from viewer-user.js

//http://localhost/synapse/view.html?http://localhost/data/synapse/segments-dummy.csv
  var args=document.location.href.split('?');
  if (args.length >= 2) {
     var urls=processArgs(args);
     if(urls.length >= 1) {
       initPlot_name=loadAndProcessCSVfromFiles(urls);
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
})

// under chaise/angular, the plot window has
// width/height=0 when accordian-group is-open=false
window.onresize=function() {
   if(enableEmbedded) {
     if(saveFirst) {
       displayInitPlot();
       saveFirst=false;
     }
   }
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
function getColor(p) {
  var len=myColor.length;
  var t= (p+len) % len; 
  return myColor[t];
}

// return datalist and a color list
function getDataWithTrackList(tlist,myColor) {
   var dlist=[];
   var clist=[];
   var nlist=[];
   var cnt=Object.keys(tlist).length;
   for(var i=0;i<cnt; i++) {
     if(tlist[i]) {
       dlist.push(initPlot_data[i]);
       clist.push(getColor(i));
       nlist.push(initPlot_name[i]);
     }
   }
   return [dlist, clist, nlist];
}


// This complete recompute the plot
function refreshPlot(plot_idx) {
  var tlist=getDataListForPlot(plot_idx);
  var ptype=getPlotType(plot_idx);
  switch (ptype) {
    case '3D scatter' :
      $(scatterDivname).empty();
      var tmp=getDataWithTrackList(tlist,myColor); 
      var dlist=tmp[0];
      var clist=tmp[1];
      var nlist=tmp[2];
      addThreeD(plot_idx,nlist, dlist,'X','Y','Z', clist);
      break;
    case 'Subplots' :
      $(subplotsDivname).empty();
      var tmp=getDataWithTrackList(tlist,myColor); 
      var dlist=tmp[0];
      var clist=tmp[1];
      var nlist=tmp[2];
      addSubplots(plot_idx, nlist, dlist,'X','Y','Z', clist);
//      togglePlot(1,'eye_Subplots');
      break;
  }
}
