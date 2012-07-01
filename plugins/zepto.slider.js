;(function($){
	"use strict";
	
	var Slider = function(node,options){
		//horizontal vertical
		//autoslip
		//interval
		this.sliderWrap = $(node);
		this.childs = this.sliderWrap.children();
		this.childsNum = this.childs.length;
		
		//只有一个子元素 返回
		if(this.childsNum <= 1) return false;
		
		this.sliderHeight = this.sliderWrap.parent().height();
		this.sliderWidth = this.sliderWrap.parent().width();
		
		var defaultOptions = {
			vertical: true,		//水平滑动
			horizontal: false,	//垂直滑动
			autoslide: false,	//自动模式
			interval: null, 	//自动滑动时间间隔,
			animationDelay: 300,//缓动时间
			animationTiming: 'ease-out'
		}
		
		this.opts = $.extend(defaultOptions, options);
		
		this.activeOrder = 1;
		this.activeChild = this.childs.eq(0);
		this.activeChild.addClass('current');
		
		this.ortFix = this.opts.horizontal ? 'translateY' : 'translateX';
		this.valueUnit = this.opts.horizontal ? this.sliderHeight : this.sliderWidth;
		this.offset = 0;

		this.sliderWrap[0].style.webkitTransition ='-webkit-transform ' + this.opts.animationDelay +'ms '+ this.opts.animationTiming;
		this.sliderWrap[0].style[this.opts.horizontal ? 'height' : 'width'] = this.valueUnit * this.childsNum + 'px';

		this.init();
		
		this.sliderWrap.bind('touchmove', function(e){
			e.preventDefault();
		})

	}
	
	Slider.prototype ={
		constructor: Slider,
		init: function(){
			
			var doNextEvent = this.opts.horizontal ? 'swipeUp' : 'swipeLeft',
				doPrevEvent = this.opts.horizontal ? 'swipeDown' : 'swipeRight';
			
			var that = this;
			this.sliderWrap
				.bind(doNextEvent, function(){
					if(that.activeOrder === that.childsNum) return false;
					that.slideNext();
				})
				.bind(doPrevEvent, function(){
					if(that.activeOrder === 1) return false;
					that.slidePrev();
				});
		},
		slideNext: function(){
			
			var value = this.offset + this.valueUnit;
			this.offset = value;
			
			this.sliderWrap[0].style.webkitTransform = this.ortFix + '(-'+ value +'px)';
			this.setActive(1);

		},
		slidePrev: function(){
			var value = this.offset - this.valueUnit;
			this.offset = value;
			
			this.sliderWrap[0].style.webkitTransform = this.ortFix + '(-'+ value +'px)';
			this.setActive(-1);
		},
		setActive: function(order){
			//删除上一个当前元素样式
			this.activeChild.removeClass('current');
			
			//设定当前元素
			var activeOrder = this.activeOrder + order;
			this.activeOrder = activeOrder;
			this.activeChild = this.childs.eq(activeOrder - 1);
			this.activeChild.addClass('current');
		}
	} 
	
	//创建缓存池
	if($.cache === undefined) $.cache={};
	
	$.fn.slider = function(option){
		return this.each(function () {
			  var $this = $(this)
			    , sliderId = $this.data('slider')
			    , data = $.cache[sliderId]
			    
			  if (!data){
			  	var uuid = getuuid();
			  	var data = new Slider(this, option)
			  	$this.data('slider', uuid)
			  	$.cache[uuid] = data;
			  }
			  
			  if (typeof option == 'string'){
			  	data[option]()
			  }
		})
	}
	
	
	
	function getuuid(){
        var S4 = function () {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    };
    
    function setCache(){
    	var cache = $.cache || {}
    }
    
})(Zepto)
