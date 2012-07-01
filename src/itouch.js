(function(window,$,undefined){
	"use strict"
	
	var iTouchCore=function(options){
		
		var touchSelectors=["[data-role=link],[data-role=back]"],	//data-role类型集合
			indexPanel=options.indexPanel||$("#content > .current")[0],	//首页面
			activePanel=$(indexPanel),	//当前页
			lastPanel=null,	//上一页
			hashMark='!',
			historyStates=[], //历史记录
			defaults = {
				debug: false,
				animation: true,
                defaultAnimation: 'slideleft',
                animationDelay: 400,
                loadingStart: function(){
                	var loadingHTML = '<div class="itouch-loader"><span class="itouch-icon-loading spin"></span></div>';
                	$(loadingHTML).appendTo(document.body);
                },
                loadingEnd: function(){
                	$('.itouch-loader').remove();
                }
			}
		
		var settings = {};
		for(var k in defaults){
			settings[k] = (options[k] !== undefined) ? options[k] : defaults[k]
		}
		//动画后执行时间
		settings.animationDelay += 10;

		//路由集合
		var Router={};
		Router.collection={};
		Router.extend=function(c){
			for(var k in c){
				Router.collection[k]=c[k];
			}
		}
		Router.add=function(route,panel){
			Router.collection[route]=panel;
		}
		
		//创建Panel
		var Panel=function(opt){
			for(var k in opt){
				this[k]=opt[k];
			}
			this.destroy=false;
		}
		Panel.prototype={
			constructor: Panel,
			render: function(parames, callback){
				var _this=this;
				
				//添加Panel到页面
				if(this.element){
					//静态元素
					doRender(this.element);
				}else{
					//模板元素
					//销毁
					this.destroy = true;

					var _url = this.url,
						_dataType = this.dataType || 'json',
						_template = this.template;
					
					if(_dataType === 'html' && !_template){
						//ajax载入页面内容
						$.ajax({
							url: _url,
							data:  parames,
							success: function(html){
								var panelElem=$(html);
								panelElem.appendTo('#content');
								doRender(panelElem);
							}
						})
						
					} else{
						
						//填充数据并添加到页面
						$.ajax({
							url: _url,
							data:  parames,
							dataType: _dataType,
							success: function(json){
								var htmlStr=$(_template).mustache(json);
								var panelElem=$(htmlStr);
								panelElem.appendTo('#content');
								doRender(panelElem);
							}
						})
					}
				}
				//渲染页面
				function doRender(panelElem){
					//callback && init
					callback&&callback(panelElem, _this);
					_this.init&&_this.init(panelElem, _this);
				}
			}
		}
		Panel.extend=function(model){
			return new Panel(model);
		}
		
		//添加首页至历史记录
		historyStates[0]={
			url: '/',
			element: $(indexPanel),
			destroy: false
		};
		//添加首页路由
		Router.add('/', new Panel({
			element: $(indexPanel)
		}))
		
		//判断是否为空对象
		function isEmptyObject(obj){
			for(var name in obj){
				return false;
			}
			return true;
		}
		
		//获取当前URL参数
		//return parames [Object]
		function getParames(url){
			var parames={};
			var parameStr = url || location.hash;
			var strArr=parameStr.split('?')[1];
			if(!strArr) return null;
			var strArr2=strArr.split('&');
			strArr2.forEach(function(item){
				var strArr3=item.split('=');
				if(strArr3.length===2){
					parames[strArr3[0]]=strArr3[1]
				}
			});
			return isEmptyObject(parames)?null:parames;
		}
		
		//调试
		function warn(message){
			if(settings.debug === true){
				if($.support.touch){
					if($('.itouch-warn').length > 0){
						$('.itouch-warn').find('p')[0].innerHTML += '<br />'+message;
						
					}else{										
						var warnHtml=$('<div class="itouch-warn"><span class="itouch-warn-close">×</span><p /></div>');
						warnHtml.find('p').html(message);
						warnHtml.find("span").bind('click',function(){
							warnHtml.remove();
						});
						warnHtml.appendTo('body');
					}
				}else{
					window.console && console.log(message);
				}
			}
		}

		//获取路由
		function getPanel(url){
			
			//判断是否为根目录
			if(url === '/') return Router.collection['/'];
			
			for(var k in Router.collection){
				if(url.indexOf(k)===0&&k!=='/'){
					return Router.collection[k];
				}
			}
			
			warn('未找到与url:'+url+'匹配的路由');	
		}
		
		//销毁ajax页面
		function removeAjaxPages(){
			//remove destroy page
			historyStates.forEach(function(item){
				if(item.destroy) item.element.remove();
			})
			
			//清空记录
			historyStates = historyStates.slice(0, 1);
		}
		
		//切换页面
		function switchPanel(selector,transition,reverse){
			//需求页对象
			var fromPage=$(activePanel);
			var toPage=$(selector);
			
			animationPanel(fromPage,toPage,transition,reverse);
			if(!reverse){
				toPage.data("transition",transition)
			}
			
			//记录页面
			lastPanel=fromPage;
			activePanel=toPage;

		}	
		
		//更改url hash 
		function changeUrl(url){
			window.location.hash=hashMark+url;
		}
		
		//添加记录
		function pushHistoryState(state){
			historyStates.push(state);
			changeUrl(state.url);
		}
		//返回
		function doHistoryBack(){
			
			var _states=historyStates;
			
			//已返回到首页
			if(_states.length === 1) return false;
			
			var targetState =_states[_states.length-2];
			var targetSelector=targetState.element;
			
			var currentState=_states[_states.length-1];
			var currentSelector=currentState.element;
			
			var transition=currentSelector.data('transition') || settings.defaultAnimation;
			
			switchPanel(targetSelector,transition,true);
			
			changeUrl(targetState.url);
			
			//销毁页面
			if(currentState.destroy){
				//在页面切换动画执行完后销毁 
				setTimeout(function(){
					currentSelector.remove();
				}, settings.animationDelay)
			}
			
			historyStates=_states.slice(0,_states.length-1);
			
			return true;
		}
		
		//回首页
		function goHomePage(transType){
			
			var transition=transType||settings.defaultAnimation;
			
			//切换页面
			switchPanel($(indexPanel),transition,false);

			//销毁ajax页面
			setTimeout(removeAjaxPages, settings.animationDelay);
		}
		
		//页面导航
		function doNavigation(url,transType){
			
			var transition=transType||settings.defaultAnimation;
			
			//回首页
			if(url === '/'){
				goHomePage();
				return false;
			}
				
			//获取路由  切换pannel
			var panel=getPanel(url);
			if(!panel){
				return false;
			}
			
			//载入页面
			settings.loadingStart(); //页面载入中执行事件
			
			var parames=getParames(url);
			panel.render(parames, function(panelEle, panelObj){
				
				settings.loadingEnd();//页面载入完成执行事件
				
				var $el=$(panelEle),
					destroy=panelObj.destroy;
					
				if($el.hasClass('current')) return false;
				
				//切换页面
				switchPanel($el,transition,false);
				
				//添加到history
				var state={
					url: url,
					element: $el,
					destroy: destroy
				};
				pushHistoryState(state);
			});
		}
		
		//触摸事件
		function touchStartHandler(e){
			
		    var $el = $(e.target),
		        selectors = touchSelectors.join(',');
			
		    // Find the nearest tappable ancestor
		    if (!$el.is(selectors)) {
		        $el = $el.closest(selectors);
		    }
			
		    // Make sure we have a tappable element
		    if ($el.length) {
		        $el.addClass('active');
		    }
		
		    // Remove our active class if we move
		    $el.on($.support.touch ? 'touchmove' : 'mousemove', function(){
		        $el.removeClass('active');
		    });
		
		    $el.on('touchend', function(){
		        $el.unbind('touchmove mousemove');
		    });
		
		}
	
		//点击事件
		function tapHandler(e){
			
		    // target element
		    var $el = $(e.target);
			
		    // 匹配可点击元素
		    if (!$el.is(touchSelectors.join(', '))) {
		        $el = $el.closest(touchSelectors.join(', '));
		    }
			
		    // 判断是否有可点击元素
		    if (!$el.length) {
		        return false;
		    }
		    		
		    // Init some vars
		    var href = $el.data('href'),
		        transition=$el.data('transition'),
		        role=$el.data('role');
			
		    if (role==='back') {
		        // User clicked or tapped a back button
		        doHistoryBack();
		        
		    }
		    if (!href) {
		        $el.unselect();
		        return false;
		        
		   } else {
				//doNavigation
				doNavigation(href,transition);
				$el.unselect();
		    }
		}
		
		//检测浏览器是否支持transform3D
		function supportForTransform3d() {
			
	        var head, body, style, div, result;
	
	        head = document.getElementsByTagName('head')[0];
	        body = document.body;
	
	        style = document.createElement('style');
	        style.textContent = '@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-webkit-transform-3d){#itouch-3dtest{height:3px}}';
	
	        div = document.createElement('div');
	        div.id = 'itouch-3dtest';
	
	        // Add to the page
	        head.appendChild(style);
	        body.appendChild(div);
	
	        // Check the result
	        result = div.offsetHeight === 3;
	
	        // Clean up
	        style.parentNode.removeChild(style);
	        div.parentNode.removeChild(div);
	
	        return result;
	    }

		//动画切换
		//support animation
		//cubeleft、cuberight、dissolve、fade、flipleft、flipright、pop、swap、swapleft、slideup、slidedown、slideleft、slideright
		function animationPanel(fromPage,toPage, animation, goingBack){
			// Error check for target page
		    if (toPage === undefined || toPage.length === 0) {
		        throw('Target element is missing.');
		        return false;
		    }
		
		    // 已是当前页
		    if (toPage.hasClass('current')) {        
		        return false;
		    }
		    
		    //无需动画或禁用动画
		    if(animation === 'none' || settings.animation === false){
		    	fromPage.removeClass('current');
		    	toPage.addClass('current');
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
		    }, settings.animationDelay)
		}
		//获取反向动画
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
		    
		//初始化页面
		$(document).ready(function(){
		    // Store some properties in a support object
			if (!$.support) $.support = {};
			
		    $.support.animationEvents = (typeof window.WebKitAnimationEvent != 'undefined');
		    $.support.touch = (typeof window.TouchEvent != 'undefined') && (window.navigator.userAgent.indexOf('Mobile') > -1);
		    $.support.transform3d = supportForTransform3d();
		    $.support.ios5 = /OS (5(_\d+)*) like Mac OS X/i.test(window.navigator.userAgent);

		    // Define public jQuery functions
		    $.fn.isExternalLink = function() {
		        var $el = $(this);
		        return ($el.attr('target') == '_blank' || $el.attr('rel') == 'external' || $el.is('a[href^="mailto:"], a[href^="tel:"], a[href^="javascript:"]'));
		    };
		
		    $.fn.unselect = function(obj) {
		        if (obj) {
		            obj.removeClass('active');
		        } else {
		            $('.active').removeClass('active');
		        }
		    };	
		    
		    //委托触摸、点击事件
		    var $body=$(document.body),
		    	touchEventType = $.support.touch ? 'touchstart' : 'mousedown',
		    	tapEventType = $.support.touch ? 'tap' : 'click';
			$body
				.bind(touchEventType, touchStartHandler)
				.bind(tapEventType, tapHandler);
			
			//添加3d效果样式
			$.support.transform3d&&$("#content").addClass("supports3d");
			
			//翻转屏幕时重置内容区高度
			function orientationChangeHandler(){
				$("#content").height($(window).height());
				var orientation = Math.abs(window.orientation) == 90 ? 'landscape' : 'portrait';
		        $('#content').removeClass('portrait landscape').addClass(orientation);
			}
			orientationChangeHandler();
			window.addEventListener('orientationchange', orientationChangeHandler, false);
		});
		
		var publicObj = {
			Panel: Panel,
			Router: Router,
			getParames: getParames,
			goHome: goHomePage,
			goBack: doHistoryBack
		}

		return publicObj;
	};
	
	//封装iTouch
	var iTouch=function(options){
		return iTouchCore(options);
	}
	window.iTouch=iTouch;
})(window,Zepto);

//mustache plugin for zepto
;(function($){
 $.mustache = function (template, view, partials) {
    return Mustache.render(template, view, partials);
  };

  $.fn.mustache = function (view, partials) {
    return $(this).map(function (i, elm) {
      var template = $(elm).html();
      return $.mustache(template, view, partials);
    })[0];
  };

})(Zepto);
