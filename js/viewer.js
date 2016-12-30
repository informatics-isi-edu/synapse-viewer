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

var  savePlotP=null; // tracking what plot type is currently being viewed
var  initPlot_plot=null; // very first plot type
var  initPlot_data=[]; // very first set of original data
var  initPlot_name; // original file stubs of the data files
var  saveFirst=true;

var myColor=['green','red','blue','orange','yellow'];
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
// just process 1st one for now
     if(urls.length >= 1) {
       var plist=setupPlotList();
       initPlot_name=loadAndProcessCSVfromFiles(urls);
       setupDataList2Plots(initPlot_name);
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
       reset2InitPlot();
       saveFirst=false;
     }
   }
}

// initial plot to display 3d 
// uses all the data
function displayInitPlot() {
  savePlotP='threeD';
  var plot_idx=0;
  var tlist=getDataListForPlot(0);
  updatePlot(plot_idx,tlist,savePlotP);
}

// initial plot to display
function reset2InitPlot() {
  savePlotP=initPlot_plot;
  displayInitPlot();
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
window.console.log("-->",tlist[i]);
     if(tlist[i]) {
       dlist.push(initPlot_data[i]);
       clist.push(getColor(i));
       nlist.push(initPlot_name[i]);
     }
   }
   return [dlist, clist, nlist];
}

function updatePlot(plot_idx,tlist,plotP) {
  $('#myViewer').empty();
  savePlotP=plotP;
  switch (plotP) {
    case 'threeD' :
      var tmp=getDataWithTrackList(tlist,myColor); 
      var dlist=tmp[0];
      var clist=tmp[1];
      var nlist=tmp[2];
//      addThreeD_one(nlist[0], dlist[0],'X','Y','Z', clist[0]);
      addThreeD(nlist, dlist,'X','Y','Z', clist);
      break;
  }
}
