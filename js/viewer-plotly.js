//
// synapse-viewer
//
var saveThreeD; // first one is threeD, 2nd is subplots
var saveSubplots=[];
var saveSubplotsTracking=[]; // -1 not inZoom, 0 inZoom, 1 inZoom and firstOne
var withZoomLock=true; // subplots zooming mode, sync or not
var inZoomLoop=false;
var zoomTrack=0;

function addAPlot(divname, data, layout, w, h, mode) {
window.console.log("calling addAPlot..");
  var d3 = Plotly.d3;
  var gd3 = d3.select(divname)
    .append('div')
    .style({
        width: w,
        height: h,
        visibility: 'inherit'
    });

  var config={displayModeBar: mode};

  var gd = gd3.node();
  Plotly.newPlot(gd, data, layout, config);
  return gd;
}

function rangeOfScatter(aPlot) {
    var aDiv=aPlot;
    var a=aDiv.layout.xaxis.range;
    var b=aDiv.layout.yaxis.range;
    return [a,b];
}

/* chop off entries that is not within the min, max range */
function rangeItByValue(data, key,min,max) {
    var _p=getOriginalDataByKey(data, key);
    var _cnt=_p.length;
    var _v;
    var _new=[];
    for( i=0; i< _cnt; i++) {
      _v=_p[i];
      if( _v > min && _v < max) {
         _new.push(_v);
      }
    }
    return _new;
}

// get min max ranges of x/y/z axis
// from all of the data files
function getMinMax(datalist) {
  var tmp;
  var tmax;
  var tmin;
  tmp=getOriginalDataByKey(datalist[0],'X');
  var _maxX=Math.max.apply(Math,tmp);
  var _minX=Math.min.apply(Math,tmp);
  tmp=getOriginalDataByKey(datalist[0],'Y');
  var _maxY=Math.max.apply(Math,tmp);
  var _minY=Math.min.apply(Math,tmp);
  tmp=getOriginalDataByKey(datalist[0],'Z');
  var _maxZ=Math.max.apply(Math,tmp);
  var _minZ=Math.min.apply(Math,tmp);
  for(var i=1; i<datalist.length; i++) {
    tmp=getOriginalDataByKey(datalist[i],'X');
    tmax=Math.max.apply(Math,tmp);
    tmin=Math.min.apply(Math,tmp);
    if(tmax > _maxX) _maxX=tmax;
    if(tmin < _minX) _minX=tmin;
    tmp=getOriginalDataByKey(datalist[i],'Y');
    tmax=Math.max.apply(Math,tmp);
    tmin=Math.min.apply(Math,tmp);
    if(tmax > _maxY) _maxY=tmax;
    if(tmin < _minY) _minY=tmin;
    tmp=getOriginalDataByKey(datalist[i],'Z');
    tmax=Math.max.apply(Math,tmp);
    tmin=Math.min.apply(Math,tmp);
    if(tmax > _maxZ) _maxZ=tmax;
    if(tmin < _minZ) _minZ=tmin;
  }
  return [[_minX,_maxX], [_minY,_maxY], [_minZ,_maxZ]]; 
}

function getOverallMinMax(ranges) {
  var _x=ranges[0][1];
  var _y=ranges[1][1];
  var _z=ranges[2][1];
  var _max=Math.max.apply(Math,[_x,_y,_z]);
  var _x=ranges[0][0];
  var _y=ranges[1][0];
  var _z=ranges[2][0];
  var _min=Math.min.apply(Math,[_x,_y,_z]);
  return [_min,_max];
}

// for range 1:100, 1:100, 1:20, ratio is 1,1,0.2
//http://stackoverflow.com/questions/37032687/plotly-3d-surface-change-cube-to-rectangular-space
// very hacky!! assume all started at 0s
function getLayoutAspectratio(ranges) {
// X,Y,Z 
  var _x=ranges[0][1];
  var _y=ranges[1][1];
  var _z=ranges[2][1];
  var _max=Math.max.apply(Math,[_x,_y,_z]);
  _x=_x/_max;
  _y=_y/_max;
  _z=_z/_max;
  
  var r={ x:_x, y:_y, z:_z };
  return r;
}

