#如何使用iTouch？

###在页面上引用一下文件:
```
<link rel="stylesheet" href="itouch/iTouch.css" type="text/css" />
<script src="itouch/iTouch.js"></script>
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
	});
  
  //创建页面
var page1=MyApp.Panel.extend({
	element:$('#page_1'),
	init: function(panel){
		//console.log('page1 has show')
	}
})
var page2=MyApp.Panel.extend({
	element:$('#page_1'),
	init: function(panel){
		//console.log('page1 has show')
	}
})

//绑定路由
MyApp.Router.extend({
	'/list/':page1,
	'/view/':page2,
});
```