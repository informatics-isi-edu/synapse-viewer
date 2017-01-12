//
// synapse-viewer
//
// This is very dataset specific information
// for, USC

var initPlot_core=[],
    initPlot_vicinity=[],
    initPlot_zerolvl=[],
    initPlot_toplvl=[], 
    initPlot_transp=[];

// these are per data file
var initStepX=[];  //
var initStepY=[];  //
var initStepZ=[];  //
var initSize=[];    // size of the marker
var initOpacity=[]; // opacity of the marker
var initAlias=[];   // alias for each dataset to be used as label
var initColor=[];   //initial color
var initTitle=[];   // title to be used for subplots/or main scatter plot
var initHeatOn=[];  // column to be used to create heat scale ('raw core') 
var myColor=[];  // color to be used - merged from initColor&defaultColor

var  saveRangeX;
var  saveRangeY;
var  saveRangeZ;

// http://localhost/synapse/view.html?
//     url=http://localhost/data/synapse/segments-dummy.csv
//     &url=http://localhost/data/synapse/segments2.csv
// http://localhost/synapse/view.html?http://localhost/data/synapse/segments-dummy.csv
// not sure if this is per file or per experiment
//parameters,"(core, vicinity, zerolvl, toplvl,transp):", 
//390.77695513916035, 890.06885742187546, 150.10100000000006, 10721.5, 0.8

//new parameters (per url file)
// (microns-per-pixel/microns-per-step), 
// stepX=0.26, stepY=0.26, stepZ=0.4
// size=3, 
//   example value really does mean 0.4 micron steps in Z (400
//   nanometer) and 0.26 micron steps in X and Y (260 nanometer).
// also, alias  to supplement the filestub as trace-name
function processArgs(args) {
  var urls=[];
  var params = args[1].split('&');
  for (var i=0; i < params.length; i++) {
    var param = unescape(params[i]);
    if (param.indexOf('=') == -1) {
      var tmp=param.replace(new RegExp('/$'),'').trim();
      urls.push(tmp);
      } else {
        var kvp = param.split('=');
        switch (kvp[0].trim()) {
          case 'url':
            {
             var tmp=kvp[1].replace(new RegExp('/$'),'').trim();
             urls.push(tmp);
//window.console.log("found..",tmp);
             break;
             }
          case 'core':
             {
             var t=parseFloat(kvp[1]);
             if(!isNaN(t))
               initPlot_core.push(t);
             break;
             }
          case 'vicinity':
             {
             var t=parseFloat(kvp[1]);
             if(!isNaN(t))
               initPlot_vicinity.push(t);
             break;
             }
          case 'zerolvl':
             {
             var t=parseFloat(kvp[1]);
             if(!isNaN(t))
               initPlot_zerolvl.push(t);
             break;
             }
          case 'toplvl':
             {
             var t=parseFloat(kvp[1]);
             if(!isNaN(t))
               initPlot_toplvl.push(t);
             break;
             }
          case 'transp': 
             {
             var t=parseFloat(kvp[1]);
             if(!isNaN(t))
               initPlot_transp.push(t);
             break;
             }
          case 'stepX': 
             {
             var t=parseFloat(kvp[1]);
             if(!isNaN(t))
               initStepX.push(t);
             break;
             }
          case 'stepY': 
             {
             var t=parseFloat(kvp[1]);
             if(!isNaN(t))
               initStepY.push(t);
             break;
             }
          case 'stepZ': 
             {
             var t=parseFloat(kvp[1]);
             if(!isNaN(t))
               initStepZ.push(t);
             break;
             }
          case 'size': 
             {
             var t=parseInt(kvp[1]);
             if(!isNaN(t))
               initSize.push(t);
             break;
             }
          case 'opacity': 
             {
             var t=parseFloat(kvp[1]);
             if(!isNaN(t))
               initOpacity.push(t);
             break;
             }
          case 'alias': 
             {
             var t=trimQ(kvp[1]);
             initAlias.push(t);
             break;
             }
          case 'color': 
             {
             var t=trimQ(kvp[1]);
             initColor.push(t);
             break;
             }
          case 'title': 
             {
             var t=trimQ(kvp[1]);
             initTitle.push(t);
             break;
             }
          case 'heat': 
             {
             var t=trimQ(kvp[1]);
             initHeatOn.push(t);
             break;
             }
          default: { 
window.console.log("dropping this...",kvp[0].trim());
             /* drop this..*/
             break;
             }
       }
    }
  }
  return urls;
}

