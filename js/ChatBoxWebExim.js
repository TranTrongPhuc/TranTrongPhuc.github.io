$(document).ready(function () {
    //zalo chat
    $("body").append("<script src='https://sp.zalo.me/plugins/sdk.js'></script><div class='zalo-chat-widget' data-oaid='301582559235990105' data-welcome-message='Rất vui khi được hỗ trợ bạn!' data-autopopup='0' data-width='350' data-height='420'></div>");

	window.fbAsyncInit = function () {
			FB.init({
				xfbml: true,
				version: 'v6.0'
			});
		};

		(function (d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) return;
			js = d.createElement(s); js.id = id;
			js.src = 'https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js';
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
     $("body").append("<div class='fb-customerchat' attribution=setup_tool page_id='106105397800440' theme_color='#007bff' greeting_dialog_display='hide' logged_in_greeting='Rất vui khi được hỗ trợ bạn!' logged_out_greeting='Rất vui khi được hỗ trợ bạn!'></div>");

});
