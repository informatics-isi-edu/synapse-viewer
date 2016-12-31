//
// synapse-viewer
//

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

function rangeOfScatter(oldPlot) {
    var oldDiv=oldPlot;
    var a=oldDiv.layout.xaxis.range;
    var b=oldDiv.layout.yaxis.range;
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

function addThreeD_one(title, data, keyX,keyY,keyZ, color) {
  var _one= getScatter3DAt_one(title, data, keyX, keyY, keyZ, color);
  var _data= [ _one ];
  var tmp=_data[0]['x'];
  var _max=Math.max.apply(Math,tmp);
  var _min=Math.min.apply(Math,tmp);
  var xrange=[_min,_max];
  tmp=_data[0]['y'];
  _max=Math.max.apply(Math,tmp);
  _min=Math.min.apply(Math,tmp);
  var yrange=[_min,_max];
  tmp=_data[0]['z'];
  _max=Math.max.apply(Math,tmp);
  _min=Math.min.apply(Math,tmp);
  var zrange=[_min,_max];

  var _layout=getScatter3DDefaultLayout(trimKey(keyX),trimKey(keyY),trimKey(keyZ),xrange,yrange,zrange);
  saveScatter3DPlot=addAPlot('#myViewer',_data, _layout, 800,800);
}

function getScatter3DAt_one(title,data,xkey, ykey, zkey, mcolor) {
  var x=getOriginalDataByKey(data,xkey);
  var y=getOriginalDataByKey(data,ykey);
  var z=getOriginalDataByKey(data,zkey);
  var data= {  "name": title,
               "x": x,
               "y": y,
               "z": z,
               "mode": "markers",
               "marker": {
                   "color": mcolor,
                   "size": 4,
                   "line": {"color": "black", "width": 1},
                   "opacity": 0.7
               },
               "type":"scatter3d" };
  return data;
}

function getScatter3DDefaultLayout(xkey,ykey,zkey,xrange,yrange,zrange){
  var tmpx, tmpy, tmpz;
  if(xrange && yrange && zrange) {
    tmpx= { "title":xkey, 
//'#636363',
            "showline": true,
            "linecolor": 'black',
            "linewidth": 6,
            "range": xrange };
    tmpy= { "title":ykey,
            "showline": true,
            "linecolor": 'black',
            "linewidth": 6,
            "range": yrange };
    tmpz= { "title":zkey,
            "showline": true,
            "linecolor": 'black',
            "linewidth": 6,
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

function addThreeD(namelist, datalist, keyX,keyY,keyZ, colorlist) {
  var _data=[];
  for( var i=0; i<datalist.length; i++) {
     var tmp=getScatter3DAt_one(namelist[i], datalist[i], keyX, keyY, keyZ, colorlist[i]);
     _data.push(tmp);
  }

  var _layout=getScatter3DDefaultLayout(trimKey(keyX),trimKey(keyY),trimKey(keyZ),
              saveRangeX, saveRangeY, saveRangeZ);
  saveScatter3DPlot=addAPlot('#myViewer',_data, _layout, 800,800);
}
