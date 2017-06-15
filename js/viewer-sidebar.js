// plots sidebar js

var plots_sidebar=false;
var using_button=false;

// or could initiate a 'click' on
// the plotsButton
function dissmissPlots() {
  if(using_button)
    plotsClick_btn();
  else plotsClick();
}

function removePlotsClick_btn()
{
window.console.log("IN HERE...");
  var btn = document.getElementById('plots-button');
  if(btn)
    btn.style.opacity =0;
}


function plotsClick_btn() {
  using_button=true;
  plots_sidebar = !plots_sidebar;
   if(plots_sidebar) {
    togglePlotHeat(0,'fire_3Dscatter');
    var btn = document.getElementById('plots-button');
    btn.style.color = 'blue';
    } else {
      togglePlotHeat(0,'fire_3Dscatter');
      var btn = document.getElementById('plots-button');
      btn.style.color = 'grey';
  }
}

// slide in/out 
function plotsClick() {
  plots_sidebar = !plots_sidebar;
  var btn = document.getElementById('plots-button');
  if(plots_sidebar) {
    sidebar_plots_slideOut();
    //hide button
    btn.style.opacity = 0;
    } else {
      sidebar_plots_slideIn();
      btn.style.opacity = 1;
  }
}

function sidebar_plots_slideOut() {
  if (jQuery('#plots').hasClass('menuDisabled')) {
    // if this menu is disabled, don't slide
    return;
  }
  var panelptr=$('#plots');
  var sidebarptr=$('#sidebar');
  panelptr.css("display","");
  sidebarptr.css("display","");
  panelptr.removeClass('fade-out').addClass('fade-in');
}
function sidebar_plots_slideIn() {
  if (jQuery('#plots').hasClass('menuDisabled')) {
    // if this menu is disabled, don't slide
    return;
  }
  var panelptr=$('#plots');
  panelptr.removeClass('fade-in').addClass('fade-out');
  panelptr.css("display","none");
}

function sidebar_plots_slideOut2() {
  if (jQuery('#plots').hasClass('menuDisabled')) {
    // if this menu is disabled, don't slide
    return;
  }

  // make sure it is displaying
  var ctrlElm = document.getElementById('sidebar');
//  ctrlElm.style.opacity = 0;
  ctrlElm.style.display = '';
    
  jQuery('.navigationLi').stop().animate({'marginLeft': '-2px' }, 400);
}

function sidebar_plots_slideIn2() {
  if (jQuery('#plots').hasClass('menuDisabled')) {
    // if this menu is disabled, don't slide
    return;
  }

  var ctrlElm = document.getElementById('sidebar');
  ctrlElm.style.display = '';
    
  jQuery('.navigationLi').stop().animate({ 'marginLeft': '-450px' }, 400);
}