// get min max of a plotly data
function getMinMaxOfPlotlyData(pdata) {
  var tmp=pdata['x'];
  var _max=Math.max.apply(Math,tmp);
  var _min=Math.min.apply(Math,tmp);
  var xrange=[_min,_max];
  tmp=pdata['y'];
  _max=Math.max.apply(Math,tmp);
  _min=Math.min.apply(Math,tmp);
  var yrange=[_min,_max];
  tmp=pdata['z'];
  _max=Math.max.apply(Math,tmp);
  _min=Math.min.apply(Math,tmp);
  var zrange=[_min,_max];
  return [ xrange, yrange, zrange];
}

function getScatter3DAt_set(fname,data,xkey, ykey, zkey, sz, op, mcolor,vis) {
  var x=getOriginalDataByKey(data,xkey);
  var y=getOriginalDataByKey(data,ykey);
  var z=getOriginalDataByKey(data,zkey);
  var l={};
  if(sz > 4) {
    if(op < 0.5) {
       l={color: "white", width: 1};
       } else {
         l={color: "black", width: 1};
    }
  }
  var data= {  name: fname,
               x: x,
               y: y,
               z: z,
               mode: "markers",
               visible: vis,
               marker: {
                   color: mcolor,
                   size: sz,
//                   line: l,
                   opacity: op 
               },
               type:"scatter3d" };
   return data;
}

// combine all the data into a single trace before drawing it
// fix the marker size and also the opacity
function getScatter3DAt_heat(fname,datalist,xkey, ykey, zkey, heatkey, visiblelist, _thickness, heatxpad) {
  var cnt=datalist.length;
  var d;
  var x=[];
  var y=[];
  var z=[];
  var mcolor=[];
  for(var i=0; i< cnt; i++) {
    if(visiblelist[i]) {
      d=datalist[i]; 
      var xx=getOriginalDataByKey(d,xkey);
      var yy=getOriginalDataByKey(d,ykey);
      var zz=getOriginalDataByKey(d,zkey);
      var mm=getOriginalDataByKey(d,heatkey);
      x=x.concat(xx);
      y=y.concat(yy);
      z=z.concat(zz);
      mcolor=mcolor.concat(mm);
    }
  }

  var cmax=Math.max.apply(Math,mcolor);
  var cmin=Math.min.apply(Math,mcolor);
  var data= {  x: x,
               y: y,
               z: z,
               mode: "markers",
               marker: {
                   color: mcolor,
                   size: 2,
                   line: {color: "black", width: 1},
//                   colorscale: 'Viridis',
//                   colorscale: 'Rainbow',
                   colorscale: 'Greens',
                   cmax:cmax,
                   cmin:cmin,
                   colorbar: {
                          thickness: _thickness,
                          title:heatkey,
                          xpad:heatxpad
                             },
                   opacity: 0.6 
               },
               type:"scatter3d" };
   return data;
}

