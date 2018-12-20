/*Sliders*/
var onContinue = true ;
var slideImgTimeout;
var currdeg=0;
function slide(side){	
	if (side=='right') {
		currdeg = currdeg - 72;			
	}else currdeg = currdeg + 72;
	$('#sliders').css({
    "transform": "rotateY("+currdeg+"deg)"
	})
}
function slideImg(delay){
	clearTimeout(slideImgTimeout);	
    slideImgTimeout=setTimeout(function(){		
		if(onContinue){slideImg(delay);}
		else return		
		slide('right');		
	},delay);
}
function toggleButton(play){
	var icon=(play=='play') ? '.fa-pause' : '.fa-play';
	$('.fa-play').css('display','none');
	$('.fa-pause').css('display','none');
	$(icon).css('display','inline');
}
$('.fa-angle-double-right').on("click",function(){	
	slide('right');
	slideImg(5000);	
});
$('.fa-angle-double-left').on("click",function(){	
	slide('left');
	slideImg(5000);	
});
$('.fa-pause').on('click',function(){
	onContinue=false;
	toggleButton('pause');
	
});
$('.fa-play').on('click',function(){
	onContinue=true;
	toggleButton('play');		
	slideImg(5000);	
});
$("#sliders img").on('click',function(e){
	if    (((currdeg%360==0)&&(e.target.id=='sliders5'))
		||(((currdeg%360==72) ||(currdeg%360==-288))&&(e.target.id=='sliders4'))
		||(((currdeg%360==144)||(currdeg%360==-216))&&(e.target.id=='sliders3'))
		||(((currdeg%360==216)||(currdeg%360==-144))&&(e.target.id=='sliders2'))
		||(((currdeg%360==288)||(currdeg%360==-72)) &&(e.target.id=='sliders1'))){
		slide('left');
		slideImg(5000);	
	}else if (((currdeg%360==0)&&(e.target.id=='sliders2'))
		||(((currdeg%360==72) ||(currdeg%360==-288))&&(e.target.id=='sliders1'))
		||(((currdeg%360==144)||(currdeg%360==-216))&&(e.target.id=='sliders5'))
		||(((currdeg%360==216)||(currdeg%360==-144))&&(e.target.id=='sliders4'))
		||(((currdeg%360==288)||(currdeg%360==-72))&&(e.target.id=='sliders3'))) {
		slide('right');
		slideImg(5000);	
	}	 		
});
/*CANVAS*/
var canvas=$("#signature");
var ctx=canvas[0].getContext('2d');
ctx.lineJoin = "round";
	
canvas.on('mousedown',pointerDown);  
canvas.on("mouseup", pointerUp);
function pointerDown(e) {
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    canvas.on("mousemove", paint);
}
 
function pointerUp(e) {
    canvas.off("mousemove", paint);
    
}
 
function paint(e) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}
function clearCanvas(){
	ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
}
function isCanvasBlank(canvas) {
    var blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;

    return canvas.toDataURL() == blank.toDataURL();
}
slideImg(5000);
/*Menu mobile*/
$('.fas.fa-align-justify').on('hover',function(){
	$('#mobileMenu').css('display','flex');
})