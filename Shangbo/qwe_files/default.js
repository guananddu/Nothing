function warning(obj, msg) {
obj.style.display = '';
obj.innerHTML = '<img src="images/check_error.gif" width="13" height="13"> &nbsp; ' + msg;
obj.className = "warning";
}

function warningOK(obj) {
obj.style.display = '';
obj.innerHTML = '<img src="images/check_right.gif" width="13" height="13"> &nbsp; ';
obj.className = "warning";
}


//信息提示
function promptMsg(msg)
{
	$.prompt("<div id='promptMsg_t' style='text-align:center'>"+msg+"</div>",{buttons:{},prefix:"SMES_tip"});
	}
	

function closePrompt(second)
	{
		setTimeout("$.prompt.close()",second);
		
		}
		
		
//获取图片大小的方法，在ie下偶尔有问题
  var getSizeImg = function(src)
        {
            /*var timg = $('<img>').attr('src', src).css({ position: 'absolute', top: '-1000px', left: '-1000px' }).appendTo('body');
            var size = [timg.get(0).offsetWidth, timg.get(0).offsetHeight];

            try { document.body.removeChild(timg[0]); }
            catch (e) { };*/
            
            var temp=new Image();
            temp.src=src;
            var size = [temp.width,temp.height];

            return size;
        };


$(document).ready(function()
{
 $('.avatar48').each(function()
   {

$(this).qtip({
 content: '<a href="mySpace.aspx?uid='+this.id+'" target="_blank">&#x67E5;&#x770B;&#x4E3B;&#x9875;</a> | <a href="ShortMessageAdd.aspx?toid='+this.id+'" target="_blank">&#x53D1;&#x9001;&#x77ED;&#x6D88;&#x606F;</a>', // Give it some content
         position: 'bottomMiddle', // Set its position
         hide: {
            fixed: true // Make it fixed so it can be hovered over
         },
         style: {
            padding: '5px 15px', // Give it some extra padding
            name: 'light' // And style it with the preset dark theme
         }
});

});
});






function changeCityOk(t)
{
    $("#currentCityId").html(t.id);
}

function changeCityOver(t)
{
if(t==0)
{
location.href="ChangeCity.aspx?set=0&cityid="+$("#currentCityId").html();
}
else
{
location.href="ChangeCity.aspx?set=1&cityid="+$("#currentCityId").html();
}
}



function UrlEncode(str){
   var ret="";
   var strSpecial="!\"#$%&'()*+,/:;<=>?[]^`{|}~%";
   for(var i=0;i<str.length;i++){
   var chr = str.charAt(i);
     var c=str2asc(chr);
     if(parseInt("0x"+c) > 0x7f){
       ret+="%"+c.slice(0,2)+"%"+c.slice(-2);
     }else{
       if(chr==" ")
         ret+="+";
       else if(strSpecial.indexOf(chr)!=-1)
         ret+="%"+c.toString(16);
       else
         ret+=chr;
     }
   }
   return ret;
}

    function OpenPage(str)
    {
    window.open(str);
    }
    
//Slide to any anchor
	$(document).ready(function() {
	$("a.anchorLink").anchorAnimate()
	});
	
	jQuery.fn.anchorAnimate = function(settings) {
	
		settings = jQuery.extend({
			speed : 1100
		}, settings);	
		
		return this.each(function(){
			var caller = this
			$(caller).click(function (event) {	
				event.preventDefault()
				var locationHref = window.location.href
				var elementClick = $(caller).attr("href")
				
				var destination = $(elementClick).offset().top;
				$("html:not(:animated),body:not(:animated)").animate({ scrollTop: destination}, settings.speed, function() {
					window.location.hash = elementClick
				});
				return false;
			})
		})
}


//价格帮助提示
function flashproduce_price_help() {
    $.jBox("<div style=\"padding:5px\"><b>90天</b>适用范围:<br/><b>在线请柬</b> 朋友收到请柬后在定购之日起90天内可观看，超过90天会有过期提示，制作者本人直接登陆后可永久观看；<br/><b>离线文件请柬</b>一旦生成成功，即永久保存，没有有效期，但必须在定购之日起90天内进行生成操作，过期后需续期再进行操作<br/><span class=\"red\">注：本站所有请柬均可生成在线和离线两种格式请柬，且可自定义送呈姓名并且不限生成数量</span></div>", { title: "帮助提示" });
}