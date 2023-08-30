/* Script for Portfolio-Section */

var tablinks = document.getElementsByClassName("tab-links");
var tabcontents = document.getElementsByClassName("tab-contents");

function opentab(tabname){
    for(link of tablinks){
        link.classList.remove("active-link");
    }
    for(content of tabcontents){
        content.classList.remove("active-tab");
    }
    event.currentTarget.classList.add("active-link");
    document.getElementById(tabname).classList.add("active-tab");
}

/* Script for Sidemenu */

var sidemenu = document.getElementById("sidemenu");
function openmenu(){
    sidemenu.style.top = "0";
}

function closemenu(){
    sidemenu.style.top = "-100%";
}