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
return: *[itouch object]*  

```
//创建iTouch实例
var MyApp=new iTouch({
	indexPanel:$("#index"),
	debug: true
});
```

####settings属性说明：  

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
开启关闭调试信息，开启后可以使用MyApp.log(msg)输出调试信息  

###itouch对象属性说明：  
```
var MyApp=new iTouch()
console.log(MyApp)
//return 	
//{
//	Panel: *[Function]*,
//	Router: *[Object]*,
//	getParames: *[Function]*,
//	goHome: *[Function]*,
//	goBack: *[Function]*,
//	log: *[Function]*
//}
```

**Panel**  
MyApp.Panel.extend(options)  
return: *[panel object]*  
页面对象  

**Router**  
MyApp.Router.extend(collection)  
MyApp.Router.add(url, panel)  
路由集合

**getParames**  
MyApp.getParames()  
return: *[parames object]*  
获取当前url参数  

**goHome**  
MyApp.goHome()  
返回首页  

**goBack**  
MyApp.goBack()  
返回上一页  

**log**  
MyApp.log(msg)  
直接在页面上输出msg，用于调试应用  

##创建页面对象
###MyApp.Panel.extend(options)
```
//创建页面对象
var listPage=MyApp.Panel.extend({
	element:$('#list'),
	init: function(){
		//TODO
	}
});	
	
var detailPage=MyApp.Panel.extend({
	template:$('#Temp_detail'),
	url:'/m/itouch/example/json/detail.json',
	dataType: 'json',
	init: function(element, panelObj){
		//TODO
	}
});	
```
options属性说明：  

**element**  
*[zepto object]*  
Default: none  
指定某个DOM元素为页面对象  

**template**  
*[zepto object]*  
Default: none  
指定某个DOM元素的内容为一个模板，在获取数据后将生成一个页面并插入至App中。  
注意：element属性与template必须设定其中一个，使用template属性时必须指定数据源。  

**url**  
*[String]*  
Default: none  
数据源地址。使用模板生成页面时必须设定url。  

**dataType**  
*[String]*  
Default: json  
数据类型。可选值有：json、jsonp、html  
当dataType为html时，可以不设定element属性或template属性，将会把Ajax载入的html内容设为一个页面对象。  

**init**  
*[Function]*  
Default: none  
回调函数，将在页面完成切换后执行，拥有两个参数。  
第一个参数：*[zepto object]*,当前页面DOM对象  
第二个参数：*[Panel object]*,页面模型对象