function getScatter3DDefaultLayout(xkey,ykey,zkey,xrange,yrange,zrange,width,height,ticks, title){
  var mrange=getOverallMinMax([xrange, yrange, zrange]);
  var tmpx, tmpy, tmpz;
window.console.log("mrange is..",mrange);
  if(xrange && yrange && zrange) {
    tmpx= { "title":xkey, 
            "showline": true,
            "ticks":"inside",
            "linecolor": '#3C3C3C', // black
            "nticks": ticks,
            "range" : mrange,
            "gridcolor" : '#3C3C3C',
            "linewidth": 3};
    tmpy= { "title":ykey,
            "showline": true,
            "ticks":"inside",
            "linecolor": '#3C3C3C', // black
            "nticks": ticks,
            "range" : mrange,
            "gridcolor" : '#3C3C3C',
            "linewidth": 3};
    tmpz= { "title":zkey,
            "showline": true,
            "ticks":"inside",
            "linecolor": '#3C3C3C', // black
            "nticks": ticks,
            "range" : mrange,
            "gridcolor" : '#3C3C3C',
            "linewidth": 3};
    } else {
      tmpx= { "title":xkey };
      tmpy= { "title":ykey };
      tmpz= { "title":zkey };
  }
  var p= {
      width: width, 
      height: height,
      annotations: [
        {
          x: 0.5,
          y: 0.9,
          font: {size: 16, color: '#666666'},
          showarrow: false,
          text: title,
          xanchor: 'center',
          xref: 'paper',
          yanchor: 'bottom',
          yref: 'paper'
        }],
//      title: title,
      margin: {
              l: 10,
              r: 10,
              b: 10,
              t: 10,
              },
//paper_bgcolor:"rgb(31,31,31)",
//plot_bgcolor:"rgb(31,31,31)",
paper_bgcolor:"rgb(0,0,0)",
plot_bgcolor:"rgb(0,0,0)",
      showlegend: false,
      hovermode: 'closest',
      scene: {
        xaxis: tmpx,
        yaxis: tmpy,
        zaxis: tmpz,
        aspectratio: {x:1,y:1,z:1},
       camera : { eye:{x:1.3,y:1.3,z:1.3},
//        camera : { eye:{x:0.5,y:0.5,z:1.3},
                   up: {x:0,y:0,z:1},
                   center: {x:0,y:0,z:0}}
      }
      };
window.console.log(p);
  return p;
}

// need to make the whole set and then turn the untracked 
// trace to be invisible
// the heat version is just to rebuilt the whole set from 
// scratch
function addThreeD(plot_idx,keyX,keyY,keyZ, config, fwidth, fheight, title) {
  var datalist=config[0];
  var colorlist=config[1];
  var namelist=config[2];
  var sizelist=config[3];
  var opacitylist=config[4];
  var visiblelist=config[5];
  var aliaslist=config[6];
   
  var _data=[];
  var _width=fwidth;
  var _height=fheight;
  var cnt=datalist.length;
// special case..
  if(useHeat(plot_idx)) {
    var thickness=30; // default
    var heatxpad=10;
    if(_width < 400) {
      thickness=10;
      heatxpad=0;
    }
  
    var tmp=getScatter3DAt_heat(namelist, datalist, keyX, keyY, keyZ,
                   useHeatTerm(0),visiblelist, thickness, heatxpad);
    _data.push(tmp);
    } else {
    for( var i=0; i<cnt; i++) {
       var tmp=getScatter3DAt_set(namelist[i], datalist[i], keyX, keyY, keyZ,
            sizelist[i], opacitylist[i], colorlist[i], visiblelist[i]);
       _data.push(tmp);
    }
  }

  var _nticks=0; // default is 0-(don't care)
  if(_width < 400) {
    _nticks=5;
  }
  // special case, 
  var _layout=getScatter3DDefaultLayout(keyX,keyY,keyZ,
              saveRangeX, saveRangeY, saveRangeZ, 
              _width, _height, _nticks, title);
  var plot;
// do not show mobar if the window is smaller than 400
  if(_width > 400)
    plot=addAPlot(scatterDivname,_data, _layout, _width, _height, true);
    else
      plot=addAPlot(scatterDivname,_data, _layout, _width, _height, false);

  saveThreeD=plot;
  return plot;
}


function foo(plot)
{
var data=plot.data;
var n='';
for(var i=0;i<data.length;i++) {
  n+= data[i].name;
  n+=":";
}
return n;
}
 
function addPlotlyTrace(plot,target) {
  var _data=plot.data;
  if(_data.length <= target) {
    // no trace in there.
    } else {
      var update = { visible: true };
      Plotly.restyle(plot, update, [target]);
  }
}

function removePlotlyTrace(plot,target) {
  var _data=plot.data;
  if(_data.length <= target) {
    // no trace in there.
    } else {
      var update = { visible: false };
      Plotly.restyle(plot, update, [target]);
  }
}

function relayoutPlotlyPlot(plot,update) {
  Plotly.relayout(plot,update);
}

