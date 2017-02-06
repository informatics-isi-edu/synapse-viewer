//
// synapse-viewer
//
var savePlot=[]; // first one is threeD, 2nd is subplots

function addAPlot(divname, data, layout, w, h, mode) {
  var d3 = Plotly.d3;
  var gd3 = d3.select(divname)
    .append('div')
    .style({
        width: w,
        height: h,
        visibility: 'inherit'
    });

  var gd = gd3.node();
  Plotly.newPlot(gd, data, layout, {displayModeBar: mode});
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
                   line: l,
                   opacity: op 
               },
               type:"scatter3d" };
   return data;
}

// combine all the data into a single trace before drawing it
// fix the marker size and also the opacity
function getScatter3DAt_heat(fname,datalist,xkey, ykey, zkey, heatkey, visiblelist, _thickness) {
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
                   size: 3,
                   line: {color: "black", width: 1},
                   colorscale: 'Viridis',
//                   colorscale: 'Rainbow',
                   cmax:cmax,
                   cmin:cmin,
                   colorbar: {
                          thickness: _thickness,
                          title:heatkey
                             },
                   opacity: 1 
               },
               type:"scatter3d" };
   return data;
}

function getScatter3DDefaultLayout(xkey,ykey,zkey,xrange,yrange,zrange,
aspects,width,height,ticks){
  var tmpx, tmpy, tmpz;
  if(xrange && yrange && zrange) {
    tmpx= { "title":xkey, 
            "showline": true,
            "ticks":"inside",
            "linecolor": 'black',
            "nticks": ticks,
            "range" : xrange,
            "gridcolor" : '#3C3C3C',
            "linewidth": 3};
    tmpy= { "title":ykey,
            "showline": true,
            "ticks":"inside",
            "linecolor": 'black',
            "nticks": ticks,
            "range" : yrange,
            "gridcolor" : '#3C3C3C',
            "linewidth": 3};
    tmpz= { "title":zkey,
            "showline": true,
            "ticks":"inside",
            "linecolor": 'black',
            "nticks": ticks,
            "range" : zrange,
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
      margin: {
              l:10,
              r:10,
              b:10,
              t:10, 
              },
//      paper_bgcolor: '#eaeaea',
paper_bgcolor:"rgb(31,31,31)",
plot_bgcolor:"rgb(31,31,31)",
      showlegend: false,
      hovermode: 'closest',
      scene: {
        xaxis: tmpx,
        yaxis: tmpy,
        zaxis: tmpz,
        aspectmode: "data",
//        aspectratio : { x:1, y:1, z:1 },
        camera : { eye:{x:1.3,y:1.3,z:1.3},
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
function addThreeD(plot_idx,keyX,keyY,keyZ, config, fwidth, fheight) {
  var datalist=config[0];
  var colorlist=config[1];
  var namelist=config[2];
  var sizelist=config[3];
  var opacitylist=config[4];
  var visiblelist=config[5];
   
  var _data=[];
  var _width=fwidth;
  var _height=fheight;
  var cnt=datalist.length;
// special case..
  if(useHeat(plot_idx)) {
    var thickness=30; // default
    if(_width < 400)
      thickness=10;
  
    var tmp=getScatter3DAt_heat(namelist, datalist, keyX, keyY, keyZ,
                   useHeatTerm(0),visiblelist, thickness);
    _data.push(tmp);
    } else {
    for( var i=0; i<cnt; i++) {
       var tmp=getScatter3DAt_set(namelist[i], datalist[i], keyX, keyY, keyZ,
            sizelist[i], opacitylist[i], colorlist[i], visiblelist[i]);
       _data.push(tmp);
    }
  }

  var _aspects=polishAspects(0); // use the first one
  var _nticks=0; // default is 0-(don't care)
  if(_width < 400) {
    _nticks=5;
  }
  var _layout=getScatter3DDefaultLayout(keyX,keyY,keyZ,
              saveRangeX, saveRangeY, saveRangeZ, _aspects, _width, _height, _nticks);
  var plot;
// do not show mobar if the window is smaller than 400
  if(_width > 400)
    plot=addAPlot(scatterDivname,_data, _layout, _width, _height, true);
    else
      plot=addAPlot(scatterDivname,_data, _layout, _width, _height, false);

  savePlot[0]=plot;
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
    var plot=savePlot[0];
    removePlotlyTrace(plot,data_idx);
    } else {
      var plot=savePlot[1];
      removePlotlyTrace(plot,data_idx);
  }
}
// on/off 
function onTrace(plot_idx,data_idx) {
  if(plot_idx ==0) { // it is the threeD plot  
    var plot=savePlot[0];
    addPlotlyTrace(plot,data_idx);
    } else {
      var plot=savePlot[1];
      addPlotlyTrace(plot,data_idx);
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
    i++;
    tmp=getSubplotsAt(namelist[i], datalist[i], keyX, keyY, keyZ, colorlist[i], "scene2");
    _data.push(tmp);
    i++;
    var _layout=getSubplotsDefaultLayout(keyX,keyY,keyZ,
                saveRangeX, saveRangeY, saveRangeZ, _width, _height);
    var plot=addAPlot(subplotsDivname,_data, _layout, _width, _height);
var ratio1=plot.layout.scene.aspectratio;
window.console.log("ratio1 :",ratio1);
var ratio2=plot.layout.scene2.aspectratio;
window.console.log("ratio2 :",ratio2);
    savePlot.push(plot);
  }
  return savePlot;
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
                   size: 3,
                   line: {color: "black", width: 0.5},
                   opacity: 1 
               },
               type:"scatter3d" };
   return data;
}

function getSubplotsDefaultLayout(xkey,ykey,zkey,xrange,yrange,zrange,width,height){
  var tmpx, tmpy, tmpz;
  if(xrange && yrange && zrange) {
window.console.log("xrange ",xrange);
window.console.log("yrange ",yrange);
window.console.log("zrange ",zrange);
    tmpx= { "title":xkey, 
//'#636363',
            "showline": true,
            "linecolor": 'black',
            "linewidth": 2,
            "gridcolor" : '#3C3C3C',
            "range": xrange };
    tmpy= { "title":ykey,
            "showline": true,
            "linecolor": 'black',
            "linewidth": 2,
            "gridcolor" : '#3C3C3C',
            "range": yrange };
    tmpz= { "title":zkey,
            "showline": true,
            "linecolor": 'black',
            "linewidth": 2,
            "gridcolor" : '#3C3C3C',
             "range": zrange };
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
    scene: {
        xaxis: tmpx,
        yaxis: tmpy,
        zaxis: tmpz,
//        aspectmode: "data",
// data range, x 3.64,138.32/y 3.9,136.5/z 4.8,58
// plotly's dataScale, 0.0074, 0.0075, 0.01879
// aspect ratio from plotly
// 1.3, 1.3, 0.539
// 1.2, 1.19, 0.699
//        aspectratio : { x:1, y:1, z:0.45 },
        camera : { eye:{x:1.3,y:1.3,z:1.3},
                   up: {x:0,y:0,z:1},
                   center: {x:0,y:0,z:0}},
        domain: {
            x: [0.0,  0.5],
            y: [0, 1],
            z: [0, 1],
        },},
    scene2: {
        xaxis: tmpx,
        yaxis: tmpy,
        zaxis: tmpz,
//        aspectmode: "data",
//        aspectratio : { x:1, y:1, z:0.45 },
        camera : { eye:{x:1.3,y:1.3,z:1.3},
                   up: {x:0,y:0,z:1},
                   center: {x:0,y:0,z:0}},
        domain: {
            x: [0.5, 1.0],
            y: [0, 1],
            z: [0, 1]
        }},
    margin: {
    l: 2,
    r: 2,
    b: 2,
    t: 2,
            pad:0,
        },
      };
//window.console.log(p);
  return p;
}

