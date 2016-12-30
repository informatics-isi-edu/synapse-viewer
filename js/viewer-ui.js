//
// synapse-viewer
//
// A flag to track whether plotly viewer is
// being used inside another window (i.e. Chaise), set enableEmbedded.

//   eye bars 'three D'
//      eye data 
//      eye data2

var enableEmbedded = false;
if (window.self !== window.top) {
  var $iframe_parent_div = window.frameElement ? $(window.frameElement.parentNode) : null;
  if (!$iframe_parent_div || !$iframe_parent_div.is(':visible')) enableEmbedded = true;
}

var nameOfPlot=[];   // name of plots
var trackingPlot=[]; // which one is enabled
var nameOfData=[];   // name of data samples
var trackingData=[];  // which data is enabled for which plot
                      //{ '0': {0:true, 1:false,..} } 

// get the tracking data for a particular plot
function getDataListForPlot(plot_idx) {
  return trackingData[plot_idx];
}

function setupPlotList() {
  nameOfPlot.push('3D Scatter');
  add2PlotList(0,'3D Scatter');
  trackingPlot[0]=true;
}

function getPlotVisName(plot_idx) {
  var _visible_name=plot_idx+"_plot_visible";
  return _visible_name;
}
function getDataVisName(plot_idx, data_idx) {
  var _visible_name=plot_idx+"_"+data_idx+"_data_visible";
  return _visible_name;
}

// fill in the top level of plotList
function add2PlotList() {
   for(var i=0; i<nameOfPlot.length;i++) {
     var pname=nameOfPlot[i];
     addPlot(i, pname);
   }
}

// given a plot, expand the html structure
function addPlot(plot_idx, pname) {
  var name = pname.replace(/ +/g, "");
  var _n=name;
  var _visible_name=plot_idx+"_plot_visible";
  var _collapse_name=plot_idx+"_plot_collapse";
  var _body_name=plot_idx+"_plot_body";
  var _eye_name='eye_'+name;

  var _nn='';
  _nn+='<div class="panel panel-default col-md-12">';
  _nn+='<div class="panel-heading">';
  _nn+='<div class="panel-title row" style="background-color:transparent;">'; 
  _nn+='<button id="'+_visible_name+'" class="pull-left"  style="display:inline-block;outline: none;border:none; background-color:white"  onClick="togglePlot('+plot_idx+',\''+_eye_name+'\')" title="hide or show plot"><span id="'+_eye_name+'" class="glyphicon glyphicon-eye-open" style="color:#337ab7;"></span> </button>';
  _nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#plotList" href="#' +_collapse_name+'" title="click to expand" >'+pname+'</a>';
  _nn+='</div> <!-- panel-title -->'; 
  _nn+='</div> <!-- panel-heading-->';
  _nn+='<div id="'+_collapse_name+'" class="panel-collapse collapse">';
  _nn+='<div id="'+_body_name+'" class="panel-body">';
  // last bits
  _nn+='</div> <!-- panel-body -->';
  _nn+='</div>';
  _nn+='</div> <!-- panel -->';
  jQuery('#plotList').append(_nn);
  window.console.log(_nn);
  return _visible_name;
}


/* add datalist to a plot */
function setupDataList2Plots(dlist) {
   nameOfData=dlist;
   for(var i=0; i<nameOfPlot.length;i++) {
     var pname=nameOfPlot[i];
     setupDataList(i, dlist);
     /* setup tracking of datalist per plot */
     var tmp={};
     for(var j=0; j<dlist.length; j++) {
       tmp[j]=true;
     }
     trackingData[i]=tmp;
   }
}

// setup datalist with accordian style
// for a particular plot, every plot has its own set of datalist structure
function setupDataList(plot_idx, dlist) {
   var tmp='';
   for( var i=0;i<dlist.length;i++) {
     var dname=dlist[i];
     var h=add2DataList(plot_idx, i, dname);
     tmp += h;
   }
  var _body_name=plot_idx+"_plot_body";
  var pname= '#'+_body_name;
  jQuery(pname).append(tmp);
window.console.log(tmp);
}

function add2DataList(plot_idx, data_idx,dname) {
  var name = dname.replace(/ +/g, "");
  var _eye_name="eye_"+name+plot_idx;
  var _eye_color=getColor(data_idx);
  var _visible_name=plot_idx+"_"+data_idx+"_data_visible";
  var _nn='';
  _nn+='<div class="row col-md-12">'; 
  _nn+='<div class="menuLabel">'+dname; 
  _nn+='<button id="'+_visible_name+'" class="pull-left"  style="display:inline-block;outline: none;border:none; background-color:white"  onClick="toggleDataByIdx('+plot_idx+','+data_idx+',\''+_eye_name+'\')" title="hide or show data"><span id="'+_eye_name+'" class="glyphicon glyphicon-eye-open" style="color:'+_eye_color+';"></span> </button>';
  _nn+='</div> <!--menuLabel-->';
  _nn+='</div>';
  return _nn;
}

function isEmpty(obj) {
  for (var x in obj) {
    if (obj.hasOwnProperty(x))
      return false;
  }
  return true;
}

/*
   id="0_plot_visible" onClick="togglePlot(0,'eye_3DScatter')"
   id="eye_3DScatter"
*/
function removePlot(plot_idx) {
  trackingPlot[plot_idx]=false;
//  window.console.log("P->",trackingPlot[plot_idx]);
}
function enablePlot(plot_idx) {
  trackingPlot[plot_idx]=true;
//  window.console.log("P->",trackingPlot[plot_idx]);
}

function togglePlot(plot_idx, plot_label) {
  var tmp='#'+plot_label;
  var eptr = $(tmp);
  if( eptr.hasClass('glyphicon-eye-open')) {
    eptr.removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
    removePlot(plot_idx);
    } else {
      eptr.removeClass('glyphicon-eye-close').addClass('glyphicon-eye-open');
      enablePlot(plot_idx);
  }
}
/*
id="0_0_data_visible"         
"toggleDataByIdx(0,0,'eye_segment1_0')" 
id="eye_segment1_0" 
*/
function removeData(plot_idx,data_idx) {
  trackingData[plot_idx][data_idx]=false;
//  window.console.log("D->",trackingData[plot_idx]);
  var tlist=getDataListForPlot(plot_idx);
  updatePlot(plot_idx,tlist,savePlotP);

}
function enableData(plot_idx,data_idx) {
  trackingData[plot_idx][data_idx]=true;
//  window.console.log("D->",trackingData[plot_idx]);
  var tlist=getDataListForPlot(plot_idx);
  updatePlot(plot_idx,tlist,savePlotP);
}

function toggleDataByIdx(plot_idx,data_idx, data_label) {
  var tmp='#'+data_label;
  var eptr = $(tmp);
  if( eptr.hasClass('glyphicon-eye-open')) {
    eptr.removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
    removeData(plot_idx,data_idx);
    } else {
      eptr.removeClass('glyphicon-eye-close').addClass('glyphicon-eye-open');
      enableData(plot_idx,data_idx);
  }
}
