$(document).ready(function () {
    //web chat
    var currentLocation = window.location.toString();
    $("body").append("<div id='baseChatBox' style='position:fixed; right:9.1rem; bottom:1rem; z-index:2147483600;height:0;'><iframe src='https://2c2751c285f3.ngrok.io/WebChat/Index?url=" + currentLocation + "' style='width:100%;height:100%;border:0 !important;'></iframe></div>");

    //zalo chat
    $("body").append("<script src='https://sp.zalo.me/plugins/sdk.js'></script><div class='zalo-chat-widget' data-oaid='301582559235990105' data-welcome-message='Rất vui khi được hỗ trợ bạn!' data-autopopup='0' data-width='350' data-height='420'></div>");
    $("body").append("<link href='https://2c2751c285f3.ngrok.io/Content/customlocationwidget.css' rel='stylesheet' type='text/css' />");

    //facebook messenger
    $("body").append("<div id='fb-root'></div>");
    $("body").append("<script src='https://2c2751c285f3.ngrok.io/Scripts/ChatBoxFacebookMess.js'></script>");
    $("body").append("<div class='fb-customerchat' attribution=setup_tool page_id='106105397800440' theme_color='#007bff' greeting_dialog_display='hide' logged_in_greeting='Rất vui khi được hỗ trợ bạn!' logged_out_greeting='Rất vui khi được hỗ trợ bạn!'></div>");

    //viber chat messnger
    $("body").append("<div id='ViberChatBox' style='position:fixed; right:8.5rem; bottom:1rem; z-index:2147483600;height:50px;width:50px'><iframe src='https://2c2751c285f3.ngrok.io/ViberChat/Index?url=" + currentLocation + "' style='width:100%;height:100%;border:0 !important;'></iframe></div>");


});

window.addEventListener('message', function (message) {
 	
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        var w = screen.width - 10;
        var h = screen.height;
        var lstCmd = message.data.toString().split('|');
		 //  this.console.log(message, isMobile , "eval(lstCmd[1])=", eval(lstCmd[1]));
		
        if (lstCmd.length > 1 && lstCmd[0] == "CLOSE") {
            $("#baseChatBox").css("right", "9.1rem");
            $("#baseChatBox").css("z-index", "2147483600");
            $('#baseChatBox').height(eval(lstCmd[1]));
            $('#baseChatBox').width(110);
        }
        else if (lstCmd.length > 1 && lstCmd[0] == "OPEN") {
            $("#baseChatBox").css("right", "0.3rem");
            $("#baseChatBox").css("z-index", "2147483603");
            $('#baseChatBox').height(eval(lstCmd[1]) + 60);
            //$('#baseChatBox').height(h);
            $('#baseChatBox').width(w);
        }
    }
    else {
        var lstCmd = message.data.toString().split('|');
		  // this.console.log(message, isMobile , "eval(lstCmd[1])=", eval(lstCmd[1]));
        if (lstCmd.length > 1 && lstCmd[0] == "CLOSE") {
            // do colse on customer site
			$("#baseChatBox").css("right", "9.1rem");
            $('#baseChatBox').height(eval(lstCmd[1]));
            $('#baseChatBox').width(110);
        }
        else if (lstCmd.length > 1 && lstCmd[0] == "OPEN") {
			$("#baseChatBox").css("right", "12.1rem");
            $('#baseChatBox').height(eval(lstCmd[1]));
            $('#baseChatBox').width(320);
        }

    }
});
