$(document).ready(function() {
	//编辑器
    $('.summernote').summernote({
    	minHeight: 300,
    	maxHeight: null,
    	focus: true,//在初始化之后，将焦点放在编辑区域内
    	lang: 'zh-CN', // default: 'en-US'
    	disableDragAndDrop : false,//禁止拖拽
    	dialogsFade : true,//增加summernote上弹出窗口滑进滑出的动态效果。
    	dialogsInBody : true,//summernote的弹出框是否在body中
    });//初始化Summernote


});