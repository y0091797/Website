/* Script for Portfolio-Section - switch between active tab*/

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

/* Script for Navigation Bar Re*/

var sidemenu = document.getElementById("sidemenu");
function openmenu(){
    sidemenu.style.top = "0";
}

function closemenu(){
    sidemenu.style.top = "-100%";
}

/* Script for Text About Me*/

var atext = document.getElementById("abouttext");
var abtn = document.getElementById("aboutbtn");

/*abtn.addEventListener("click", function(){
    atext.style.display = "block";
});*/

abtn.onclick = (function() {
    var table = atext;
    return function() {
        buttonToggle(this, table, 'View', 'Hide');
    };
}());

function buttonToggle(where,pval,nval) {
    var display =  where.value === nval ? 'none' : 'block';
    atext.style.display = display;
    atext.style.top = 0;
    where.value = (where.value == pval) ? nval : pval;
}

/* Script for Video to start at specific time */

var video = document.getElementById('vid');

video.addEventListener('loadedmetadata', function() {
    this.currentTime = 1;
}, false);


