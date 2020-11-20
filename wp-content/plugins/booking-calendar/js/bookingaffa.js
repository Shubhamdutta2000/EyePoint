
  
var wpdevartScript;
var wpdevartScriptOb;

jQuery( document ).ready(function() {
	wpdevartScript = function () {
		/*
		* Calendar Next, Prev
		*/
		var $ = jQuery;
		var ajax_next = "";
		$("body").on( "click",".wpda-booking-calendar-head:not(.reservation) .wpdevart_link", function(e){
			if(typeof(start_index) == "undefined") {
				start_index = "";
				selected_date = "";
			}
			e.preventDefault();
			var bc_main_div = $(this).closest('.booking_calendar_container');
			var id = wpdevartBooking($(this).closest(".booking_calendar_main_container").data('booking_id'),"id");
			
			$(bc_main_div).find('.wpdevart-load-overlay').show();
			$.post(wpdevart.ajaxUrl, {
				action: 'wpdevart_ajax',
				wpdevart_selected: start_index,
				wpdevart_selected_date: selected_date,
				wpdevart_link: $(this).attr('href'),
				wpdevart_id: id,
				wpdevart_nonce: wpdevart.ajaxNonce
			}, function (data) {
				$(bc_main_div).find('div.booking_calendar_main').replaceWith(data);
				$(bc_main_div).find('.wpdevart-load-overlay').hide();
				if($(data).find(".wpdevart-day.selected").length == 1) {
					select_index = $(data).find(".wpdevart-day.selected").index() - 7;
				} else if($(data).find(".wpdevart-day.selected").length == 0){
					select_index = 0;
				}
			});
			e.stopPropagation();
		});
		
		/*
		* Reservation Calendar Next, Prev
		*/
		$("body").on( "click",".reservation .wpda-previous,.reservation .wpda-next", function(e){
			if(typeof(start_index) == "undefined") {
				start_index = "";
				selected_date = "";
			}
			e.preventDefault();
			var bc_main_div = $(this).closest('.booking_calendar_container');
			if($(".wpdevart_res_month_view").length != 0) {
				var reserv = "true";
				var cal_id = $(this).parent().parent().find("table").data('id');
			} else {
				var reserv = "false";
				var cal_id = $(this).closest(".booking_calendar_main_container").data('id');
			}
			$(bc_main_div).find('.wpdevart-load-overlay').show();
			$.post(wpdevart.ajaxUrl, {
				action: 'wpdevart_ajax',
				wpdevart_reserv: reserv,
				wpdevart_selected: start_index,
				wpdevart_selected_date: selected_date,
				wpdevart_link: $(this).find('a').attr('href'),
				wpdevart_id: cal_id,
				wpdevart_nonce: wpdevart.ajaxNonce
			}, function (data) {
				$(bc_main_div).find('div.booking_calendar_main').replaceWith(data);
				$(bc_main_div).find('.wpdevart-load-overlay').hide();
				if($(data).find(".wpdevart-day.selected").length == 1) {
					select_index = $(data).find(".wpdevart-day.selected").index() - 7;
				} else if($(data).find(".wpdevart-day.selected").length == 0){
					select_index = 0;
				}
			});
			e.stopPropagation();
		});
		$("body").on( "click",".wpda-booking-calendar-head .wpda-next .wpdevart_link, .next_year_info", function(e){
			ajax_next = "next";
		});
		$("body").on( "click",".wpda-booking-calendar-head .wpda-previous .wpdevart_link, .prev_date_info", function(e){
			ajax_next = "prev";
		});
		
		
		/*
		* Submit Button
		*/
		$("body").on( "click",".wpdevart-submit:not(.order-submit):not(.wpdevart-submit-update)", function(e){
			var el = $(this);
			var wpdevart_required_field = wpdevart_required(el);	
			var booking_id = el.closest(".booking_calendar_main_container").data('booking_id');
			var capcha_error = wpdevartBooking(booking_id,"capcha_error");

			e.preventDefault();
			if(wpdevart_required_field){
				if($(this).closest(".wpdevart-booking-form-container").find(".g-recaptcha").length){
					$.post(wpdevart.ajaxUrl, {
						action: 'wpdevart_captcha',
						wpdevart_captcha: grecaptcha.getResponse(),
						wpdevart_nonce: wpdevart.ajaxNonce
					}, function (data) {
						if(data == 1){
							wpdevartec_submit(el,booking_id);
						} else {
							alert(capcha_error);
						}	
					});
					
				}else {
					wpdevartec_submit(el,booking_id);
				}
				e.stopPropagation();	
			}
			
		});
		
		/*
		* Submit Button for Update
		*/
		$("body").on( "click",".wpdevart-submit-update", function(e){
			var wpdevart_required_field = wpdevart_required($(this));
			e.preventDefault();
			if(wpdevart_required_field === true) {
				var reserv_data = {};
				var booking_id = $(this).closest(".booking_calendar_main_container").data('booking_id');
			    var offset = wpdevartBooking(booking_id,"offset");
				$(this).closest("form").find("input[type=text],button,input[type=hidden],input[type=checkbox],input[type=radio],select,textarea").each(function(index,element){
					if(jQuery(element).is("input[type=checkbox]")) {
						if(jQuery(element).is(':checked')) {
							reserv_data[jQuery(element).attr("name")] = "on";
						} else {
							reserv_data[jQuery(element).attr("name")] = "";
						}
					} else if(jQuery(element).is("select") && jQuery(element).attr("multiple") == "multiple"){
						if($(element).val()) {
							var multy_select = $(element).val().join("|wpdev|");
							reserv_data[jQuery(element).attr("name")] = multy_select;
						}
					}else {
						reserv_data[jQuery(element).attr("name")] = $(element).val();
					}
				});
				reserv_json = JSON.stringify(reserv_data);
				$(this).addClass("load");
				var reserv_form = $(this).closest("form");
				var reserv_cont = $(this).closest(".booking_calendar_main_container");
				$.post(wpdevart.ajaxUrl, {
					action: 'wpdevart_form_ajax',
					wpdevart_data: reserv_json,
					wpdevart_id: wpdevartBooking(booking_id,"id"),
					wpdevart_submit: $(this).attr('id').replace("wpdevart-submit", ""),
					wpdevart_nonce: wpdevart.ajaxNonce
				}, function (data) {
					$(reserv_cont).find('div.booking_calendar_main').replaceWith(data);
					$(reserv_form).find(".wpdevart-submit").removeClass("load");
					$(window).scrollTo( reserv_cont, 400,{'offset':{'top':-(offset)}});
				});
				e.stopPropagation();
			}
		});
		
		/*
		* payment Button
		*/
		$("body").on( "click","input.wpdevart_shipping", function(e){
			var this_ = $(this);
			if($(this).prop('checked') == true) {
				$(this).closest(".address_item").prev().find(".wpdevart-fild-item-container").each(function(index,element){
					var tag = jQuery(element).find("[id^='wpdevart_form_field']");
					var tagname = tag.prop("tagName");
					var value = tag.val();
					var type = tag.attr("type");
					if(tagname == "INPUT"){
						if(type == "text") {
							$(this_).closest(".address_item").find(".wpdevart-fild-item-container").eq(index+1).find("input").val(value);
						} else if(type == "checkbox" || type == "radio") {
							if(tag.prop('checked') == true) {
								$(this_).closest(".address_item").find(".wpdevart-fild-item-container").eq(index+1).find("input").attr("checked","checked");
							} 
						}
					} 
					else if(tagname == "SELECT") {
						$(this_).closest(".address_item").find(".wpdevart-fild-item-container").eq(index+1).find("select option[value='"+tag.find("option:selected").val()+"']").attr("selected","selected");
					} else if(tagname == "TEXTAREA") {
						$(this_).closest(".address_item").find(".wpdevart-fild-item-container").eq(index+1).find("textarea").val(value);
					}
					
				});
			} else {
				$(this).closest(".address_item").find("input[type=text],input[type=hidden],textarea").each(function(index,element){
					jQuery(element).val("");
				});
				$(this).closest(".address_item").find("select").each(function(index,element){
					jQuery(element).find("option:selected").removeAttr("selected");
				});
				$(this).closest(".address_item").find("input[type=checkbox],input[type=radio]").each(function(index,element){
					jQuery(element).removeAttr("checked");
				});
			}
		});
		$("body").on( "click", ".order-submit", function(e){
			var wpdevart_required_field = wpdevart_required($(this));
			if(wpdevart_required_field !== true) {
				e.preventDefault();
			}
		});
		
		$("body").on( "click",".wpdevart-payment-button.payment_submit", function(e){
			var id = $(this).data("id");
			$(this).closest("form").find("input[name=payment_type_" + id + "]").val($(this).attr("id"));
			$(this).closest("form").submit();
		});
		
		$("body").on( "click",".wpdevart-payment-button:not(.payment_submit)", function(e){
			e.preventDefault();
			var payment_id = $(this).attr("id");
			var id = $(this).data("id");
			var resid = $(this).data("resid");
			var themeid = $(this).data("themeid");
			$(this).closest("form").find("input[name=payment_type_" + id + "]").val($(this).attr("id"));
			$(this).closest("form").find(".wpdevart_order_wrap").fadeIn();
			$(this).closest("form").find(".wpdevart_order_content").fadeIn();
			var order_content = $(this).closest("form").find(".wpdevart_order_content");
			$.post(wpdevart.ajaxUrl, {
				action: 'wpdevart_payment_ajax',
				wpdevart_data: payment_id,
				wpdevart_resid: resid,
				wpdevart_id: id,
				wpdevart_themeid: themeid,
				wpdevart_nonce: wpdevart.ajaxNonce
			}, function (data) {
				$(order_content).replaceWith(data);
			});
			e.stopPropagation();
		});
		
		$("body").on( "click",".wpdevart_close_popup", function(e){
			$(this).closest(".wpdevart_order_content").fadeOut();
			$(this).closest(".wpdevart_order_content").prev().fadeOut();
		});
		$("body").on( "click",".wpdevart_order_wrap", function(e){
			$(this).fadeOut();
			$(this).next().fadeOut();
		});
		
		/*
		*CALENDAR
		*/
		var select_ex = false,
			existtt = false,
			count_item = $(".wpdevart-day").length,
			start_index,check_in,check_out,
			item_count = "",
			extra_price_value = 0;
		if($("#wpdevart_update_res").length){
			existtt = true;
			/* 12/23/2017 remove
			item_click(false,$(".wpdevart-day.selected").get(0),true);*/
			var check_indateformat = $(".wpdevart-day.selected").eq(0).data("dateformat");
			var check_outdateformat = $(".wpdevart-day.selected").eq($(".wpdevart-day.selected").length-1).data("dateformat");
			var check_indate = $(".wpdevart-day.selected").eq(0).data("date");
			var check_outdate = $(".wpdevart-day.selected").eq($(".wpdevart-day.selected").length-1).data("date");
			var calendar_idd = $(".booking_calendar_main_container").data("id");
			if(!$(".booking_calendar_main_container").hasClass("hours_enabled")){
				$.get(wpdevart.ajaxUrl, {
					action: 'wpdevart_get_interval_dates',
					wpdevart_start_date: check_indate,
					wpdevart_end_date: check_outdate,
					wpdevart_id: calendar_idd,
					wpdevart_nonce: wpdevart.ajaxNonce
				}, function (data) {
					date_data = JSON.parse(data);
				});
			}
		}	
		$("body").on("click",".wpdevart-day", function() {
			item_click(false,this,false);
		});
		
		$("body").on("hover",".wpdevart-day", function(){
			item_hover(false,this);
		});
		
		/*
		*HOURS
		*/
		
		$("body").on("click",".wpdevart-hour-item", function() {
			item_click(true,this,false);	
        });
		
		$("body").on("hover",".wpdevart-hour-item", function(){
			item_hover(true,this);
		});
		
		function item_hover(hour,el) {
			var booking_id = $(el).closest(".booking_calendar_main_container").data('booking_id');
			var booking_widget = wpdevartBooking(booking_id, "booking_widget");
			var show_day_info_on_hover = wpdevartBooking(booking_id, "show_day_info_on_hover");
			var forNight = wpdevartBooking(booking_id, "night");
			var hours_enabled = wpdevartBooking(booking_id, "hours_enabled");
			if(hour == true) {
				var selected = "hour_selected";
				var item = "wpdevart-hour-item";
			} else {
				var selected = "selected";
				var item = "wpdevart-day";
			}	
			if(typeof id == "undefined") {
				id = 0;
			}
			if(id != 0) { 
			    if(($("#booking_calendar_main_container_"+id+" ."+selected).length != 0 || (typeof(start_index) != "undefined" && start_index != "")) && select_ex == false && ($("#wpdevart_single_day" + id).length == 0 || (hour == true && $("#wpdevart_form_hour" + id).length == 0)) && (start_index !== "" || hour == true)) {
					end_index = $("#booking_calendar_main_container_"+id+" ."+item).index(el);
					if(ajax_next == "" || hour == true) {
						if(start_index <= end_index) {
							for(var j = 0; j < start_index; j++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(j).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for(var n = end_index; n < count_item; n++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(n).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for (var i = start_index; i < end_index; i++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(i).addClass(selected);
								if(forNight == 1 && !hours_enabled){
									$("#booking_calendar_main_container_"+id+" ."+item).eq(start_index).addClass("checkin_night");
									$("#booking_calendar_main_container_"+id+" ."+item).removeClass("checkout_night");
									$(el).addClass("checkout_night");										
								}
							}
						}
						else if(start_index >= end_index){
							for(var k = start_index+1; k < count_item; k++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(k).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for(var p = 0; p < end_index; p++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(p).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for (var m = end_index; m < start_index; m++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(m).addClass(selected);
								if(forNight == 1 && !hours_enabled){
									$("#booking_calendar_main_container_"+id+" ."+item).eq(start_index).addClass("checkout_night");
									$("#booking_calendar_main_container_"+id+" ."+item).removeClass("checkin_night");
									$(el).addClass("checkin_night");
								}
							}
						}
					} else if(ajax_next == "next" && hour == false) {
						if(select_index <= end_index) {
							for(var j = 0; j < select_index; j++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(j).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for(var n = end_index; n < count_item; n++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(n).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for (var i = select_index; i < end_index; i++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(i).addClass(selected);
								if(forNight == 1 && !hours_enabled){
									$("#booking_calendar_main_container_"+id+" ."+item).eq(start_index).addClass("checkin_night");
									$("#booking_calendar_main_container_"+id+" ."+item).removeClass("checkout_night");
									$(el).addClass("checkout_night");
								}
							}
						}
						else if(select_index >= end_index){
							for(var k = select_index+1; k < count_item; k++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(k).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for(var p = 0; p < end_index; p++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(p).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for (var m = end_index; m < select_index; m++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(m).addClass(selected);
								if(forNight == 1 && !hours_enabled){
									$("#booking_calendar_main_container_"+id+" ."+item).eq(start_index).addClass("checkout_night");
									$("#booking_calendar_main_container_"+id+" ."+item).removeClass("checkin_night");
									$(el).addClass("checkin_night");
								}
							}
						}
					} else if(ajax_next == "prev" && hour == false) {
						if(select_index == 0) {
							select_index = count_item;
						}
						if(select_index <= end_index) {
							for(var j = 0; j < select_index; j++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(j).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for(var n = end_index; n < count_item; n++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(n).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for (var i = select_index; i < end_index; i++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(i).addClass(selected);
								if(forNight == 1 && !hours_enabled){
									$("#booking_calendar_main_container_"+id+" ."+item).eq(start_index).addClass("checkin_night");
									$("#booking_calendar_main_container_"+id+" ."+item).removeClass("checkout_night");
									$(el).addClass("checkout_night");
								}
							}
						}
						else if(select_index >= end_index){
							for(var k = select_index+1; k < count_item; k++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(k).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for(var p = 0; p < end_index; p++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(p).removeClass(selected).removeClass("checkout_night").removeClass("checkin_night");
							}
							for (var m = end_index; m < select_index; m++) {
								$("#booking_calendar_main_container_"+id+" ."+item).eq(m).addClass(selected);
								if(forNight == 1 && !hours_enabled){
									$("#booking_calendar_main_container_"+id+" ."+item).eq(start_index).addClass("checkout_night");
									$("#booking_calendar_main_container_"+id+" ."+item).removeClass("checkin_night");
									$(el).addClass("checkin_night");
								}
							}
						}
					}
					$(el).addClass(selected);
					
				}
			}
			if(booking_widget && show_day_info_on_hover && hour == false) {
				if($(el).find(".booking_widget_day").length == 0) {
					var day_price = "",
						day_user_info = "",
						day_availability = "";
					if($(el).find(".day-availability").length != 0) {
						day_availability = "<div class='day-availability'>"+$(el).find(".day-availability").clone().html()+"</div>";
					}
					if($(el).find(".day-price").length != 0) {
						day_price = "<div class='day-price'>"+$(el).find(".day-price").clone().html()+"</div>";
					}
					if($(el).find(".day-user-info").length != 0) {
						day_user_info = "<div class='widget-day-user-info'>"+$(el).find(".day-user-info").clone().html()+"</div>";
					}
					if(day_price != "" || day_availability != "" || day_user_info != "") {
						$(el).append("<div class='booking_widget_day'>"+day_user_info+day_availability+day_price+"</div>");
					}
				}
			}
		}
		
		
		function item_click(hour,el,edit) {
			var price = 0,
				price_div = "",
				total_div = "",
				extra_div = "",
				currency = "",
				selected_count = 0,
				div_container = $(el).closest(".booking_calendar_main_container"),
				calendar_idd = $(div_container).data("id"),
				form_container = $(div_container).find(".wpdevart-booking-form-container");		
			id = $(div_container).data('booking_id');		
			var forNight = $("#booking_calendar_main_container_"+id).data("night"),
			    offset = wpdevartBooking(id, "offset"),
			    min = wpdevartBooking(id, "min"),
			    max = wpdevartBooking(id, "max"),
			    min_hour = wpdevartBooking(id, "min_hour"),
			    max_hour = wpdevartBooking(id, "max_hour"),
			    max_item = wpdevartBooking(id, "max_item"),
			    hours_enabled = wpdevartBooking(id, "hours_enabled");
			pos = wpdevartBooking(id, "position");
			date_data = {};
			if(hour == true) {
				var selected = "hour_selected";
				var available = "wpdevart-hour-available";
				var item = "wpdevart-hour-item";
				var for_hidden = "#wpdevart_start_hour"+id;
				var for_hidden_end = "#wpdevart_end_hour"+id;
			} else {
				var selected = "selected";
				var available = "wpdevart-available";
				var item = "wpdevart-day";
				var for_hidden = "#wpdevart_form_checkin"+id;
				var for_hidden_end = "#wpdevart_form_checkout"+id;
			}	
			/*if(typeof edit != "undefined") {
				existtt = true;
			}*/
			if(!$(el).hasClass(available)  && $("#booking_calendar_main_container_"+id+" ."+selected).length == 0 || $(item).parent().hasClass("wpdevart-day-hours")){
				return false;
			}		

			if(($("#wpdevart_form_checkin" + id).length != 0 || (hour == true && $("#wpdevart_start_hour" + id).length != 0))) {
				selected_count = $("#booking_calendar_main_container_"+id+" ."+item+"."+selected).length;
				selected_av_count = $("#booking_calendar_main_container_"+id+" ."+available+"."+selected).length;				
				if(select_ex == true) {
					$("#booking_calendar_main_container_"+id+" ."+item).each(function() {
						$(this).removeClass(selected).removeClass("checkin_night");
					});
					/*$(for_hidden).val($(el).data("date"));
					$(for_hidden_end).val($(el).data("date"));
					$(el).addClass(selected);*/
					select_ex = false;
				}
				if(selected_count == 0 || existtt == true) {
					ajax_next = "";
					$(el).addClass(selected);
					if(forNight == 1 && !hours_enabled)
						$(el).addClass("checkin_night");
					start_index = $("#booking_calendar_main_container_"+id+" ."+item).index(el);
					selected_date = $("#booking_calendar_main_container_"+id+" ."+item).eq(start_index).data("date");
					selected_dateformat= $("#booking_calendar_main_container_"+id+" ."+item).eq(start_index).data("dateformat");
				} 
				else {
					if(existtt == false)
					select_ex = true;
				}
				
				if(select_ex == true){
					var exist = false; console.log(hours_enabled , hour == true);
					for(var k=0; k<$("#booking_calendar_main_container_"+id+" ."+selected).length; k++){
						if(typeof($("#booking_calendar_main_container_"+id+" ."+selected).eq(k).data("available")) == "undefined" || (hours_enabled && hour == true && $("#booking_calendar_main_container_"+id+" ."+selected).eq(k).data("available") == 0)) {
							if((forNight == 1 && ($("#booking_calendar_main_container_"+id+" ."+selected).length - 1) == k && exist == false)) {
								break;
							}
							exist = true;
						}
					}
					
					/**/
					if(ajax_next == "") {
						if(start_index >= $("#booking_calendar_main_container_"+id+" ."+item).index(el)){
							check_indateformat = $(el).data("dateformat");
							check_outdateformat = selected_dateformat;
							check_indate = $(el).data("date");
							check_outdate = selected_date;
						}
						else {
							check_indateformat = selected_dateformat;
							check_outdateformat = $(el).data("dateformat");
							check_indate = selected_date;
							check_outdate = $(el).data("date");
						}
					} else if(ajax_next == "next"){
						if(select_index) {
							if(select_index >= $("#booking_calendar_main_container_"+id+" ."+item).index(el)){
								check_indateformat = $(el).data("dateformat");
								check_outdateformat = selected_dateformat;
								check_indate = $(el).data("date");
								check_outdate = selected_date;
							}
							else {
								check_indateformat = selected_dateformat;
								check_outdateformat = $(el).data("dateformat");
								check_indate = selected_date;
								check_outdate = $(el).data("date");
							}
						} else {
							check_indateformat = selected_dateformat;
							check_outdateformat = $(el).data("dateformat");
							check_indate = selected_date;
							check_outdate = $(el).data("date");
						}
					} else if(ajax_next == "prev"){
						if(select_index) {
							if(select_index >= $("#booking_calendar_main_container_"+id+" ."+item).index(el)){
								check_indateformat = $(el).data("dateformat");
								check_outdateformat = selected_dateformat;
								check_indate = $(el).data("date");
								check_outdate = selected_date;
							}
							else {
								check_indateformat = selected_dateformat;
								check_outdateformat = $(el).data("dateformat");
								check_indate = selected_date;
								check_outdate = $(el).data("date");
							}
						} else {
							check_indateformat = $(el).data("dateformat");
							check_outdateformat = selected_dateformat;
							check_indate = $(el).data("date");
							check_outdate = selected_date;
						}	
					}
					/*@ndhanracnel*/
					
					var diffDays = wpdevartDateDiff(check_indate,check_outdate);
					if(exist == true) {
						reservationError(div_container,id,item,selected,offset,"error_days");
					} 
					/*Price for night*/
					else if( forNight == 1 && diffDays == 0 && !hours_enabled && !hour == true){
						reservationError(div_container,id,item,selected,offset,"error_night");
					}
					/*Min day/hour count*/
					else if( (forNight == 1 && diffDays < min) || (forNight == 0 && diffDays < (min - 1)) || (hours_enabled && hour == true && selected_count < min_hour)){
						var html = (hours_enabled && hour == true) ? "error_min_hour" : "error_min_day";
						reservationError(div_container,id,item,selected,offset,html);
					}
					/*Max day/hour count*/
					else if( diffDays > (max - 1) || (hours_enabled && hour == true && selected_count > max_hour)){
						var html = (hours_enabled && hour == true) ? "error_max_hour" : "error_max_day";
						reservationError(div_container,id,item,selected,offset,html);
					}
					else {
						$(div_container).find(".error_text_container,.successfully_text_container").fadeOut(10);
						var av_min = $("#booking_calendar_main_container_"+id+" ."+selected).eq(0).data("available");
						for(var i = 1; i < selected_count; i++) {
							if($("#booking_calendar_main_container_"+id+" ."+selected).eq(i).data("available") < av_min && $("#booking_calendar_main_container_"+id+" ."+selected).eq(i).hasClass(available)) {
								av_min = $("#booking_calendar_main_container_"+id+" ."+selected).eq(i).data("available");
							}
						}
						if(av_min <= 0) {
							var html = (hours_enabled && hour == true) ? "error_days" : "error_days";
							reservationError(div_container,id,item,selected,offset,html);
						} else {
							if(!edit && $("#wpdevart_count_item"+id).length != 0){
								$("#wpdevart_count_item"+id+" option").remove();
								for(var j = 1; j <= av_min; j++){
									if(max_item != false && max_item < j){
										break;
									}
									$("#wpdevart_count_item"+id).append("<option value='"+j+"'>"+j+"</option>");
								}
							}
							$(for_hidden).val(check_indate);
							$(for_hidden_end).val(check_outdate);
							$("#wpdevart-submit" + id).show();
							$("#wpdevart_booking_form_" + id).show();
							
							if(hours_enabled && hour == true) {
								if(!edit){
									reservation_info(el,price,price_div,total_div,extra_div,currency,id,extra_price_value,check_indateformat,check_outdateformat,item_count,false,selected_av_count,pos,selected);
								}
								$(window).scrollTo( $(form_container), 400,{'offset':{'top':-(offset)}});
							} else {
								if(!edit){
									$.get(wpdevart.ajaxUrl, {
										action: 'wpdevart_get_interval_dates',
										wpdevart_start_date: check_indate,
										wpdevart_end_date: check_outdate,
										wpdevart_id: calendar_idd,
										wpdevart_nonce: wpdevart.ajaxNonce
									}, function (data) {
										date_data = JSON.parse(data);
										if(date_data == 0){
											$(div_container).find(".error_text_container").html(wpdevartBooking(id, "error_days")).fadeIn();
											$(div_container).find(".successfully_text_container,.email_error").fadeOut();
											$(window).scrollTo( $(div_container).find(".error_text_container"), 400,{'offset':{'top':-(offset)}});
											$("#booking_calendar_main_container_"+id+" ."+item).each(function(){
												$(this).removeClass(""+selected);
											});
											remove_select_data(id);
											exist = false;
										} else {
											reservation_info(el,price,price_div,total_div,extra_div,currency,id,extra_price_value,check_indateformat,check_outdateformat,item_count,false,selected_av_count,pos,selected,date_data);
											$(window).scrollTo( $(form_container), 400,{'offset':{'top':-(offset)}});
										}
									});
								}
							}
						}
						
					} 
					existtt= true;
				} else { existtt = false; }
			} else if($("#wpdevart_single_day" + id).length != 0 || (hour == true && $("#wpdevart_form_hour" + id).length != 0)) {
				var res_id = 0;
				if($("input[name='reserv_id']").length){
					res_id = $("input[name='reserv_id']").val();
				}
				if(hour == true) {
					var for_hidden_single = "#wpdevart_form_hour"+id;
				} else {
					var for_hidden_single = "#wpdevart_single_day"+id;
				}	
				$("#booking_calendar_main_container_"+id+" ."+item).each(function(){
					$(this).removeClass(selected);
				});
				if((typeof($(el).data("available")) != "undefined" && $(el).data("available") > 0) || $(el).hasClass("wpdevart-unavailable")) {
					$(el).addClass(selected);
					$(for_hidden_single).val($(el).data("date"));
					$(div_container).find(".error_text_container,.successfully_text_container").fadeOut(10);
					if(!edit && $("#wpdevart_count_item"+id).length != 0){
						$("#wpdevart_count_item"+id+" option").remove();
					}
					if($(div_container).hasClass("hours_enabled") && hour == false) {
						$(div_container).find('.wpdevart-hours-container').show();
						$(div_container).find('.wpdevart-hours-overlay').show();
						$.post(wpdevart.ajaxUrl, {
							action: 'wpdevart_ajax',
							wpdevart_reserv_id: res_id,
							wpdevart_selected_date: $(el).data("date"),
							wpdevart_hours: true,
							wpdevart_id: $(div_container).data('id'),
							wpdevart_nonce: wpdevart.ajaxNonce
						}, function (data) {
							$(div_container).find('div.wpdevart-hours').replaceWith(data);
							$(div_container).find('.wpdevart-hours-overlay').hide();
						});
					} else {
						if(!edit && $("#wpdevart_count_item"+id).length != 0){
							for(var j = 1; j <= ($(el).data("available")); j++){
								if(max_item != false && max_item < j){
									break;
								}
								$("#wpdevart_count_item"+id).append("<option value='"+j+"'>"+j+"</option>");
							}
						}
						$("#wpdevart-submit" + id).show();
						$("#wpdevart_booking_form_" + id).show();
						
						if(hours_enabled && hour == true) {
							if(!edit){
								reservation_info(el,price,price_div,total_div,extra_div,currency,id,extra_price_value,check_in,check_out,item_count,$(el).data("dateformat"),1,pos,selected,date_data);
							}
						    $(window).scrollTo( $(form_container), 400,{'offset':{'top':-(offset)}});
						} else {
							if(!edit){ 
								$.get(wpdevart.ajaxUrl, {
									action: 'wpdevart_get_interval_dates',
									wpdevart_start_date: $(el).data("date"),
									wpdevart_end_date: $(el).data("date"),
									wpdevart_id: calendar_idd,
									wpdevart_nonce: wpdevart.ajaxNonce
								}, function (data) {
									date_data = JSON.parse(data);
									if(date_data == 0){
										$(div_container).find(".error_text_container").html(wpdevartBooking(id, "error_day")).fadeIn();
										$(window).scrollTo( $(div_container).find(".error_text_container"), 400,{'offset':{'top':-(offset)}});
										$(form_container).find(for_hidden_single).val("");
										exist = false;
									} else {
										reservation_info(el,price,price_div,total_div,extra_div,currency,id,extra_price_value,check_in,check_out,item_count,$(el).data("dateformat"),1,pos,selected,date_data);
										$(window).scrollTo( $(form_container), 400,{'offset':{'top':-(offset)}});
									}
								});
							}
						}
					}
				} else {
					if(edit == false){
						$(div_container).find(".error_text_container").html(wpdevartBooking(id, "error_day")).fadeIn();
						$(window).scrollTo( $(div_container).find(".error_text_container"), 400,{'offset':{'top':-(offset)}});
						$(form_container).find(for_hidden_single).val("");
					} else {
						$(el).addClass(selected);
					}
				}
			}
			if(edit === true){
				select_ex = true;
				edit = false;
			}
		}
		
		
		
		
		$("body").on("click",".notice_text_close", function(){
			$(this).parent().fadeOut(10);
		});
		$(function() {
			$( ".datepicker" ).datepicker({
			  dateFormat: "yy-mm-dd"
			});
		});

		wpdevart_responsive();
			
		$("body").on("click",'.wpdevart-day-hours',function(event){
			event.stopPropagation();
		});
	}

	wpdevartScriptOb = new wpdevartScript();	
});
jQuery( document ).ajaxComplete(function() {
	wpdevart_responsive();
});

function reservationError(div_container,id,item,selected,offset,type) {
	jQuery(div_container).find(".successfully_text_container,.error_text_container").fadeOut();
	jQuery(div_container).find(".error_text_container").html(wpdevartBooking(id, type)).fadeIn();
	jQuery(window).scrollTo( jQuery(div_container).find(".error_text_container"), 400,{'offset':{'top':-(offset)}});
	jQuery("#booking_calendar_main_container_"+id+" ."+item).each(function(){
		jQuery(this).removeClass(selected);
	});
	remove_select_data(id);
	exist = false;
}

function remove_select_data(id) {
	jQuery("#wpdevart_form_checkin"+id).val('');
	jQuery("#wpdevart_form_checkout"+id).val('');
	jQuery("#wpdevart-submit"+id).hide();
	jQuery("check-info-"+id).html(jQuery("check-info-"+id).data("content"));
}

function wpdevart_set_value(id,value) {
	jQuery("#"+id).val(value);
}

function change_count(el,id,pos,currency) {
	var price = 0,
		old_price = 0,
		total_price = 0,
		extra_price_value = 0,
		extraprice = 0,
		old_total = 0,
		booking_id = jQuery(el).closest(".booking_calendar_main_container").data('booking_id'),
		form_container = jQuery(el).closest(".wpdevart-booking-form-container"),
		forNight = wpdevartBooking(booking_id, "night"),
	    hours_enabled = wpdevartBooking(booking_id, "hours_enabled"),
	    item_count = jQuery(el).val();
		
	if(hours_enabled) {	
	 	selected_count = jQuery(form_container).prev().find(".wpdevart-hour-available.hour_selected").length;
    } else {
	 	selected_count = (forNight == 1 && date_data.length > 1) ? (date_data.length - 1) : date_data.length;
	}
	
	
	old_price = jQuery(form_container).find(".price").length != 0 ? parseFloat(jQuery(form_container).find(".price").data("price")) : 0;
	price = jQuery(form_container).find(".price").length != 0 ? parseFloat(jQuery(form_container).find(".price span").html()) : 0;
	total_price = old_price*(jQuery(el).val());
	old_total = parseFloat(jQuery(form_container).find(".start_total_price span").html());
	if(jQuery(form_container).find(".wpdevart-extra-info").length != 0) {
		jQuery(form_container).find(".wpdevart-extra-info").each(function(i, e){
			var extra = jQuery("#wpdevart_extra_field" + (i + 1));
			if(jQuery(this).find("span:first-child").html() != "") {
				if(jQuery(this).find("input.extra_price_value").val() != "") {
					operation = jQuery(this).find(".extra_price").data("extraop");
					extraprice = jQuery(this).find(".extra_price").data("extraprice");
					if( jQuery(this).find(".extra_percent").length != 0 && jQuery(this).find(".extra_percent").is(":visible")) {
						jQuery(this).find("input.extra_price_value").val(operation+(extraprice*(old_price*(jQuery(el).val()))/100));
						jQuery(this).find("span.extra_price_value").html(operation+(pos=="before" ? currency : "")+(extraprice*(old_price*(jQuery(el).val()))/100)+(pos=="after" ? currency : ""));
						extra_price_value += operation + (extraprice*(old_price*(jQuery(el).val()))/100);
						total_price = (operation == "+")? (total_price + (extraprice*(old_price*(jQuery(el).val()))/100)) : (total_price - (extraprice*(old_price*(jQuery(el).val()))/100));
					} else {			
			
						var indep_count_price = extraprice;
						if(!extra.hasClass("wpdevart-independent_counts")) {
							var indep_count_price = extraprice * item_count;
						}
						
						jQuery(this).find("input.extra_price_value").val(operation + indep_count_price);
						jQuery(this).find("span.extra_price_value").html(operation + (pos=="before" ? currency : "") + indep_count_price + (pos=="after" ? currency : ""));
						total_price = (operation == "+")? (total_price + indep_count_price) : (total_price - indep_count_price);
						extra_price_value += operation + indep_count_price;
					}
				}
			}
		});
	} else {
		total_price = (old_total-price)+(old_price*(jQuery(el).val()));
	}
	jQuery(form_container).find(".start_total_price span").html(total_price);
	if(jQuery(form_container).find(".price").length != 0)
		jQuery(form_container).find(".price span").html(old_price*(jQuery(el).val()));
	jQuery(form_container).find(".wpdevart_extra_price_value").val(eval(extra_price_value));
	if(isNaN(total_price)){
		total_price = eval(extra_price_value);	
	}
	jQuery(form_container).find(".wpdevart_total_price_value").val(total_price);	
	jQuery(form_container).find(".wpdevart_price_value").val(old_price*(jQuery(el).val()));
	changeTotalPrice(pos,total_price,selected_count,form_container,currency,booking_id);

	if(jQuery(form_container).find(".count_item").length != 0) {
		jQuery(form_container).find(".count_item").html(jQuery(el).val());
	}
}
function change_extra(el,pos,currency) {
	var id = jQuery(el).attr("id"),
		form_container = jQuery(el).closest(".wpdevart-booking-form-container"),
	    thisprice =  jQuery(el).find("option:selected").data("price"),
	    thisop =  jQuery(el).find("option:selected").data("operation"),
	    label =  jQuery(el).find("option:selected").data("label"),
	    thistype =  jQuery(el).find("option:selected").data("type"),
	    extraprice =  ((jQuery(form_container).find("."+id+" input.extra_price_value").val())? parseFloat(jQuery(form_container).find("."+id+" input.extra_price_value").val()) : 0),
	    extraop =  jQuery(form_container).find("."+id+" .extra_price").data("extraop"),
	    item_count =  (jQuery(form_container).find(".wpdevart_count_item").length !=0)? jQuery(form_container).find(".wpdevart_count_item").val() : 1,
	    total_price =  0,
	    extra_price_value =  0,
		total = parseFloat(jQuery(form_container).find(".start_total_price span").html()),
		price = parseFloat(jQuery(form_container).find(".price span").html()),
	 	new_total = (extraop == "+") ? (total - Math.abs(extraprice)) : (total + Math.abs(extraprice)),
		booking_id = jQuery(el).closest(".booking_calendar_main_container").data('booking_id'),
		forNight = wpdevartBooking(booking_id, "night"),
		hours_enabled = wpdevartBooking(booking_id, "hours_enabled");
		
	if(hours_enabled) {	
	 	selected_count = jQuery(form_container).prev().find(".wpdevart-hour-available.hour_selected").length;
    } else {
	 	selected_count = (forNight == 1 && date_data.length > 1) ? (date_data.length - 1) : date_data.length;
	}
	if(jQuery(form_container).find("."+id).length != 0) {
		jQuery(form_container).find("."+id+" .extra_price").data("extraop", thisop);
		jQuery(form_container).find("."+id+" .option_label").html(label);
		if(thisprice) {
			if(!jQuery(el).hasClass("wpdevart-independent") && !jQuery(el).hasClass("wpdevart-independent_counts")) {
				var indep_price = thisprice * selected_count * item_count;
			}  
			else if(jQuery(el).hasClass("wpdevart-independent") && jQuery(el).hasClass("wpdevart-independent_counts")) {
				var indep_price = thisprice;
			} 
			else if(jQuery(el).hasClass("wpdevart-independent")) {
				var indep_price = thisprice * item_count;
			} 
			else if(jQuery(el).hasClass("wpdevart-independent_counts")){
				var indep_price = thisprice * selected_count;
			}
			
			if(thistype == "price") {
				jQuery(form_container).find("."+id+" span.extra_price_value").html(thisop+(pos=="before" ? currency : "")+ indep_price +(pos=="after" ? currency : ""));
				jQuery(form_container).find("."+id+" input.extra_price_value").val(thisop+indep_price);
				jQuery(form_container).find("."+id+" .extra_percent").hide();
				jQuery(form_container).find("."+id+" .extra_price").show();
				if(jQuery(el).hasClass("wpdevart-independent")) {
					jQuery(form_container).find("."+id+" .extra_price").data("extraprice", thisprice);
				} else {
					jQuery(form_container).find("."+id+" .extra_price").data("extraprice", (thisprice*selected_count));
				}
				
				total_price = (thisop == "+")? (new_total + indep_price) : (new_total - indep_price);				
			} else {
				if(isNaN(price)) {
					var new_price = 0;
				} else {
					var new_price = (price*thisprice)/100;
				}
				jQuery(form_container).find("."+id+" span.extra_price_value").html(thisop+(pos=="before" ? currency : "")+new_price+(pos=="after" ? currency : ""));
				jQuery(form_container).find("."+id+" input.extra_price_value").val(thisop+new_price);
				jQuery(form_container).find("."+id+" .extra_percent").html(thisprice+"%").show();
				jQuery(form_container).find("."+id+" .extra_price").show();
				jQuery(form_container).find("."+id+" .extra_price").data("extraprice", thisprice);
				total_price = (thisop == "+")? (new_total + new_price) : (new_total - new_price);
			}
		} else {
			jQuery(form_container).find("."+id+" span.extra_price_value").html("");
			jQuery(form_container).find("."+id+" input.extra_price_value").val("");
			jQuery(form_container).find("."+id+" .extra_percent,."+id+" .extra_price").hide();
			total_price = new_total;
		}
		jQuery(form_container).find("input.extra_price_value").each(function(){
			extra_price_value += jQuery(this).val();
		});
		jQuery(form_container).find(".start_total_price span").html(total_price);
		
		if(isNaN(total_price)){
			total_price = eval(extra_price_value);	
		}
		jQuery(form_container).find(".wpdevart_total_price_value").val(total_price);	
		jQuery(form_container).find(".wpdevart_extra_price_value").val(eval(extra_price_value));
		changeTotalPrice(pos,total_price,selected_count,form_container,currency,booking_id);
	}
	
}

function reservation_info(el,price,price_div,total_div,extra_div,currency,id,extra_price_value,check_in,check_out,item_count,single_date,selected_count,pos,selected,date_data) {
	/*Reservation info*/
	var day_info = "";
	var form_container = jQuery(el).closest(".booking_calendar_container").next(),
		booking_id = jQuery(el).closest(".booking_calendar_main_container").data('booking_id'),
		hours_enabled = wpdevartBooking(booking_id, "hours_enabled"),
		total_tr = wpdevartBooking(booking_id, "total"),
		hide_price = wpdevartBooking(booking_id, "hide_price"),
		forNight = wpdevartBooking(booking_id, "night");
	if(hours_enabled) {
		jQuery(el).parent().find("."+selected).each(function(index,sel_element) {
		if(jQuery(sel_element).find(".new-price").length != 0) {
			price += parseFloat(jQuery(sel_element).find(".new-price").data("price"));
		}
		currency = jQuery(sel_element).data("currency");
	});
	} else { 
		selected_count = (forNight == 1 && date_data.length > 1) ? (date_data.length - 1) : date_data.length;
		var i = 0;
		jQuery.each(date_data, function (index, value) {
			i++;
			current_date = JSON.parse(value.data);
			if(forNight == 1 && date_data.length > 1){
				if(i <= date_data.length - 1)
					price += parseFloat(current_date.price);
			} else {
				price += parseFloat(current_date.price);
			}
			currency = jQuery(el).parent().find("."+selected).data("currency");
		});
	}
	if(isNaN(price)){
		price = 0;
	}
	var total_price = price;
	
	if(jQuery(form_container).find(".wpdevart_count_item").length != 0) {
		item_count = "<div class='reserv_info_row'><span class='reserv_info_cell'>" +  (jQuery(form_container).find(".wpdevart_count_item").closest(".wpdevart-fild-item-container").find("label").html()) + "</span><span class='reserv_info_cell_value count_item'>1</span></div>";
	}
	if(jQuery(form_container).find(".wpdevart_extras").length != 0) {
		jQuery(form_container).find(".wpdevart_extras").each(function(sel_index,select){
			var label = jQuery(select).parent().parent().find("label").html(),
				option_label = jQuery(select).find("option:selected").data("label"),
				operation = jQuery(select).find("option:selected").data("operation"),
				type = jQuery(select).find("option:selected").data("type"),
				opt_price = parseFloat(jQuery(select).find("option:selected").data("price"));
				if(isNaN(opt_price)){
					opt_price = 0;
				}
				if(jQuery(this).hasClass("wpdevart-independent")) {
					var indep_price = opt_price;
				} else {
					var indep_price = opt_price * selected_count;
				}
				
				
			
			if(type == "price") {
				if(opt_price != 0 || opt_price != "") {
					var option_info = "<span class='extra_percent' style='display:none;'></span><span class='extra_price' data-extraprice='"+(indep_price)+"' data-extraop='"+operation+"' style='display:inline-block;'><span class='extra_price_value'>"+operation+((pos == "before") ? currency : "")+(indep_price)+((pos == "after") ? currency : "")+"</span></span><input type='hidden' class='extra_price_value' value='"+operation+(indep_price)+"'>";
				} else {
					var option_info = "<span class='extra_percent' style='display:none;'></span><span class='extra_price' data-extraprice='"+opt_price+"' data-extraop='"+operation+"'  style='display:none;'><span class='extra_price_value'></span></span><input type='hidden' class='extra_price_value' value=''>";
				}
				total_price = (operation == "+")? (total_price + indep_price) : (total_price - indep_price);
				extra_price_value += operation+indep_price;
			} else {
				if(opt_price != 0 || opt_price != "") {
					var option_info = "<span class='extra_percent'>"+operation+opt_price+"%</span><span class='extra_price' data-extraprice='"+opt_price+"' data-extraop='"+operation+"'  style='display:inline-block;'><span class='extra_price_value'>"+operation+((pos == "before") ? currency : "")+((price * opt_price)/100)+((pos == "after") ? currency : "")+"</span></span><input type='hidden' class='extra_price_value' value='"+operation+((price * opt_price)/100)+"'>";
				} else {
					var option_info = "<span class='extra_percent'></span><span class='extra_price' data-extraprice='"+opt_price+"' data-extraop='"+operation+"'  style='display:none;'><span class='extra_price_value'></span></span><input type='hidden' class='extra_price_value' value=''>";
				}
				total_price = (operation == "+")? (total_price + ((price * opt_price)/100)) : (total_price - ((price * opt_price)/100));
				extra_price_value += operation+((price * opt_price)/100);
			}
			extra_div += "<div class='wpdevart-extra-info wpdevart-extra-"+sel_index+" reserv_info_row "+(jQuery(select).attr("id"))+"' data-id='"+(jQuery(select).attr("id"))+"'><span class='reserv_info_cell'>"+label+"</span><span class='reserv_info_cell_value'><span class='option_label'>"+option_label+"</span>"+option_info+"</span></div>";
			
		});
	}
	if(isNaN(total_price)){
		total_price = eval(extra_price_value);	
	}
	if(price != 0) {
		price_div = (hide_price == 1) ? "" : "<div class='reserv_info_row'><span class='reserv_info_cell'>"+(jQuery(el).closest(".booking_calendar_main_container").data("price"))+"</span><span class='reserv_info_cell_value price' data-price='"+price+"'>"+((pos == "before") ? currency : "")+"<span>"+price+"</span>"+((pos == "after") ? currency : "")+"</span></div>";
	}
	total_div = (hide_price == 1) ? "" : "<div class='wpdevart-total-price reserv_info_row'><span class='reserv_info_cell'>" + total_tr + "</span><span class='reserv_info_cell_value total_price'><span class='start_total_price'>"+((pos == "before") ? currency : "")+"<span>" + total_price + "</span>"+((pos == "after") ? currency : "")+"</span><span class='sale_total_price'></span></span></div>";
	
	if(single_date === false) {
		if(hours_enabled) {
			day_info = "<div class='reserv_info_row'><span class='reserv_info_cell'>" + wpdevart.date + "</span><span class='reserv_info_cell_value'>"+jQuery(form_container).closest(".booking_calendar_main_container").find(".selected").data("dateformat")+"</span></div>";
		}		
		jQuery(form_container).find(".check-info").html(day_info + "<div class='reserv_info_row'><span class='reserv_info_cell'>" + jQuery(form_container).find("label.wpdevart_form_checkin").html() + "</span><span class='reserv_info_cell_value'>"+check_in+"</span></div><div class='reserv_info_row'><span class='reserv_info_cell'>" + jQuery(form_container).find("label.wpdevart_form_checkout").html() + "</span><span class='reserv_info_cell_value'>"+check_out+"</span></div>"+item_count+price_div+extra_div+total_div+"");
	} else {
		if(hours_enabled) {
			jQuery(form_container).find(".check-info").html("<div class='reserv_info_row'><span class='reserv_info_cell'>" + wpdevart.date + "</span><span class='reserv_info_cell_value'>"+jQuery(form_container).closest(".booking_calendar_main_container").find(".selected").data("dateformat")+"</span></div><div class='reserv_info_row'><span 	class='reserv_info_cell'>" + wpdevart.hour + "</span><span class='reserv_info_cell_value'>"+single_date+"</span></div>"+item_count+price_div+extra_div+total_div);
		} else {
			jQuery(form_container).find(".check-info").html("<div class='reserv_info_row'><span 	class='reserv_info_cell'>" + wpdevart.date + "</span><span class='reserv_info_cell_value'>"+single_date+"</span></div>"+item_count+price_div+extra_div+total_div);
		}
	}
	jQuery(form_container).find(".wpdevart_extra_price_value").val(eval(extra_price_value));
    jQuery(form_container).find(".wpdevart_total_price_value").val(total_price);	
	jQuery(form_container).find(".wpdevart_price_value").val(price);
	changeTotalPrice(pos,total_price,selected_count,form_container,currency,booking_id);
}
function changeTotalPrice(pos,total_price,day_count,form_container,currency,booking_id){
	hours_enabled = wpdevartBooking(booking_id, "hours_enabled");
	conditions = hours_enabled ? wpdevartBooking(booking_id, "hours_conditions") : wpdevartBooking(booking_id, "conditions");
	conditions = jQuery.parseJSON( conditions );
    if(conditions !== null && conditions){
		var ex = 0;
		var index = 0;
		jQuery.each( conditions.count, function(i, el){
			if(day_count == el){
				ex = 1;
				index = i;
			}
		} );
		if(ex == 1){
			var type = (typeof conditions.type != "undefined") ? conditions.type[index] : "percent";
			if(type == "percent"){
				var total = total_price - (total_price * conditions.percent[index])/100;
				jQuery("#wpdevart_sale_type" + booking_id ).val("percent");
			} else{
				var total = total_price - conditions.percent[index];
				jQuery("#wpdevart_sale_type" + booking_id ).val("price");
			}
			var sale = (type == "percent") ? conditions.percent[index] + "%" : (((pos == "before") ? currency : "") + (conditions.percent[index] + ((pos == "after") ? currency : "")));
			jQuery(form_container).find(".sale_total_price").html("<span class='sale_percent'>-" + sale +"</span><span>"+((pos == "before") ? currency : "")+"<span>" + total + "</span>"+((pos == "after") ? currency : "")+"</span>");
			jQuery(form_container).find(".wpdevart_total_price_value").val(total);
			if(!jQuery(form_container).find(".sale_percent_value").length){
				jQuery(form_container).find("form").append('<input type="hidden" class="sale_percent_value" id="sale_percent_value' + booking_id + '" name="sale_percent_value' + booking_id + '" value="' + conditions.percent[index] + '">');
			} else {
				jQuery(form_container).find(".sale_percent_value").val(conditions.percent[index]);
			}
		} else {
			jQuery(form_container).find(".sale_total_price").html();
			jQuery(form_container).find(".sale_percent_value").remove();
		}
	}
}
function wpdevart_responsive(){
	jQuery(".booking_calendar_main_container").each(function(index,el){
		if(jQuery(el).width() < 450 || jQuery("body").width() < 470) {
			jQuery(el).addClass("wpdevart-responsive");
			jQuery(el).next().addClass("wpdevart-responsive");
		}else {
			jQuery(el).find(".wpda-month-name").show();
		}
	});
}

function wpdevart_required(submit) {
	var label = "",
		tag_name = "",
		type = "",
		error = false,
		error_email = false,
		booking_id = jQuery(submit).closest(".booking_calendar_main_container").data('booking_id'),
		offset = wpdevartBooking(booking_id, "offset");
	if(jQuery(submit).closest("form").find(".wpdevart-required:not(span)").length != 0 || jQuery(submit).closest("form").find(".wpdevart-email").length != 0) {
		jQuery(submit).closest("form").find(".wpdevart-required:not(span),.wpdevart-email").each(function(index,el){
			label = jQuery(el).closest(".wpdevart-fild-item-container").find("label").text();
			tag_name = jQuery(el).prop("tagName");
			type = jQuery(el).attr("type");
			if(tag_name == "INPUT") {
				if(type == "text") {
					if(jQuery(el).val().trim() == "" && !jQuery(el).hasClass("wpdevart-email")) {
						error = true;
					}
					if(jQuery(el).hasClass("wpdevart-email") && validate_email(jQuery(el).val())) {
						if(jQuery(el).val().trim() == "" && jQuery(el).hasClass("wpdevart-required")) {
							error = true;
						}
						if(jQuery(el).val() != "" && !jQuery(el).hasClass("wpdevart-required")){
							error_email = true;
						}else if(jQuery(el).hasClass("wpdevart-required")) {
							error_email = true;
						}
					}
				} else if(type == "checkbox" || type == "radio") {
					if(typeof jQuery(el).attr("checked") == "undefined") {
						error = true;
					} 
				} else if(type == "file"){
					if(jQuery(el).val().trim() == "") {
						error = true;
					}
				}
			} else if(tag_name == "SELECT") {
				if(jQuery(el).find("option:selected").val() == "") {
					error = true;
				}
			} else if(tag_name == "TEXTAREA") {
				if(jQuery(el).val().trim() == "") {
					error = true;
				}
			}
			if(error === true) {
				alert(label + ": " + wpdevart.required);
				jQuery(el).focus();
				jQuery(window).scrollTo( jQuery(el), 400,{'offset':{'top':-(offset)}});
				return false;
			} else if(error_email === true) {
				alert(wpdevart.emailValid);
				jQuery(el).focus();
				jQuery(window).scrollTo( jQuery(el), 400,{'offset':{'top':-(offset)}});
				return false;
			} 
		});
	}
	if(error === true || error_email === true) {
		return false;
	} else {
		return true;
	}	
}

function validate_email(email) {
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!filter.test(email)) {
		return true;
	} else {
		return false;
	}	
}

function wpdevartec_submit(el,booking_id){
	var reserv_data = {};
	var booking_id = jQuery(el).closest(".booking_calendar_main_container").data('booking_id');
	var offset = wpdevartBooking(booking_id, "offset");
	el.closest("form").find("input[type=text],button,input[type=hidden],input[type=checkbox],input[type=radio],select,textarea").each(function(index,element){
		if(jQuery(element).is("input[type=checkbox]")) {
			if(jQuery(element).is(':checked')) {
				reserv_data[jQuery(element).attr("name")] = "on";
			} else {
				reserv_data[jQuery(element).attr("name")] = "";
			}
		} else if(jQuery(element).is("select") && jQuery(element).attr("multiple") == "multiple"){
			if(jQuery(element).val()) {
				var multy_select = jQuery(element).val().join("|wpdev|");
				reserv_data[jQuery(element).attr("name")] = multy_select;
			}
		}else {
			reserv_data[jQuery(element).attr("name")] = jQuery(element).val();
		}
	});
	
	var form_data = new FormData();
	var k = 0;
	var error = 0;
	jQuery.each(el.closest("form").find("input[type=file]"), function() {
		var input_name = jQuery(this).attr("name");
		var label = jQuery(this).closest(".wpdevart-fild-item-container").find("label").text();
		var size = jQuery(this).data("size") * 1000;
		var type = jQuery(this).data("type");
		type = type.split(",");
		jQuery.each(this.files, function(i, file) {
		    var file_type =  file.name.split('.').pop().toLowerCase();
			console.log(file,size, file.size);
			if(size != "" && size < file.size){
				alert(label + ": " + wpdevart.file_size);
				error++;
				return false;
			}
			else if(type != "" && type.indexOf(file_type) == -1){
				alert(label + ": " + wpdevart.file_type);
				error++;
				return false;
			}
			form_data.append(input_name, file);
		});
		k++;
		if(error > 0){
			jQuery(this).focus();
			jQuery(window).scrollTo( jQuery(this), 400,{'offset':{'top':-(offset)}});
			return false;
		}
	});
	if(error > 0)
			return false;
	
	
	reserv_json = JSON.stringify(reserv_data);
	
	form_data.append("action" , "wpdevart_form_ajax");
	form_data.append("wpdevart_data" , reserv_json);
	form_data.append("wpdevart_id" , wpdevartBooking(booking_id,"id"));
	form_data.append("wpdevart_submit" , el.attr('id').replace("wpdevart-submit", ""));
	form_data.append("wpdevart_nonce" , wpdevart.ajaxNonce);
	el.addClass("load");
	var reserv_form = el.closest("form");
	var reserv_cont = el.closest(".booking_calendar_main_container");
	var form_div = el.closest(".wpdevart-booking-form-container");
	
	jQuery.ajax( {
		url: wpdevart.ajaxUrl,
		type: 'POST',
		data: form_data,
		cache: false,
		//dataType: 'json',
		processData: false,
		contentType: false,
		success: function (data) {
			if(jQuery(form_div).hasClass("hide_form") || jQuery(form_div).hasClass("cal_width_pay")) {
				jQuery(form_div).hide();
			} 
			jQuery(reserv_cont).find('div.booking_calendar_main').replaceWith(data);
			jQuery(reserv_cont).find('div.selected').removeClass("selected");
			jQuery(reserv_form).find("input[type=text],input[type=hidden],textarea").each(function(index,element){
				jQuery(element).val("");
			});
			jQuery(reserv_form).find("select").each(function(index,element){
				jQuery(element).find("option:selected").removeAttr("selected");
			});
			jQuery(reserv_form).find("input[type=checkbox],input[type=radio]").each(function(index,element){
				jQuery(element).find(":checked").removeAttr("checked");
			});
			jQuery(reserv_form).find(".wpdevart-submit").removeClass("load").hide();
			jQuery(window).scrollTo( reserv_cont, 400,{'offset':{'top':-(wpdevartBooking(booking_id,"offset"))}});
		}, 
		error: function (xhr, status) {
			jQuery(reserv_cont).find('div.booking_calendar_main').replaceWith("Sorry, there was a problem!");
        },
        complete: function (xhr, status) {
            
        }
	});
}

function wpdevartDateDiff(start,end) {
	var date1 = new Date(start);
	var date2 = new Date(end);
	var timeDiff = Math.abs(date2.getTime() - date1.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	return diffDays;
}

function wpdevartBooking(booking_id, el) {
	var wpdevartBookingVar = "wpdevartBooking" + booking_id; 
	var object = window[wpdevartBookingVar]; 
	return object[el];
}


