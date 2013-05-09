
lastScrollY=0;
function heartBeat(){
var diffY;
if (document.documentElement && document.documentElement.scrollTop)
diffY = document.documentElement.scrollTop;
else if (document.body)
diffY = document.body.scrollTop
else
{/*Netscape stuff*/}
percent=.1*(diffY-lastScrollY);
if(percent>0)percent=Math.ceil(percent);
else percent=Math.floor(percent);
document.getElementById("full").style.top=parseInt(document.getElementById("full").style.top)+percent+"px";
lastScrollY=lastScrollY+percent;
/*if(diffY == 0){document.getElementById("full").style.display = "none"}
else{document.getElementById("full").style.display = "block"}
}*/
if(diffY > 500){document.getElementById("full").style.display = "block"}
else{
	document.getElementById("full").style.display = "none"}
}

suspendcode="<div id=\"full\" style='display:none; width:15px; height:57px; POSITION:absolute;right:2px; top:460px; margin-left:200px;  z-index:100; text-align:center;'><a href=\"#hearder_a\" class=\"anchorLink\"><img src='/images/btn_top.gif' border=0 /></a></div>"
document.write(suspendcode);
window.setInterval("heartBeat()",1);



function switchImage(imageId, imageUrl, linkId, linkUrl, preview, title, alt) {
	if(imageId && imageUrl) {
		var image = $(imageId);
		image.src = imageUrl;

		if(title) {
			image.title = title;
		}
		if(alt) {
			image.alt = alt;
		}
	}

	if(linkId && linkUrl) {
		var link = $(linkId);
		link.href = linkUrl;
	}
}

//Tabs
function setTab(name,cursel,n){
for(i=1;i<=n;i++){
var menu=document.getElementById(name+i);
var con=document.getElementById("con"+name+i);
menu.className=i==cursel?"current":"";
con.style.display=i==cursel?"block":"none";
}
}