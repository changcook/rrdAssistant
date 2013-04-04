/**
* ver-3 2012-12 将投标页生成到本页，节省了点击投标进投标页的访问时间。
* ver-4 2013-1-29 由于列表页增加了缓存技术，导致列表和详情页数据不一致的情况，产生了误报。更新此代码
*/
function withjQuery(callback, safe){
  if(typeof(jQuery) == "undefined") {
		var script = document.createElement("script");
		script.type = "text/javascript";
		// script.src = "http://www.w3school.com.cn/jquery/jquery.js";
		script.src = "http://st.icson.com/static_v1/js/jquery-1.5.1.min.js";

		if(safe) {
			var cb = document.createElement("script");
			cb.type = "text/javascript";
			cb.textContent = "jQuery.noConflict();(" + callback.toString() + ")(jQuery, window);";
			script.addEventListener('load', function() {
				document.head.appendChild(cb);
			});
		}
		else {
			var dollar = undefined;
			if(typeof($) != "undefined") dollar = $;
			script.addEventListener('load', function() {
				jQuery.noConflict();
				$ = dollar;
				callback(jQuery, window);
			});
		}
		document.head.appendChild(script);
	} else {
		setTimeout(function() {
			//Firefox supports
			callback(jQuery, typeof unsafeWindow === "undefined" ? window : unsafeWindow);
		}, 30);
	}
}