function restylePlotlyPlot(plot, update, target) {
  Plotly.restyle(plot,update, target);
}

function getTraceNameList(data_idx) {
  var nm=initPlot_name[data_idx];
  return nm;
}

function getDataIdFromList(nm) {
  for(var i=0; i<initPlot_name.length;i++) {
    if (nm==initPlot_name[i])
      return i;
  }
}

// find the trace id of a data stub by matching
// with plot.data[i].name
function getTraceIdxFromPlot(plot, trace_name) {
  var data=plot.data;
  for(var i=0; i< data.length;i++) {
    if(trace_name== data[i].name)
      return i; 
  }
}

// find the trace id of data stub whose's data_idx
// is the first entry that is bigger than the target
function getTraceIdxFromPlotLarger(plot, data_idx) {
  var data=plot.data;
  for(var i=0;i<data.length;i++) {
    var tmp_name=data[i].name;
    var tmp_idx=getDataIdFromList(tmp_name);
    if(tmp_idx > data_idx) {
      return i;
    }
  }
  return -1;
}

// on/off 
function offTrace(plot_idx,data_idx) {
  if(plot_idx ==0) { // it is the threeD plot  
    var plot=saveThreeD;
    removePlotlyTrace(plot,data_idx);
    } else {
// can not remove traces on subplots
  }
}
// on/off 
function onTrace(plot_idx,data_idx) {
  if(plot_idx ==0) { // it is the threeD plot  
    var plot=saveThreeD;
    addPlotlyTrace(plot,data_idx);
    } else {
// can not add traces on subplots
  }
}
// just two at a time..
function addSubplots(plot_idx,keyX,keyY,keyZ, config, fwidth,fheight) {
  var datalist=config[0];
  var colorlist=config[1];
  var namelist=config[2];
  var sizelist=config[3];
  var opacitylist=config[4];
  var visiblelist=config[5];
  var aliaslist=config[6];
   
  var _data=[];
  var cnt=datalist.length;
  var set=cnt/2;
  var _width=fwidth;
  var _height=fheight/set;

  var _data;
  for(var i=0; i<cnt;) {
    _data=[];
    var tmp=getSubplotsAt(namelist[i], datalist[i], keyX, keyY, keyZ, colorlist[i], "scene");
    _data.push(tmp);
    var title1=aliaslist[i];
    i++;
    tmp=getSubplotsAt(namelist[i], datalist[i], keyX, keyY, keyZ, colorlist[i], "scene2");
    _data.push(tmp);
    var title2=aliaslist[i];
    i++;
    var _layout=getSubplotsDefaultLayout(keyX,keyY,keyZ,
                saveRangeX, saveRangeY, saveRangeZ, 
                _width, _height,title1,title2);

    // layout's title..

    var plot=addAPlot(subplotsDivname,_data, _layout, _width, _height, false);
    setupZoom(plot);
    saveSubplots.push(plot);
    pushInZoom();
  }
  return saveSubplots;
}


function getSubplotsAt(fname,data,xkey, ykey, zkey, mcolor, slabel) {
  var x=getOriginalDataByKey(data,xkey);
  var y=getOriginalDataByKey(data,ykey);
  var z=getOriginalDataByKey(data,zkey);
  var data= { name: fname,
               x: x,
               y: y,
               z: z,
               scene: slabel,
               mode: "markers",
               marker: {
                   color: mcolor,
                   size: 1,
//                   line: {color: "black", width: 0.5},
                   opacity: 1 
               },
               type:"scatter3d" };
   return data;
}

