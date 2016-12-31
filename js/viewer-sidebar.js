// plots sidebar js

var plots_sidebar=false;

// or could initiate a 'click' on
// the plotsButton
function dissmissPlots() {
  plotsClick();
}

function plotsClick() {
  plots_sidebar = !plots_sidebar;
  if(plots_sidebar) {
    sidebar_plots_slideOut();
//setTrackingPropertyList();
    //hide button
    var btn = document.getElementById('plots-button');
    btn.style.opacity = 0;
    } else {
      sidebar_plots_slideIn();
//savePropertyList();
      var btn = document.getElementById('plots-button');
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