withjQuery(function($, window){
	if(window.location.href.indexOf('renrendai.com') == -1){
			return false;
	}
	var log = console;
	/**
	* 你的配置
	**/
	var global_options={

		'frequency'	: 10000, //更新频率。默认1分钟。标准版
		'fetchhaawaylicence': 1, //每天一次
		'deaddate'	: '2013-07-01',//限制使用

	};
	$(document).click(function() {
		
		if( window.webkitNotifications && window.webkitNotifications.checkPermission() != 0 ) {
			window.webkitNotifications.requestPermission();
		}
		
	
	});
	function notify(str, timeout, skipAlert) {
		if( window.webkitNotifications && window.webkitNotifications.checkPermission() == 0 ) {
			var notification = webkitNotifications.createNotification(
				"http://www.renrendai.com/favicon.ico",  // icon url - can be relative
				'投标小助手',  // notification title
				str
			);
			notification.show();
			if ( timeout ) {
				setTimeout(function() {
					notification.cancel();
				}, timeout);
			}
			return true;
		} else {
			if( !skipAlert ) {
				alert( str );
			}
			return false;
		}
	}

	function route(str, fn, data){
		if( window.location.href.indexOf( str ) != -1){
			if(typeof(data) != 'undefined'){
				fn(data);
			}else{
				fn();
			}
			
		}
	}
	

	
	//配置
	function _configs(opts){
		opts = $.extend(global_options, opts);	
		global_options = opts;

	}

	/**
	* 循环执行
	**/
	setInterval( function (){
		/*请求对应地址*/
		
		var siteurl='http://www.renrendai.com/';
		var _d = new Date();

		jQuery.ajax({
			type: "POST",
			url	: siteurl + "lend/loanList.action?id=all_biao_list&pageIndex=1&orderid=0&_="+_d.getTime(),
			data:{
				'username':'changxm',
				'data' : _d.getMinutes()
			},
			success : function(data){
				// console.debug(data);
				// var exp = /<div>[^<\/]*<\/div>/g;
				// exp = /<div id="biao([^"]*)"[^￥]*￥([^<|^\s]*)\s+<\/div>.*([^%]*)%/gm;

				// <div id="biao([^"]*)"[^￥]*￥([^<|^\s]*)\s+([^%]*)%    (\d{1,2}\.00)%
				// console.debug(data.match(exp));
				// <div id="biao([^"]*)"[^￥]*￥([^\s]*)   获取标ID, 金额
				// [^\d{1,2}\.\d0%]*(\d{1,2}\.\d0)%   获取年利率
				// <div>\s+([\d]*)个月   获取时长
				// <p>([\d]*)%</p>   获取已投比例
				var exp_1=/<div id="biao([^"]*)"[^￥]*￥([^\s]*)/m; //标id 金额
				var	exp_2=/[^\d{1,2}\.\d0%]*(\d{1,2}\.\d0)%/m; // 年利率
				var	exp_3=/<div>\s+([\d]*)个月/m; // 时长
				var exp_4=/<p>([\d]*)%<\/p>/m; // 已投比例


				// console.debug(exp_4.exec(data));
				var finishrate = exp_4.exec(data);
				console.debug(finishrate);
				if(finishrate && finishrate[1]!="100"){
					
					var rates=exp_2.exec(data);
					var months = exp_3.exec(data);

					var maindata=exp_1.exec(data);
						console.debug(maindata);

					console.debug(rates);
					//，弹出 
					var _rate=parseFloat( rates[1] );
					var _month=parseInt( months[1] );

					//-----
					if($('#hwform').length == 0){
						$('.logo_right_link').append('<div id="hwform"></div>');
					}

					$('#hwform').css({width:'600px','background':'white', 'top':'200px','overflow':'auto'});
					
					

					console.debug('可以投标 rate='+_rate+', month='+_month+',finish='+finishrate[1]+'%');
					if($('#haaway').length==0){
							$('.logo_right_link').append('<div id="haaway"></div>');
						}
					$('#haaway').html('<a target="_blank" href="http://www.renrendai.com/lend/bidPageAction.action?loanId='+maindata[1]+'">投标 利率='+_rate+'%, '+_month+'个月,完成'+finishrate[1]+'%</a>')
					.css({'margin':'20px','border':'1px solid red','clear':'both'});
					
					//12月以内，14点以上的   OR  6月以内13点。
					//rates && rates[1] && parseFloat(rates[1]) > 14  && parseInt(months[1])<=12
					// ( _rate>14&&_month<=12) || (_rate>=13&&_month<=6)
					if(( _rate>=14&&_month<=12) || (_rate>=13&&_month<=6)){
						console.debug('符合条件 ');

						

						// window.open('http://www.renrendai.com/lend/detailPage.action?loanId='+maindata[1]);
						// window.open('http://www.renrendai.com/lend/bidPageAction.action?loanId='+maindata[1]);
						//              http://www.renrendai.com/lend/bidPageAction.action?loanId=52333
						// http://www.renrendai.com/lend/detailPage.action?loanId=51970
						var audio;
						if( window.Audio ) {
							audio = new Audio("http://www.w3school.com.cn/i/song.ogg");
							audio.loop = false;
							audio.play();
						}
						$.ajax({
						type : 'POST',
						url : siteurl + 'lend/bidPageAction.action?loanId='+maindata[1],
						data : {},
						success : function(ddata){
							//$('#hwform').html(ddata);
							// console.debug(ddata);
							var _iStart = ddata.indexOf('<form action');
							var _iEnd	= ddata.indexOf('<div id="footer">');
							console.debug(_iStart);
							console.debug(_iEnd);
							var _form = ddata.substring(_iStart, _iEnd);
							
							// var eexp1=/<form action[^form>]*<\/form>/g;
							// var _form  = eexp1.exec(ddata);
							// console.debug(_form);
							_form += '<button onclick="$(\'#hwform\').hide()">--关闭--</button>';
							$('#hwform').html('').append(_form);
							/*if($('#code').length>0){
								$('#code').remove();
							}*/
							
							//我的可用余额正则
							var _expmyrest = /<td style="padding-left: 5px; color: #ff0000">￥([^&]*)&/g;
							var _mine = _expmyrest.exec(_form);
							var myrest = $.trim(_mine[1]);
							myrest = myrest.replace(/,/g,'');	
							myrest = parseFloat(myrest);						


							//他们还需要
							var _exptheyneed = /<td style="color: #ff0000"><div style="padding-left: 5px">\s+￥([^<]*)\s+</g;
							var _them = _exptheyneed.exec(_form);							
							var theyneed = ($.trim(_them[1]));
							theyneed = theyneed.replace(/,/g,'');
							theyneed = parseInt(theyneed);

							console.debug( 'theyneed='+theyneed + ', myrest='+myrest);
							console.debug( '如若我余钱丰富，他们需要少，则给他'+  Math.floor(myrest/50) * 50 );
							if(theyneed>0 && myrest>=50){
								//为解决缓存问题。可以投时再投
								notify(" 哈途提示有标！rate:"+rates[1]+"% \" month:"+months[1]+" \" 完成"+finishrate[1]+"%");
								if(myrest>theyneed){
									$('#bidAmount').val(theyneed);
								}else{
									myrest = parseInt(myrest);
									var _mm = Math.floor(myrest/50);
									$('#bidAmount').val(_mm*50);
								}
							} else{
								//已经不能投标了！
								$('#hwform').html('');
							}

							if(theyneed >0 && myrest >= 50  && ( _rate>15&&_month<=12) ){
								//提交 
								// $('.bid_bnt').click();
							}						

							

						}

					});
						
					}else{
						$('#hwform').html('');
					}  // end of 可以投的概率 不可投时隐藏投标form框
				}
				// console.debug(exp.exec(data));
				
			}


		});

 

	} ,15000);
	

}, true);


// http://www.renrendai.com/lend/bidPageAction.action?loanId=52284
//update log:   2013-3-3   当不可投标时，把那个form框干掉！@！@！
