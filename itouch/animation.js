animationPanel=function(fromPage,toPage, animation, goingBack){
	// Error check for target page
    if (toPage === undefined || toPage.length === 0) {
        throw('Target element is missing.');
        return false;
    }

    // Error check for fromPage===toPage
    if (toPage.hasClass('current')) {        
    	throw('You are already on the page you are trying to navigate to.');
        return false;
    }
    
    var finalAnimationName=animation;
    if (goingBack) {
    	finalAnimationName = finalAnimationName.replace(/left|right|up|down|in|out/, reverseAnimation );
    }

    fromPage.addClass(finalAnimationName + ' out');
    toPage.addClass(finalAnimationName + ' in current');
       
    setTimeout(function(){
    	fromPage.removeClass("current out "+finalAnimationName);
    	toPage.removeClass("in "+finalAnimationName);
    },410)
}

function reverseAnimation(animation) {
    var opposites={
        'up' : 'down',
        'down' : 'up',
        'left' : 'right',
        'right' : 'left',
        'in' : 'out',
        'out' : 'in'
    };

    return opposites[animation] || animation;
}

//检测浏览器是否支持transform3D
$(function(){
	if('webkitPerspective' in document.body.style){
		$("#content").addClass("supports3d");
	}	
})

//support animation
//cubeleft、cuberight、dissolve、fade、flipleft、flipright、pop、swap、swapleft、slideup、slidedown、slideleft、slideright
