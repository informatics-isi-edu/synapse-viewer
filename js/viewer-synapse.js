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
          default: { 
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

/*
var sample = './data/sample.csv';
fs.readFile(sample, 'UTF-8', function(err, csv) {
  $.csv.toArrays(csv, {}, function(err, data) {
    for(var i=0, len=data.length; i<len; i++) {
      console.log(data[i]);
    }
  });
});
*/

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
        initPlot_data.push(data);
     
      });
      var fstub=chopForStub(url);
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
