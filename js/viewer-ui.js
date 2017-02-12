//
// synapse-viewer
//
// A flag to track whether plotly viewer is
// being used inside another window (i.e. Chaise), set enableEmbedded.

var DEBUG=false;
var START_THREED=true; // threeD one start with enabled mode
var HAS_SUBPLOTS=false; // see if subplots needs to be made or not
// 
//   eye bars fire 'three D'
//      eye data 
//      eye data2
//   eye bars 'subplot'
//      dot data
//      dot data2

var enableEmbedded = false;
if (window.self !== window.top) {
  var $iframe_parent_div = window.frameElement ? $(window.frameElement.parentNode) : null;
  if (!$iframe_parent_div || !$iframe_parent_div.is(':visible')) enableEmbedded = true;
}

var nameOfPlot=[];   // name of plots
var trackingPlot=[]; // which one is enabled
var trackingPlotHeat=[]; // enabled for heat scale, default is no
var nameOfData=[];   // name of data samples
var trackingData=[];  // which data is enabled for which plot
                      //{ '0': {0:true, 1:false,..} } 

// get the tracking data for a particular plot
function getDataListForPlot(plot_idx) {
  return trackingData[plot_idx];
}

function setupPlotList(dlist) {
  nameOfData=dlist;

  if(moreThanOneData()) {
    HAS_SUBPLOTS=true;
    if(!DEBUG)
      START_THREED=false; // by default, don't show if more than
                        // one data files initially
  }
  // disable the heat/pullout mode
  if(!DEBUG) {
    removePlotsClick_btn();
  }

  nameOfPlot.push('3D scatter'); // selectable data
  trackingPlot[0]=true;
  trackingPlotHeat[0]=false;

  if(HAS_SUBPLOTS) { 
    nameOfPlot.push('Subplots'); // not selectable data
    trackingPlot[1]=true;
    trackingPlotHeat[1]=false;
  }
  add2PlotList();
}


function useHeat(plot_idx) {
  return trackingPlotHeat[plot_idx];
}

