;(function($){
	"use strict"
	
	var Slider = function(node,options){
		
		this.sliderWrap = $(node);
		this.childs = this.sliderWrap.children();
		this.childsNum = this.childs.length;
		
		//只有一个子元素 返回
		if(this.childsNum <= 1) return false;
		
		this.sliderHeight = this.sliderWrap.parent().height();
		this.sliderWidth = this.sliderWrap.parent().width();
		
		var defaultOptions = {
			horizontal: true,	//水平滑动(默认)
			vertical: false,	//垂直滑动
			autoslide: false,	//自动模式
			interval: 5000, 	//自动滑动时间间隔,
			loop: false,		//循环滑动
			animationDelay: 300,//缓动时间
			animationTiming: 'ease-out',	//缓动函数
			controler: null, 	//控制器
			controlerAction: false
		};
		var _this = this;
		
		this.opts = $.extend(defaultOptions, options);
		if(this.opts.autoslide) this.opts.loop = true;
		
		this.activeOrder = 1;
		this.activeChild = this.childs.eq(0);
		this.activeChild.addClass('current');
		if(this.opts.controler) this.opts.controler.children().eq(0).addClass('current');
		
		this.ortFix = this.opts.vertical ? 'translateY' : 'translateX';
		this.valueUnit = this.opts.vertical ? this.sliderHeight : this.sliderWidth;
		this.offset = 0;

		this.sliderWrap[0].style.webkitTransition ='-webkit-transform ' + this.opts.animationDelay +'ms '+ this.opts.animationTiming;
		this.sliderWrap[0].style[this.opts.vertical ? 'height' : 'width'] = this.valueUnit * this.childsNum + 'px';

		this.sliderWrap.bind('touchmove', function(e){
			e.preventDefault();
		})
		
		//绑定touch事件
		this.initTouchEvent();
		
		//自动滑动
		this.slideInterval;
		if(this.opts.autoslide){
			this.autoNext();
		}
		
		//绑定控制器
		var controler = this.opts.controler;
		if(controler){
			controler.children().each(function(index){
				$(this).bind('tap click',function(){
					clearInterval(_this.slideInterval);
					_this.setActive(index + 1);
					_this.autoNext();
				})
			})
		}
		
	}
	
	Slider.prototype ={
		constructor: Slider,
		initTouchEvent: function(){
			
			var doNextEvent = this.opts.vertical ? 'swipeUp' : 'swipeLeft',
				doPrevEvent = this.opts.vertical ? 'swipeDown' : 'swipeRight';
			
			var _this = this;
			this.sliderWrap
				.bind(doNextEvent, function(){
					_this.slideNext()
				})
				.bind(doPrevEvent, function(){
					_this.slidePrev()
				});
			
			//touchmove移动效果 
			var startX,
				startY,
				curX,
				curY;
			
			this.sliderWrap
				.bind("touchstart",function(e){
					startX=e.targetTouches[0].pageX;
					startY=e.targetTouches[0].pageY;
					_this.opts.autoslide &&  clearInterval(_this.slideInterval);
				})
				.bind("touchmove", touchMove)
				.bind("touchend", function(){
					startX=0;
					startY=0;
					_this.opts.autoslide && _this.autoNext();
				})

			function touchMove(event) {
			    var touch=event.targetTouches[0];
			    curX = touch.pageX - startX;
			    curY = touch.pageY - startY;
			    
			    //在水平模式时上下滑动或在垂直模式时左右滑动，复位
			    if((_this.opts.vertical && Math.abs(curY) < Math.abs(curX)) || (_this.opts.horizontal && Math.abs(curX) < Math.abs(curY))){
			    	_this.sliderWrap[0].style.webkitTransform = _this.ortFix + '('+ _this.offset +'px)';
			    	return false;
			    };
			    
			    var curOffset = _this.opts.vertical ? curY : curX;
			    
			    //在末页或首页时
			    if(_this.activeOrder === _this.childsNum && curOffset < 0){
			    	curOffset = -20;
			    };
			    if(_this.activeOrder === 1 && curOffset > 0){
			    	curOffset = 20;
			    }

			    var offsetVal = _this.offset + curOffset;
			   	_this.sliderWrap[0].style.webkitTransform = _this.ortFix + '('+ offsetVal + 'px)';
			}

		},
		slideNext: function(){
			//当前为末页时
			if(this.activeOrder + 1 > this.childsNum){
				//自动模式时
				if(this.opts.loop){
					this.slideToFirst();
				} else{
					this.sliderWrap[0].style.webkitTransform = this.ortFix + '('+ this.offset +'px)';
				}
				return false
			}
			
			this.setActive(this.activeOrder + 1);

		},
		slidePrev: function(){
			//当前为首页时
			if(this.activeOrder === 1){
				//自动模式时
				if(this.opts.loop){
					this.slideToLast();
				} else{
					this.sliderWrap[0].style.webkitTransform = this.ortFix + '('+ this.offset +'px)';
				}
				return false
			}
			
			this.setActive(this.activeOrder - 1);
		},
		setActive: function(order){
			//删除上一个当前元素样式
			this.activeChild.removeClass('current');
			
			//设定当前元素
			var activeOrder = order;
			
			var offsetVal = - (this.valueUnit * (order - 1));
			this.offset = offsetVal;
			this.sliderWrap[0].style.webkitTransform = this.ortFix + '('+ offsetVal +'px)';
			
			this.activeOrder = activeOrder;
			this.activeChild = this.childs.eq(activeOrder - 1);
			this.activeChild.addClass('current');
			
			this.setControler(activeOrder);
		},
		autoNext: function(){
			var _this = this;
			this.slideInterval = setInterval(function(){
				_this.slideNext()
			}, this.opts.interval)
		},
		slideToFirst: function(){
			//删除上一个当前元素样式
			this.activeChild.removeClass('current');
			
			this.offset = 0;
			this.activeOrder =1;
			this.activeChild = this.childs.eq(0);
			this.activeChild.addClass('current');
			this.sliderWrap[0].style.webkitTransform = this.ortFix + '('+ 0 +'px)';
			
			this.setControler(1);
		},
		slideToLast: function(){
			//删除上一个当前元素样式
			this.activeChild.removeClass('current');
			
			this.offset = (this.childsNum - 1) * this.valueUnit * -1;
			this.activeOrder =this.childsNum;
			this.activeChild = this.childs.eq(this.childsNum - 1);
			this.activeChild.addClass('current');
			this.sliderWrap[0].style.webkitTransform = this.ortFix + '('+ this.offset +'px)';
			
			this.setControler(this.childsNum);
		},
		setControler: function(order){
			var controler = this.opts.controler;
			if(controler){
				controler.find('.current').removeClass('current');
				controler.children().eq(order - 1).addClass('current');
			}
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

})(Zepto)
