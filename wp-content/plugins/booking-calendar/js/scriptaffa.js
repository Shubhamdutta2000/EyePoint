
/*############################### ANImation Effekts ########################33*/
function calendar_animat(animation, element_id){	
	jQuery('#'+element_id).ready(function(e) {	
		if(!jQuery(jQuery('#'+element_id)).hasClass('animated') && calendar_isScrolledIntoView(jQuery('#'+element_id)))	{	
			jQuery(jQuery('#'+element_id)).css('visibility','visible');
			jQuery(jQuery('#'+element_id)).addClass('animated');
			jQuery(jQuery('#'+element_id)).addClass(animation);	
		}
	});		
}
function calendar_isScrolledIntoView(elem)
{
    var $elem = jQuery(elem);
	if($elem.length=0)
		return true;
    var $window = jQuery(window);
    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();
	if(typeof(jQuery(elem).offset())!='undefined')
    	var elemTop = jQuery(elem).offset().top;
	else
		var elemTop = 0;
    var elemBottom = elemTop + parseInt(jQuery(elem).css('height'));	
    return ( ( (docViewTop<=elemTop) && (elemTop<=docViewBottom) )  || ( (docViewTop<=elemBottom) && (elemBottom<=docViewBottom) ));
}



