//
// synapse-viewer
//
var saveThreeD; // first one is threeD, 2nd is subplots
var saveSubplots=[];
var inZoom=false;

function addAPlot(divname, data, layout, w, h, mode) {
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

// need to grab all the datalist's 'heat' field and then
// find the overal min and max, it does not make sense of
// different Heat Key though but the options is there. ie.
// not restricting it
function getMinMaxOfHeatIntensity(datalist,visiblelist) {
   var cnt=datalist.length;
   var mcolor=[];
   for(var i=0; i< cnt; i++) {
    if(visiblelist[i]) {
      var d=datalist[i]; 
      var heatkey=useHeatTerm(i);
      var mm=getOriginalDataByKey(d,heatkey);
      mcolor=mcolor.concat(mm);
    }
  }
  var cmax=Math.max.apply(Math,mcolor);
  var cmin=Math.min.apply(Math,mcolor);
  return [cmin,cmax];
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
// fixed marker size and also the opacity
// if custom cmax and cmin is defined, then use that to make the
// colorbar range
function getScatter3DAt_heat(fname,datalist,xkey, ykey, zkey, heatkey, visiblelist, _thickness, heatxpad, heatx, cmax, cmin, slabel) {
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

  var text=[];
  var fcnt=mcolor.length;
  for(var f=0;f<fcnt;f++) {
     var tmp=heatkey+ ':'+mcolor[f];
     text.push(tmp);
  }

  var _cmax=(cmax!=null ? cmax:Math.max.apply(Math,mcolor));
  var _cmin=(cmin!=null ? cmin:Math.min.apply(Math,mcolor));
  var data= {  x: x,
               y: y,
               z: z,
               mode: "markers",
               text: text,
//hoverinfo: 'text',
//hoverlabel: { bgcolor: 'red', font: {size: 10, color: 'red'} },
               marker: {
                   color: mcolor,
                   size: 1,
//                   line: {color: "black", width: 1},
//                   colorscale: 'Viridis',
//                   colorscale: 'Rainbow',
                   colorscale: 'Greens',
                   cmax:_cmax,
                   cmin:_cmin,
                   colorbar: {
                          x:heatx,
                          len:0.8,
                          thickness: _thickness,
                          title:heatkey,
                          titleside:'top',
                          xpad:heatxpad
                             },
                   opacity: 1 
               },
               type:"scatter3d" };
   if(slabel != null) {
     data.scene=slabel;
   }
   return data;
}

function getScatter3DDefaultLayout(xkey,ykey,zkey,xrange,yrange,zrange,width,height,ticks, title){
  var mrange=getOverallMinMax([xrange, yrange, zrange]);
  var tmpx, tmpy, tmpz;
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
  return p;
}

// need to make the whole set and then turn the untracked 
// trace to be invisible
// plot_idx=0, the single plot view (includes one or more datasets)
//   the heat version is to build a new data set from all
//   visible datasets from scratch and process as such
// plot_idx=1, the subplots view (one dataset per subplot)
//   the heat version is just per dataset 
// heated version has fixed opacity and also fixed marker size
//
function addThreeD(plot_idx,keyX,keyY,keyZ, config, fwidth, fheight, title) {

  if(!START_THREED)
    return null;
window.console.log("addThreeD!!!!");
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
    var heatx=0.85;
    if(_width < 500) {
      thickness=4;
      heatx=1.1;
      heatxpad=0;
    }
  
    var tmp=getScatter3DAt_heat(namelist, datalist, keyX, keyY, keyZ,
           useHeatTerm(0),visiblelist, thickness, heatxpad,heatx,
           null,null,null);
    _data.push(tmp);
    } else {
    for( var i=0; i<cnt; i++) {
       var tmp=getScatter3DAt_set(namelist[i], datalist[i], keyX, keyY, keyZ,
            sizelist[i], opacitylist[i], colorlist[i], visiblelist[i]);
       _data.push(tmp);
    }
  }

  var _nticks=0; // default is 0-(don't care)
  if(_width < 500) {
    _nticks=5;
  }
  // special case, 
  var _layout=getScatter3DDefaultLayout(keyX,keyY,keyZ,
              saveRangeX, saveRangeY, saveRangeZ, 
              _width, _height, _nticks, title);
  var plot;
// do not show mobar and suppress hover label if the window is smaller than 500
  if(_width > 500) {
    plot=addAPlot(scatterDivname,_data, _layout, _width, _height, true);
    }
    else {
      var dlen=_data.length;
      for(var i=0;i<dlen;i++) {
        _data[i].hoverinfo='none';
      }
      plot=addAPlot(scatterDivname,_data, _layout, _width, _height, false);
  }

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
// in the heat mode, the data needs to be 'normalized' together with
// a consolidated scale bar,
function addSubplots(plot_idx,keyX,keyY,keyZ, config, fwidth,fheight) {
  var datalist=config[0];
  var colorlist=config[1];
  var namelist=config[2];
  var sizelist=config[3];
  var opacitylist=config[4];
  var visiblelist=config[5];
  var aliaslist=config[6];
   
  var cnt=datalist.length;
  var set=cnt/2;
  var _width=fwidth;
  var _height=fheight;

  // add two at a time and skip the last oddball one
  var _data=[];
  var tmp;
  var m=getMinMaxOfHeatIntensity(datalist,visiblelist);
  var _cmin=m[0];
  var _cmax=m[1];
  var _scenelist=[];
  var _titlelist=[];
  var _scene;
  var _scene2;


  for(var i=0; i<cnt;) {
    if(i==0) {
      _scene='scene';
      } else {
        var j=i+1;
        _scene='scene'+j;
    }

    if(useHeat(plot_idx)) {
      tmp=getSubplotsAt_heat(namelist[i], datalist[i], keyX, keyY, keyZ, useHeatTerm(i), visiblelist[i], colorlist[i], _scene, _width, _cmax,_cmin);
      } else {
        tmp=getSubplotsAt(namelist[i], datalist[i], keyX, keyY, keyZ, colorlist[i], _scene);
    }
    _data.push(tmp);

    _titlelist.push(aliaslist[i]);
    i++;
    var j=i+1;
    _scene2='scene'+j;
    if(useHeat(plot_idx)) {
      tmp=getSubplotsAt_heat(namelist[i], datalist[i], keyX, keyY, keyZ, useHeatTerm(i), visiblelist[i], colorlist[i], _scene2, _width, _cmax,_cmin);
      } else {
        tmp=getSubplotsAt(namelist[i], datalist[i], keyX, keyY, keyZ, colorlist[i], _scene2);
    }
    _data.push(tmp);
    _scenelist.push(_scene);
    _scenelist.push(_scene2);
    _titlelist.push(aliaslist[i]);
    i++;
  }

  var _layout=getSubplotsDefaultLayout(keyX,keyY,keyZ,
                saveRangeX, saveRangeY, saveRangeZ, 
                _width, _height,_titlelist, _scenelist);

  // layout's title..

  var plot=addAPlot(subplotsDivname,_data, _layout, _width, _height, false);
  setupZoom(plot,_scenelist);
  saveSubplots.push(plot);

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


// can reuse the getScatter3DAt_heat with tweaked configuration
function getSubplotsAt_heat(fname,data,xkey, ykey, zkey, heatkey,
visible, color, slabel, width,cmax,cmin) {
    var _thickness=30; // default
    var _heatxpad=10;
    var _heatx=0.85;
    if(width < 500) {
      _thickness=4;
      _heatx=1.1;
      _heatxpad=0;
    }

    var data=getScatter3DAt_heat([fname],[data],xkey, ykey, zkey, heatkey, [visible], _thickness, _heatxpad,_heatx,cmax,cmin,slabel);

    return data;
}

function makeALayoutSet(tmpx,tmpy,tmpz,_aspectratio,title1, title2, scene1, scene2, setidx,setcnt)
{
  var ydelta=1/setcnt;
  var yval=1-(setidx * ydelta);
  var anno=[{
          x: 0.25, 
          y: yval,
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
          y: yval,
          font: {size: 16, color:'#666666'}, 
          showarrow: false, 
          text: title2, 
          xanchor: 'center', 
          xref: 'paper', 
          yanchor: 'bottom', 
          yref: 'paper'
        }]; 

    var dy1=(setcnt-setidx-1)*ydelta+0.02;
    var dy2=dy1+ydelta-0.02;
   
    var domain_y1=[dy1,dy2];
    var domain_y2=[dy1,dy2];
    var s1_v={ title: title1,
               xaxis: tmpx,
               yaxis: tmpy,
               zaxis: tmpz,
               aspectratio : _aspectratio,
               camera : { eye:{x:1,y:1,z:1},
                          up: {x:0,y:0,z:1},
                          center: {x:0,y:0,z:0}},
               domain: {
                       x: [0.0,  0.5],
                       y: domain_y1 
             }};
    var s2_v= {
        title:title2,
        xaxis: tmpx,
        yaxis: tmpy,
        zaxis: tmpz,
        aspectratio : _aspectratio,
        camera : { eye:{x:1,y:1,z:1},
                   up: {x:0,y:0,z:1},
                   center: {x:0,y:0,z:0}},
        domain: {
            x: [0.5, 1.0],
            y: domain_y2 
        }};

   return [anno, s1_v, s2_v ];
}
function getSubplotsDefaultLayout(xkey,ykey,zkey,xrange,yrange,zrange,width,height,titlelist, scenelist){

  var cnt=titlelist.length;
  var sets=cnt/2;

  var tmpx, tmpy, tmpz;
  if(xrange && yrange && zrange) {
  var mrange=getOverallMinMax([xrange, yrange, zrange]);
  var _aspectratio={ x:1, y:1, z:1 };
//window.console.log("calc aspectratio..",_aspectratio);
    tmpx= { "title":xkey, 
            "showline": true,
            "linecolor": '#3C3C3C',
            "linewidth": 2,
            "gridcolor" : '#3C3C3C',
            "range": mrange };
    tmpy= { "title":ykey,
            "showline": true,
            "linecolor": '#3C3C3C',
            "linewidth": 2,
            "gridcolor" : '#3C3C3C',
            "range": mrange };
    tmpz= { "title":zkey,
            "showline": true,
            "linecolor": '#3C3C3C',
            "linewidth": 2,
            "gridcolor" : '#3C3C3C',
             "range": mrange };
    } else {
      tmpx= { "title":xkey };
      tmpy= { "title":ykey };
      tmpz= { "title":zkey };
  }
  var annotation_val=[];
  var p= {
      width: width,
      height: height,
      paper_bgcolor:"rgb(0,0,0)",
      plot_bgcolor:"rgb(0,0,0)",
      showlegend: false,
      hovermode: 'closest',
      annotations: [],
      margin: {
        l: 5,
        r: 5,
        b: 5,
        t: 30,
        pad:10 }
     };

   for(var setidx=0; setidx < sets; setidx++) {
      var first=setidx*2;
      var second=(setidx*2)+1;
      var title1=titlelist[first];
      var title2=titlelist[second];
      var scene1=scenelist[first];
      var scene2=scenelist[second];
      var tmp=makeALayoutSet(tmpx,tmpy,tmpz,_aspectratio,title1, title2, scene1, scene2, setidx, sets);
      var anno=tmp[0];
      var s1_v=tmp[1];
      var s2_v=tmp[2];
      p['annotations']=p['annotations'].concat(anno);
      p[scene2]=s2_v;
      p[scene1]=s1_v;
   }
//window.console.log(p);
  return p;
}

/************ZOOM**********************************/
function setupZoom(plot,scenelist) {
  plot.on('plotly_relayout',
    function(eventdata){  

        if(inZoom) { // no need relay down
          return; 
          } else {  // need to sync
            inZoom=true;
            var cnt=scenelist.length;
            var _tmp;
            var _tmpidx;
            for(var sidx=0; sidx <cnt; sidx++) {
              var scene=scenelist[sidx];
              if(scene in eventdata) {
                 _tmp=eventdata[scene];
                 _tmpidx=sidx;
                 break;
              }
            }
            for(var sidx=0; sidx <cnt; sidx++) {
              if(sidx == _tmpidx)
                continue;
              var scene=scenelist[sidx];
              zoomIn(plot,scene,_tmp.eye);
            }
            inZoom=false;
        }
    });
}

function zoomIn(plot,id, eye) {
  var scene = plot._fullLayout[id]._scene;
  var camera = scene.getCamera();
  var _x=eye.x;
  var _y=eye.y;
  var _z=eye.z;
  var _eye={x:_x, y:_y, z:_z };
  camera.eye=_eye;
  scene.setCamera(camera); // this causes relayout event
//  Plotly.relayout(plot, camera);
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