// pick up the key term of every item in array  
function getOriginalDataByKey(data,key) {
   var alist=data.map(function(k) { return k[key]; } );
   return alist;
}

// holding an option to alter the key
function trimKey(key) {
   return key;
}

function trimQ(alias) {
  var str=alias.trim(); // trim the ' or "
  if( (str[0] == "\"" && str[ str.length-1 ] == "\"")
   || (str[0] == "\'" && str[ str.length-1 ] == "\'"))
  str=str.substr(1,str.length-2);
  return str;
}

// given an array of values, return an array of log values
function logValue(data) {
  var n = data.map(function (v) {
    return (Math.round(Math.log10(v)*10000)/10000);
  });
  return n;
}

// csv
function chopForStub(url){
  var s=url.split('/').pop();
  var ss=s.slice(0, -4);
  return ss;
}

function markerSize(s) {
   if(initSize.length ==0 || initSize.length <= s ) {
     return 4; 
   } else {
     return initSize[s];
   }
}

function useHeatTerm(s) {
   if(initHeatOn.length==0 || initHeatOn.length <= s)
     return 'raw core'; 
   else 
     return initHeatOn[s];
}

function markerOpacity(s) {
   if(initOpacity.length==0 || initOpacity.length <= s)
     return 1; 
   else 
     return initOpacity[s];
}

// mainly for suplots because the threeD plot can only
// use 1 set of Aspects and everyone conforms to it.
function polishAspects(s) {
window.console.log("aspects.. for ",s);
  if(initStepX.length == 0) {
window.console.log("aspects.. using default");
    return [1, 1, 1];
  }

  var t=s;
  if(t >= initStepX.length) {
    t=0;
  }

  var stepX=initStepX[t];
  var stepY=initStepY[t];
  var stepZ=initStepZ[t];

window.console.log("aspects..start",stepX," ", stepY," ", stepZ);
  var min=Math.min.apply(Math,[stepX,stepY,stepZ]);
window.console.log("aspects..",stepX/min," ", stepY/min," ", stepZ/min);
  return [stepX/min, stepY/min, stepZ/min ];
}

function convert2micron(data, s) {
  if(initStepX.length == 0)
    return;
  var t=s;
  // out of range, use the first set
  if( t >= initStepX.length) {
    t=0;
  }
  
  var stepX=initStepX[t];
  var stepY=initStepY[t];
  var stepZ=initStepZ[t];
  for(var i=0; i<data.length; i++) {
    data[i]['X']= data[i]['X'] * stepX;
    data[i]['Y']= data[i]['Y'] * stepY;
    data[i]['Z']= data[i]['Z'] * stepZ;
  }
}

function getMyColor(i) {
  return myColor[i];
}

function loadAndProcessCSVfromFiles(urls) {
  var nlist=[];
  var cnt=urls.length;
  for( var i=0; i < cnt; i++ ) {
      var url=urls[i];
      var csv=ckExist(url);
      $.csv.toObjects(csv, {}, function(err, data) {
//        for(var i=0, len=data.length; i<len; i++) { console.log(data[i]); }
        // check for the first row, which has funny data..
        // X="(core, vincinity, zerolvl, toplvl, transp):"
        // Y="parameters"
        // Z="saved"
        if(data[0]['Z'] == "saved") {
window.console.log("found a comment line..");
          data.splice(0,1);
        }
// convert X,Y,Z to micron world..
        convert2micron(data, i);
        initPlot_data.push(data);
      });
      var color=getDefaultColor(i);
      if(initColor.length > i) {
        color=initColor[i];
      }
      myColor.push(color);
      var fstub=chopForStub(url);
      if(initAlias.length > i) {
        fstub=initAlias[i];
      }
      nlist.push(fstub);
  }

  var mm=getMinMax(initPlot_data);
  saveRangeX=mm[0];
  saveRangeY=mm[1];
  saveRangeZ=mm[2];
  return nlist;
}



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
}