function getSubplotsDefaultLayout(xkey,ykey,zkey,xrange,yrange,zrange,width,height,title1, title2){
  var tmpx, tmpy, tmpz;
  if(xrange && yrange && zrange) {
  var mrange=getOverallMinMax([xrange, yrange, zrange]);
  var _aspectratio={ x:1, y:1, z:1 };
window.console.log("calc aspectratio..",_aspectratio);
    tmpx= { "title":xkey, 
//'#636363',
            "showline": true,
            "linecolor": 'black',
            "linewidth": 2,
            "gridcolor" : '#3C3C3C',
            "range": mrange };
    tmpy= { "title":ykey,
            "showline": true,
            "linecolor": 'black',
            "linewidth": 2,
            "gridcolor" : '#3C3C3C',
            "range": mrange };
    tmpz= { "title":zkey,
            "showline": true,
            "linecolor": 'black',
            "linewidth": 2,
            "gridcolor" : '#3C3C3C',
             "range": mrange };
    } else {
      tmpx= { "title":xkey };
      tmpy= { "title":ykey };
      tmpz= { "title":zkey };
  }
  var p= {
      width: width,
      height: height,
      paper_bgcolor:"rgb(31,31,31)",
      plot_bgcolor:"rgb(31,31,31)",
      showlegend: false,
      hovermode: 'closest',
      annotations: [
        {
          x: 0.25, 
          y: 1.0, 
          font: {size: 16, color: '#666666'}, 
          showarrow: false, 
          text: title1, 
          xanchor: 'center', 
          xref: 'paper', 
          yanchor: 'bottom', 
          yref: 'paper'
        }, 
        {
          x: 0.75, 
          y: 1.0, 
          font: {size: 16, color:'#666666'}, 
          showarrow: false, 
          text: title2, 
          xanchor: 'center', 
          xref: 'paper', 
          yanchor: 'bottom', 
          yref: 'paper'
        }], 
    scene: {
        title: 'title1',
        xaxis: tmpx,
        yaxis: tmpy,
        zaxis: tmpz,
        aspectratio : _aspectratio,
        camera : { eye:{x:1,y:1,z:1},
                   up: {x:0,y:0,z:1},
                   center: {x:0,y:0,z:0}},
        domain: {
            x: [0.0,  0.5],
            y: [0, 1]
        },},
    scene2: {
        xaxis: tmpx,
        yaxis: tmpy,
        zaxis: tmpz,
        aspectratio : _aspectratio,
        camera : { eye:{x:1,y:1,z:1},
                   up: {x:0,y:0,z:1},
                   center: {x:0,y:0,z:0}},
        domain: {
            x: [0.5, 1.0],
            y: [0, 1]
        }},
    margin: {
    l: 5,
    r: 5,
    b: 5,
    t: 30,
    pad:10,
        },
      };
//window.console.log(p);
  return p;
}

/************ZOOM**********************************/
function getSubplotsTracking(target) {
  var cnt=saveSubplots.length;
  for(var i=0; i<cnt; i++) {
    if( saveSubplots[i]==target ) {
 window.console.log("getSubplots..",i);
      return i;
    }
  }
  window.console.log("PANIC!! no correponding subplots..");  
  return 0;
}

//saveSubplotsTracking, -1 not inZoom, 0 inZoom, 1 inZoom&&firstOne
function pushInZoom() {
  saveSubplotsTracking.push(-1);
}

function inZoom(pidx) {
  return (saveSubplotsTracking[pidx] != -1);
}

function isFirstInZoom(pidx) {
  return (saveSubplotsTracking[pidx] == 1);
}

function setInZoom(pidx,firstOne) {
  if(firstOne)
    saveSubplotsTracking[pidx]=1;
    else
      saveSubplotsTracking[pidx]=0;
}
function unsetInZoom(pidx) {
  saveSubplotsTracking[pidx]=-1;
}

