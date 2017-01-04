//
// synapse-viewer
//
var savePlot=[];

function addAPlot(divname, data, layout, w, h) {
  var d3 = Plotly.d3;
  var gd3 = d3.select(divname)
    .append('div')
    .style({
        width: w,
        height: h,
        visibility: 'inherit'
    });

  var gd = gd3.node();
  Plotly.newPlot(gd, data, layout);
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
// of all the data files
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

function addThreeD_one(title, data, keyX,keyY,keyZ, color) {
  var _one= getScatter3DAt_set(title, data, keyX, keyY, keyZ, color);
  var ranges=getMinMaxOfPlotlyData(_one);
  var _data= [ _one ];

  var _layout=getScatter3DDefaultLayout(trimKey(keyX),trimKey(keyY),trimKey(keyZ),
     ranges[0],ranges[1], ranges[2]);
  var plot=addAPlot(scatterDivname,_data, _layout, 800,800);
  savePlot.push(plot);
  return plot;
}

function getScatter3DAt_set(title,data,xkey, ykey, zkey, mcolor) {
  var x=getOriginalDataByKey(data,xkey);
  var y=getOriginalDataByKey(data,ykey);
  var z=getOriginalDataByKey(data,zkey);
   var data= { name: title,
               x: x,
               y: y,
               z: z,
               mode: "markers",
               marker: {
                   color: mcolor,
                   size: 4,
                   line: {color: "black", width: 1},
                   opacity: 1 
               },
               type:"scatter3d" };
   return data;
}

// combine all the data into a single trace before drawing it
function getScatter3DAt_heat(title,datalist,xkey, ykey, zkey, heatkey) {
  var cnt=datalist.length;
  var d;
  var x=[];
  var y=[];
  var z=[];
  var mcolor=[];
  for(var i=0; i< cnt; i++) {
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

  var cmax=Math.max.apply(Math,mcolor);
  var cmin=Math.min.apply(Math,mcolor);
  var data= {  x: x,
               y: y,
               z: z,
               mode: "markers",
               marker: {
                   color: mcolor,
                   size: 4,
                   line: {color: "black", width: 1},
                   colorscale: 'Viridis',
//                   colorscale: 'Rainbow',
                   cmax:cmax,
                   cmin:cmin,
                   colorbar: {
                          title:heatkey
                             },
                   opacity: 1 
               },
               type:"scatter3d" };
   return data;
}

function getScatter3DDefaultLayout(xkey,ykey,zkey,xrange,yrange,zrange){
  var tmpx, tmpy, tmpz;
  if(xrange && yrange && zrange) {
    tmpx= { "title":xkey, 
//'#636363',
            "showline": true,
            "linecolor": 'black',
            "linewidth": 4,
            "range": xrange };
    tmpy= { "title":ykey,
            "showline": true,
            "linecolor": 'black',
            "linewidth": 4,
            "range": yrange };
    tmpz= { "title":zkey,
            "showline": true,
            "linecolor": 'black',
            "linewidth": 4,
             "range": zrange };
    } else {
      tmpx= { "title":xkey };
      tmpy= { "title":ykey };
      tmpz= { "title":zkey };
  }
  var p= {
      width: 800,
      height: 700,
      autosize: false,
      paper_bgcolor: '#eaeaea',
      showlegend: false,
      hovermode: 'closest',
      scene: {
        xaxis: tmpx,
        yaxis: tmpy,
        zaxis: tmpz
      }
      };
//window.console.log(p);
  return p;
}

function addThreeD(plot_idx,namelist, datalist, keyX,keyY,keyZ, colorlist) {
  var _data=[];
  var cnt=datalist.length;
// special case..
  if(useHeat(plot_idx)) {
    var tmp=getScatter3DAt_heat(namelist, datalist, keyX, keyY, keyZ, 'raw core');
    _data.push(tmp);
    } else {
    for( var i=0; i<cnt; i++) {
       var tmp=getScatter3DAt_set(namelist[i], datalist[i], keyX, keyY, keyZ, colorlist[i]);
       _data.push(tmp);
    }
  }

  var _layout=getScatter3DDefaultLayout(trimKey(keyX),trimKey(keyY),trimKey(keyZ),
              saveRangeX, saveRangeY, saveRangeZ);
  var plot=addAPlot(scatterDivname,_data, _layout, 800,800);
  savePlot.push(plot);
  return plot;
}

// on/off via updating  opacity
function offTrace(plot_idx,data_idx) {
//  var update = { shapes : [ _s ] };
//  Plotly.relayout(aPlot,update);
//    oldDiv.layout.shapes[0].line.width=0;
//    oldDiv.layout.shapes[1].line.width=0;
//    Plotly.redraw(oldDiv);

   var plot=savePlot[plot_idx];
   var target=plot.data;
   var popacity=target[data_idx].marker.opacity;
   var pcolor=target[data_idx].marker.color;
window.console.log(">>",popacity);
window.console.log(">>",pcolor);
window.console.log(">>", plot_idx);
window.console.log(">>", data_idx);
   savePlot[plot_idx].data[data_idx].marker.opacity=0;
   Plotly.redraw(savePlot[plot_idx]);

/*
plot_ly(df,
        type="bar",
        x=x,
        y=y,
        opacity=opacity,
        color=as.factor(x)
)
   Plotly.update(XXX);
*/

}

function addSubplots(plot_idx,namelist, datalist, keyX,keyY,keyZ, colorlist) {
  var _data=[];
  var cnt=datalist.length;
  for( var i=0; i<cnt; i++) {
     var slabel="scene"+i;
     var tmp=getScatter3DAt_subplot(namelist[i], datalist[i], keyX, keyY, keyZ, colorlist[i], slabel);
     _data.push(tmp);
  }

  var _layout=getScatter3DDefaultLayout(trimKey(keyX),trimKey(keyY),trimKey(keyZ),
              saveRangeX, saveRangeY, saveRangeZ);
  var plot=addAPlot(subplotsDivname,_data, _layout, 800,800);
  savePlot.push(plot);
  return plot;
}


function getScatter3DAt_subplots(title,data,xkey, ykey, zkey, mcolor, slabel) {
  var x=getOriginalDataByKey(data,xkey);
  var y=getOriginalDataByKey(data,ykey);
  var z=getOriginalDataByKey(data,zkey);
   var data= { name: title,
               x: x,
               y: y,
               z: z,
               scene: slabel,
               mode: "markers",
               marker: {
                   color: mcolor,
                   size: 4,
                   line: {color: "black", width: 1},
                   opacity: 1 
               },
               type:"scatter3d" };
   return data;
}