function getPlotType(plot_idx) {
  return nameOfPlot[plot_idx];
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

// if datalist is more than one
function moreThanOneData(){
  if(nameOfData.length > 1)
    return true;
  return false;
}

function moreThanOnePlot(){
window.console.log("trackingPlot..", trackingPlot.length);
  if(trackingPlot.length > 1)
    return true;
  return false;
}

function isSubplot(plot_idx) {
  if(plot_idx==1)
    return true;  
  return false;
}

// given a plot, expand the html structure
// pname='subplot' or 'three D'
function addPlot(plot_idx, pname) {
  var name = pname.replace(/ +/g, "");
  var _n=name;
  var _visible_name=plot_idx+"_plot_visible";
  var _heat_name=plot_idx+"_plot_heat";
  var _collapse_name=plot_idx+"_plot_collapse";
  var _body_name=plot_idx+"_plot_body";
  var _eye_name='eye_'+name;
  var _fire_name='fire_'+name;
  var _mark_name='mark_'+name;

  var _nn='';
  _nn+='<div class="panel panel-default col-md-12">';
  _nn+='<div class="panel-heading">';
  _nn+='<div class="panel-title row" style="background-color:transparent;">'; 

if(moreThanOnePlot()) {
  _nn+='<button id="'+_visible_name+'" class="pull-left"  style="display:inline-block;outline: none;border:none; background-color:white"  onClick="togglePlot('+plot_idx+',\''+_eye_name+'\')" title="hide or show plot"><span id="'+_eye_name+'" class="glyphicon glyphicon-eye-open" style="color:#337ab7;"></span> </button>';
}
  
// XXX subplots can not have heat option 
if(name != "Subplots") {
  _nn+='<button id="'+_heat_name+'" class="pull-left" style="margin-left: -5px;display:inline-block;outline: none;border:none; background-color:white"  onClick="togglePlotHeat('+plot_idx+',\''+_fire_name+'\')" title="toggle to heat scale"><span id="'+_fire_name+'" class="glyphicon glyphicon-fire" style="color:#337ab7;"></span> </button>';
}

// if there is only 1 data, no need to expand
if(moreThanOneData()) {
  _nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#plotList" href="#' +_collapse_name+'" title="click to expand" >'+pname+'</a>';
} else {
  _nn+='<text>'+pname+'</text>';
}
  _nn+='</div> <!-- panel-title -->'; 
  _nn+='</div> <!-- panel-heading-->';
  _nn+='<div id="'+_collapse_name+'" class="panel-collapse collapse">';
  _nn+='<div id="'+_body_name+'" class="panel-body">';
  _nn+='</div> <!-- panel-body -->';
  _nn+='</div>';
  // last bits
  _nn+='</div> <!-- panel -->';
  jQuery('#plotList').append(_nn);
  window.console.log(_nn);
  return _visible_name;
}


/* add datalist to a plot */
function setupDataList2Plots() {
   for(var i=0; i<nameOfPlot.length;i++) {
     var pname=nameOfPlot[i];
     setupDataList(i, nameOfData);
     /* setup tracking of datalist per plot */
     var tmp={};
     for(var j=0; j<nameOfData.length; j++) {
       tmp[j]=true;
     }
     trackingData[i]=tmp;
   }
}

// setup datalist with accordian style
// for a particular plot, every plot has its own set of datalist structure
function setupDataList(plot_idx, dlist) {
   var tmp='';
// special case, if dlist.length == 1, might be using the
// default color..
/** ??? XXX not sure..
   if(dlist.length == 1) {
       var i=0;
       var dname=dlist[i];
       var h=add2DataList(plot_idx, i, dname, true);
       tmp += h;
   } else {
*/
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

// each data entry has an eye, color match with the color list
// if selectable, then tool tip shows up 
// if not selectable, then no tooltip
function add2DataList(plot_idx, data_idx,dname) {
  var y=isSubplot(plot_idx);
  var name = dname.replace(/ +/g, "");
  var _eye_name="eye_"+name+plot_idx;
  var _eye_color=getMyColor(data_idx);
  var _visible_name=plot_idx+"_"+data_idx+"_data_visible";
  var _nn='';
  _nn+='<div class="row col-md-12">'; 
  _nn+='<div class="menuLabel">'+dname; 
if(!y) {
  _nn+='<button id="'+_visible_name+'" class="pull-left"  style="display:inline-block;outline: none;border:none; background-color:white"  onClick="toggleDataByIdx('+plot_idx+','+data_idx+',\''+_eye_name+'\')" title="hide or show data"><span id="'+_eye_name+'" class="glyphicon glyphicon-eye-open" style="color:'+_eye_color+';"></span> </button>';
} else {
  _nn+='<button id="'+_visible_name+'" class="pull-left"  style="display:inline-block;outline: none;border:none; background-color:white" title="data shown"><span id="'+_eye_name+'" class="glyphicon glyphicon-asterisk" style="color:'+_eye_color+';"></span> </button>';
}
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
function disablePlot(plot_idx) {
  trackingPlot[plot_idx]=false;
//  window.console.log("P->",trackingPlot[plot_idx]);
  if(plot_idx == 0)
    $('#myViewer_scatter').css('display','none');
  if(plot_idx == 1)
    $('#myViewer_subplots').css('display','none');
}
function enablePlot(plot_idx) {
  trackingPlot[plot_idx]=true;
//  window.console.log("P->",trackingPlot[plot_idx]);
  if(plot_idx == 0)
    $('#myViewer_scatter').css('display','');
  if(plot_idx == 1)
    $('#myViewer_subplots').css('display','');
}

function offThreeD() {
  var name='3Dscatter';
  var plot_label='eye_'+name;
  togglePlot(0, plot_label);
}

function togglePlot(plot_idx, plot_label) {
  var tmp='#'+plot_label;
  var eptr = $(tmp);
  if( eptr.hasClass('glyphicon-eye-open')) {
    eptr.removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
    disablePlot(plot_idx);
    } else {
      eptr.removeClass('glyphicon-eye-close').addClass('glyphicon-eye-open');
      enablePlot(plot_idx);
  }
}


/*
   id="0_plot_heat" onClick="togglePlotHeat(0,'fire_3DScatter')"
   id="fire_3DScatter"
*/
function disablePlotHeat(plot_idx) {
  trackingPlotHeat[plot_idx]=false;
  refreshPlot(plot_idx);
}
function enablePlotHeat(plot_idx) {
  trackingPlotHeat[plot_idx]=true;
  refreshPlot(plot_idx);
}

function togglePlotHeat(plot_idx, plot_label) {
  var tmp='#'+plot_label;
  var eptr = $(tmp);
  if( eptr.hasClass('glyphicon-fire')) {
    eptr.removeClass('glyphicon-fire').addClass('glyphicon-cog');
    enablePlotHeat(plot_idx);
    } else {
      eptr.removeClass('glyphicon-cog').addClass('glyphicon-fire');
      disablePlotHeat(plot_idx);
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
  if(useHeat(plot_idx)) {
    refreshPlot(plot_idx);
    } else {
      offTrace(plot_idx,data_idx);
  }
}
function enableData(plot_idx,data_idx) {
  trackingData[plot_idx][data_idx]=true;
//  window.console.log("D->",trackingData[plot_idx]);
  if(useHeat(plot_idx)) {
    refreshPlot(plot_idx);
    } else {
      onTrace(plot_idx,data_idx);
  }
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