function setupZoom(plot) {
  plot.on('plotly_relayout',
    function(eventdata){  
        var pidx=getSubplotsTracking(plot);

window.console.log("ZOOM, for ",pidx," eventdata, --", JSON.stringify(eventdata));
        if(!withZoomLock) { // no need to sync
          return; 
          } else {  // need to sync

            // if it is the first zoom
            var firstOne=false;
            if(zoomTrack==0) { // the first one
window.console.log("FFF, first plotly relay call..");
              firstOne=true;
              raiseAll(pidx,eventdata);
            }
            if(zoomTrack == 0) { //again, last one..
window.console.log("FFF, last plotly relay call..");
              return;
            }

            if(!inZoom(pidx)) { // sync the same pair
window.console.log("SSS, first start on the zooming..",pidx);
              setInZoom(pidx,firstOne);
              } else { // already inZoom  
window.console.log("SSS, already in zoom..", pidx);
// need to determine if this is the first call then return
// else need to zoom the current one..
                if(isFirstInZoom(pidx)) {
window.console.log("SSSFFF, in zoom and also first one..", pidx);
                  } else {
window.console.log("SSSNNN, in zoom and not first one..", pidx);
/* this causes recursion
              var _tmp=eventdata['scene2'];
              if(_tmp) {
                zoomIn(plot,pidx, 'scene',_tmp.eye);
              }
              _tmp=eventdata['scene'];
              if(_tmp) {
                zoomIn(plot,pidx, 'scene2',_tmp.eye);
              }
*/
                }
                if(zoomTrack > 0)
                  zoomTrack--;
                unsetInZoom(pidx);
                return;
            }

window.console.log("SSS, process a plot,",pidx);
            if( 'scene' in eventdata ) {
              var _tmp=eventdata['scene'];
window.console.log("ZOOM, process for >scene2< of ",pidx);
              zoomIn(plot,pidx, 'scene2',_tmp.eye);
            }
            if( 'scene2' in eventdata ) {
              var _tmp=eventdata['scene2'];
window.console.log("ZOOM, process for >scene< of ",pidx);
              zoomIn(plot,pidx, 'scene',_tmp.eye);
            }
        }
    });
}

function zoomIn(plot,pidx, id, eye) {
  var scene = plot._fullLayout[id]._scene;
  var camera = scene.getCamera();
  var _x=eye.x;
  var _y=eye.y;
  var _z=eye.z;
  var _eye={x:_x, y:_y, z:_z };
  camera.eye=_eye;
  scene.setCamera(camera); // this causes relayout event
//window.console.log("zoomIn..relayout ",pidx," for ",id);
//  Plotly.relayout(plot, camera);
}

function raiseAll(pidx,data) {
window.console.log("raiseAll, for ",pidx);
  var cnt=saveSubplots.length;
  zoomTrack=cnt;
  for(var i=0; i<cnt; i++) {
    if(i != pidx) {
window.console.log("raiseAll,  working on ",i," from, ",pidx);
      var _plot=saveSubplots[i];
      Plotly.relayout(_plot, data);
    }
  }
}

      
/************ANIMATION**********************************/
// this is a hack..
// really should use plotly.animate but unforuntately the
// relayout for camera.eye is not merged into the main trunk
// yet
var spinning=false;
function runSpin() {
  spinning = !spinning;
  var btn = document.getElementById('spin-button');
  if(spinning) {
    var plot=saveThreeD; 
    var layout = plot._fullLayout['scene'];
    spinIt();
    btn.style.color = 'grey';
    } else {
      btn.style.color = 'red';
  }
}

function spinIt() {
  var plot=saveThreeD;
  var _x=plot.layout.scene.camera.eye.x; // use x as the 'zoom'
  var _y=plot.layout.scene.camera.eye.y; // use x as the 'zoom'
  var zoom=Math.sqrt(_x * _x + _y * _y);
//window.console.log("zoom is", zoom);
  rotate(plot,'scene', Math.PI/180, zoom);
//  rotate(plot, 'scene2', Math.PI / 180, zoom);
  if(spinning) {
    requestAnimationFrame(spinIt);
  }
}

var _angle=0;
function rotate(plot,id, delta, zoom) {
  var scene = plot._fullLayout[id]._scene;
  var camera = scene.getCamera();
  var _x=Math.cos(_angle)*zoom;
  var _y=Math.sin(_angle)*zoom;
  var _z=camera.eye.z;
  var _eye={x:_x, y:_y, z:_z };
  camera.eye=_eye;
  scene.setCamera(camera);
  if(_angle >= 6.3) {
    _angle=0;
    } else {
      _angle=_angle+delta;
  }
}
