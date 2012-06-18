(function(window,undefined){
	"use strict"
	
	var iTouch=function(option){
		//首页面
		this.indexPanel=option.indexPanel||$("#content > .current")[0];
		//当前页
		this.activePanel=$(this.indexPanel);
		//上一页
		this.lastPanel=null;
		this.hashMark='!';
		
		//历史记录
		this.HistoryStates=[];

		//路由集合
		this.Router={};
		var _Router=this.Router;
		_Router.collection={};
		_Router.extend=function(c){
			for(var k in c){
				_Router.collection[k]=c[k];
			}
		}
		_Router.add=function(route,panel){
			_Router.collection[route]=panel;
		}
		
		//创建Panel
		var _this=this;
		this.Panel={}
		this.Panel.extend=function(model){
			return new iTouch.Panel(model,_this);
		}
		
		//初始化应用
		this.InitRoleType(document.body,this);
	};
	
	//获取路由
	function getPanel(url,routerCollection){
		for(var k in routerCollection){
			if(url.indexOf(k)===0&&k!=='/'){
				return routerCollection[k];
			}
		}
		throw('未找到匹配的路由');	
	}
	
	//切换页面
	function switchPanel(selector,transition,reverse,app){
		//需求页对象
		var fromPage=$(app.activePanel);
		var toPage=$(selector);
		
		animationPanel(fromPage,toPage,transition,reverse);
		if(!reverse){
			toPage.data("transition",transition)
		}
		
		//记录页面
		app.lastPanel=fromPage;
		app.activePanel=toPage;
	}	
	//历史记录 
	function changeUrl(url){
		window.location.hash=url;
	}
	//添加记录
	iTouch.prototype.pushHistoryState=function(state){
		var app=this;
		app.HistoryStates.push(state);
		changeUrl(app.hashMark+state.url);
	}
	//返回
	iTouch.prototype.doHistoryBack=function(){
		var app=this;
		
		var _states=app.HistoryStates;
		if(!_states.length) return false;
		if(_states.length===1){
			//回到首页面
			var currentState=_states[_states.length-1];
			var currentSelector=$("#"+currentState.uuid);
			var transition=currentSelector.data('transition')||'slideleft';
			
			switchPanel(app.indexPanel,transition,true,app);
			changeUrl(app.hashMark+'');
			
			//销毁页面
			if(currentState.destroy){
				//在页面切换动画执行完后销毁 
				setTimeout(function(){
					currentSelector.remove();
				},1000)
			}
			
			app.HistoryStates=[];
			
		}else{
			////非首页
			var targetState =_states[_states.length-2];
			var targetSelector=$('#'+targetState.uuid);
			
			var currentState=_states[_states.length-1];
			var currentSelector=$("#"+currentState.uuid);
			
			var transition=currentSelector.data('transition')||'slideleft';
			
			switchPanel(targetSelector,transition,true,app);
			
			changeUrl(app.hashMark+targetState.url);
			
			//销毁页面
			if(currentState.destroy){
				//在页面切换动画执行完后销毁 
				setTimeout(function(){
					currentSelector.remove();
				},500)
			}
			
			app.HistoryStates=_states.slice(0,_states.length-1);
		}	
	}

	//注册data-role类型事件 Type: link、back、scroll
	iTouch.prototype.InitRoleType=function(ele){
		var app=this;
		
		//support for desktop
		var eventType="ontouchstart" in window?"touchstart":"click";
		//Type: link (data-role="link")
		//链接类型动作
		$(ele).find("[data-role=link]").bind(eventType,function(e){
			var linkEle=$(this);
			//防止重复点击
			if(linkEle.data("touching")===true) return false;
			linkEle.data("touching",true);

			//避免touchmove时触发点击动作
			var touchTimeout;
			touchTimeout=setTimeout(doNavigatePanel,100);
			linkEle.bind("touchmove",function(){
				clearTimeout(touchTimeout);
			});
			
			function doNavigatePanel(){
				var url=linkEle.data('href')||linkEle.attr('href')||'';
				var transition=linkEle.data('transition')||'slideleft';
		
				//获取路由  切换pannel
				var panel=getPanel(url,app.Router.collection);
				if(!panel){
					return false;
				}
				//载入页面
				panel.render(function($el,uuid,destroy){
					if(uuid===$(app.activePanel).attr('id')) return false;
					
					//切换页面
					switchPanel($el,transition,false,app);
					linkEle.data("touching",false)
					
					//添加到history
					var state={
						url: url,
						uuid: uuid,
						destroy: destroy
					};
					app.pushHistoryState(state);
				});
				
				
			}
			
			e.preventDefault();
			return false;
		});
		
		//Type: link (data-role="link")
		//后退类型动作
		$(ele).find("[data-role=back]").bind(eventType,function(e){
			app.doHistoryBack();
			return false;
		});
	}

	//获取当前URL参数
	//return parames [Object]
	function getParams(){
		var parames={};
		var strArr=location.hash.split('?')[1];
		if(!strArr) return false;
		var strArr2=strArr.split('&');
		strArr2.forEach(function(item){
			var strArr3=item.split('=');
			if(strArr3.length===2){
				parames[strArr3[0]]=strArr3[1]
			}
		});
		return isEmptyObject(parames)?false:parames;
	}
	//判断是否为空对象
	function isEmptyObject(obj){
		for(var name in obj){
			return false;
		}
		return true;
	}
	
	//面板模型
	iTouch.Panel=function(opt,itouch){
		for(var k in opt){
			this[k]=opt[k];
		}
		this.destroy=false;
		this.model=itouch;
	}
	iTouch.Panel.prototype={
		constructor: iTouch.Panel,
		render: function(callback){
			var _this=this;
			
			//添加Panel到页面
			if(this.element){
				//静态元素
				doRender($(this.element)[0],false);
			}else{
				//模板元素
				//销毁
				this.destroy=true;
				
				var parames=getParams();
				var url=parames?(this.json+"?"+$.param(parames)):this.json;
				var _template=this.template;
				
				//填充数据并添加到页面
				$.get(url,function(data){
					var json=$.parseJSON(data);
					var htmlStr=$(_template).mustache(json);
					var panelElem=$(htmlStr)[0];
					$(panelElem).appendTo('#content');
					doRender(panelElem,true);
					
					//init role type
					_this.model.InitRoleType(panelElem);
				})
			}
			//渲染页面
			function doRender(panelElem,destroy){
				//创建UUID
				var uuid=$(panelElem).data("uuid"); // $.uuid();
				if(!uuid){
					uuid=$.uuid();
					_this.uuid=uuid;
					panelElem.setAttribute("id",uuid);
					$(panelElem).data("uuid",true);
				}
				
				//callback && init
				callback&&callback(panelElem,_this.uuid,destroy,_this);
				_this.init&&_this.init(_this);
			}
		},
		refresh:function(newelm){
			this.model.InitRoleType(newelm);
		}
	}
	
	window.iTouch=iTouch;
})(window)

//初始化页面
$(function(){
	//取消touchmove时的默认动作
	document.addEventListener('touchmove', function(e){ e.preventDefault(); });
	
	//翻转屏幕时重置内容区高度
	function setContentHeight(){
		var contentHight=$(window).height();
		$("#content").height(contentHight);
	}
	setContentHeight();
	window.addEventListener('orientationchange', setContentHeight, false);
});

