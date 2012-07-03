#如何使用itouch？

###在页面上引用一下文件:
```
<link rel="stylesheet" href="your-path/itouch.css" type="text/css" />
<script src="your-path/itouch.js"></script>
```

###面板页面HTML片段：
```
<div class="panel">
	<div class="panel-head">
		//head
	</div>
	<div class="panel-content">
		<div class="panel-content-inner">
			//the main content here 
		</div>
	</div>
	<div class="panel-foot">
		//footer
	</div>
</div>
```


###创建一个App：
```
var MyApp=new iTouch({
		indexPanel:$("#index"), //设定首页
		debug: true
	});
  
//创建页面
var page1=MyApp.Panel.extend({
	element:$('#page_1'),
	init: function(panel){
		//TODO
	}
})

var page2=MyApp.Panel.extend({
	template:$('#page_2'),
	url:'http://oklai.name/m/json/view.php',
	dataType: 'jsonp',
	init: function(ele, panelObj){
		//TODO
	}
})

var page3=MyApp.Panel.extend({
	url:'/m/card.html',
	dataType: 'html',
	init: function(ele, panelObj){
		//TODO
	}
})

//绑定路由
MyApp.Router.extend({
	'/list/':page1,
	'/view/':page2,
	'/card/':page3
});
```

#文档说明
##iTouch实例
###new iTouch(settings)
```
//创建iTouch实例
var MyApp=new iTouch({
	indexPanel:$("#index"),
	debug: true
});
```

**indexPanel**  
*[zepto object]*   
Default: $("#content > .current")[0]  
设定首页面  

**animation**   
*[Boolean]*  
Default: true   
开启或关闭页面切换动画效果  

**defaultAnimation**   
*[String]*  
Default: 'slideleft'    
默认动画效果  

**animationDelay**   
*[Int]*  
Default: 400     
动画缓动时间  

**loadingStart**     
*[Function]*  
Default: 创建loader效果    
页面开始载入时执行方法，可以在这里重置默认的loader效果  

**loadingEnd**     
*[Function]*  
Default: 移除loader效果    
页面载入结束时执行方法  

**debug**     
*[Boolean]*  
Default: false    
开启关闭调试信息，开启后可以使用MyApp.warn(msg)输出调试信息  


















