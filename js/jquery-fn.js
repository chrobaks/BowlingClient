(function ($) {
    $.fn.BOWLING = function (options){
        var conf = $.extend({},options,{
            baseobj:$(this),
            score:0,
            countstrikes:0,
            countspares:0,
            actualscorecardbox:0,
            lastscorecardbox:null,
            actualthrow:null,
            secondstrike:false,
            setextra:false
        });
        var set_proberty = function(){
            var obj,inpt;
            if($(conf.baseobj) && conf.hasOwnProperty('maxframe')){
                $('<p></p>',{'class':'descr'}).append('Bitte geben Sie eine Zahl zwischen 0 und 10 ein und drücken Sie dann die Tab-Taste.').appendTo($(conf.baseobj))
                for(var i=0;i<conf.maxframe;i++){
                    if(i<conf.maxframe-1){
                        obj = (i<1) ? $('<div></div>',{'class':conf.itemcss+" active"}): $('<div></div>',{'class':conf.itemcss});
                        $('<div></div>',{'class':conf.itemlablecss}).append("Frame "+(i+1)).appendTo(obj);
                        $('<div></div>',{'class':conf.itemleftcss+" framethrow"}).append($('<input/>',{'type':'text'})).appendTo(obj);
                        $('<div></div>',{'class':conf.itemrightcss+" framethrow"}).append($('<input/>',{'type':'text'})).appendTo(obj);
                        $('<div></div>',{'class':conf.itemoutputcss}).append($('<input/>',{'type':'text','readonly':'readonly'})).appendTo(obj);
                    }else{
                        obj = $('<div></div>',{'class':conf.itemcss+" large"});
                        $('<div></div>',{'class':conf.itemlablecss}).append("Frame 10").appendTo(obj);
                        $('<div></div>',{'class':conf.itemleftcss+" framethrow"}).append($('<input/>',{'type':'text'})).appendTo(obj);
                        $('<div></div>',{'class':conf.itemrightcss+" framethrow"}).append($('<input/>',{'type':'text'})).appendTo(obj);
                        $('<div></div>',{'class':conf.itemextracss+" framethrow"}).append($('<input/>',{'type':'text'})).appendTo(obj);
                        $('<div></div>',{'class':conf.itemoutputcss}).append($('<input/>',{'type':'text','readonly':'readonly'})).appendTo(obj);
                    }
                    obj.appendTo($(conf.baseobj));
                }
                obj = $('<div></div>',{'class':'clearL'});
                $('<p></p>',{'class':'counts'}).append('Anzahl Strikes:').append($('<span></span>',{'class':'countstrikes'}).append('0')).appendTo(obj)
                $('<p></p>',{'class':'counts'}).append('Anzahl Spares:').append($('<span></span>',{'class':'countspares'}).append('0')).appendTo(obj)
                $('<input/>',{'name':'bt_refresh','type':'button','value':'Ergebnisse löschen'}).appendTo(obj);
                obj.appendTo($(conf.baseobj));
            }
        }
        var set_event_input = function(){
            $(".framethrow input",$(conf.baseobj)).blur(function(){
                var setnext=false;
                conf.actualthrow=$(this);
                if(!get_throw_isok()){conf.actualthrow.val('0')}  
                if($(this).parent('div').hasClass(conf.itemleftcss)){
                    setnext=set_throw_first();
                }else if($(this).parent('div').hasClass(conf.itemrightcss)){
                    setnext=set_throw_second();
                }else{
                    if(get_throw_extra_val()>9){set_strike_count();}
                    set_throw_extra();
                }
                if(conf.actualscorecardbox+1<conf.maxframe && setnext){
                    set_score();
                    set_next_frame();
                }else if(conf.actualscorecardbox+1==conf.maxframe && ! conf.setextra && setnext){
                    set_score();
                }
            });
            $("input[name=bt_refresh]",$(conf.baseobj)).click(function(){set_reset()});
            $("div."+conf.itemoutputcss+" input",$(conf.baseobj)).focus(function(){$(this).blur()});
        }
        var set_throw_first = function(){
            if(conf.lastscorecardbox==='spare'){
                set_spare();
                set_last_output(conf.actualscorecardbox-1);
            }
            if(get_throw_first_val()>9){
                if(conf.lastscorecardbox==='strike' && conf.secondstrike===true){
                    set_strike_second();
                    set_last_output(conf.actualscorecardbox-2);
                }
                if(conf.lastscorecardbox==='strike'){
                    conf.secondstrike=true;
                }
                conf.lastscorecardbox = 'strike';
                if(conf.actualscorecardbox+1==conf.maxframe){
                    set_show_extra_throw();
                }
                set_strike_count();
                return true;
            }else{
                if(conf.secondstrike===true){
                    set_strike_second();
                    set_last_output(conf.actualscorecardbox-2);
                    conf.secondstrike=false;
                    if(get_last_throw_first_val()>9){
                        conf.lastscorecardbox = 'strike';
                    }
                }
                return false;
            }
        }
        var set_throw_second = function(){
            if(conf.secondstrike===true && conf.actualscorecardbox+1==conf.maxframe){
                set_strike_second();
                set_last_output(conf.actualscorecardbox-1);
                conf.secondstrike===false;
                if(get_throw_first_val()==10){
                    conf.lastscorecardbox==='strike';
                    set_strike_count();
                }else if(get_throw_first_val()+get_throw_second_val()==10){
                    conf.lastscorecardbox==='spare';
                    set_spare_count();
                }
            }else{
                if(conf.lastscorecardbox==='strike'){
                    set_strike();
                    set_last_output(conf.actualscorecardbox-1);
                }
                if(get_throw_second_val()+get_throw_first_val()>9){
                    conf.lastscorecardbox = 'spare';
                    if(conf.actualscorecardbox+1==conf.maxframe){
                        set_show_extra_throw();
                        set_focus_extra_throw();
                    }
                    set_spare_count();
                }    
            }
            return true;
        }
        var set_throw_extra = function(){
            conf.score += get_throw_first_val()+get_throw_second_val()+get_throw_extra_val();
            set_actual_output();
        }
        var set_strike_second = function(){
            conf.score += 20+get_throw_first_val();
            conf.lastscorecardbox=null;
        }
        var set_strike = function(){
            conf.score += 10+get_throw_first_val()+get_throw_second_val();
            conf.lastscorecardbox=null;
        }
        var set_spare = function(){
            conf.score += 10+get_throw_first_val();
            conf.lastscorecardbox=null;
        }
        var set_score = function(){
            if(conf.lastscorecardbox==null){
                conf.score += get_throw_first_val()+get_throw_second_val();
                set_actual_output();
            }
        }
        var set_strike_count = function(){$('span.countstrikes',conf.baseobj).empty().append(conf.countstrikes+=1)}
        var set_spare_count = function(){$('span.countspares',conf.baseobj).empty().append(conf.countspares+=1)}
        var set_strike_count_refresh = function(){conf.countstrikes=0;$('span.countstrikes',conf.baseobj).empty().append(conf.countstrikes)}
        var set_spare_count_refresh = function(){conf.countspares=0;$('span.countspares',conf.baseobj).empty().append(conf.countspares)}
        var set_actual_output = function(){
            $("."+conf.itemoutputcss+" input",$('.'+conf.itemcss+':eq('+conf.actualscorecardbox+')',conf.baseobj)).val(conf.score);
        }
        var set_last_output = function(eq){
            $("."+conf.itemoutputcss+" input",$('.'+conf.itemcss+':eq('+eq+')',conf.baseobj)).val(conf.score);
        }
        var set_next_frame = function(){
            conf.actualscorecardbox++;
            $("."+conf.itemleftcss+" input",$('.'+conf.itemcss+':eq('+(conf.actualscorecardbox-1)+')',conf.baseobj)).attr('readonly','readonly')
            $("."+conf.itemrightcss+" input",$('.'+conf.itemcss+':eq('+(conf.actualscorecardbox-1)+')',conf.baseobj)).attr('readonly','readonly')
            $('.'+conf.itemcss+':eq('+conf.actualscorecardbox+')',conf.baseobj).addClass('active');
            $("."+conf.itemleftcss+" input",$('.'+conf.itemcss+':eq('+conf.actualscorecardbox+')',conf.baseobj)).focus();
        }
        var set_show_extra_throw = function(){
            conf.setextra = true;
            $("."+conf.itemextracss,$('.'+conf.itemcss+':eq('+(conf.actualscorecardbox)+')',conf.baseobj)).show();
        }
        var set_hide_extra_throw = function(){
            conf.setextra = false;
            $("."+conf.itemextracss,conf.baseobj).hide();
        }
        var set_focus_extra_throw = function(){
            $("."+conf.itemextracss+" input",$('.'+conf.itemcss+':eq('+(conf.actualscorecardbox)+')',conf.baseobj)).focus();
        }
        var set_reset = function(){
            conf.score=0;
            conf.actualscorecardbox=0;
            conf.countstrikes=0;
            conf.countspares=0;
            conf.lastscorecardbox=null;
            conf.actualthrow=null;
            $("."+conf.itemleftcss+" input",conf.baseobj).val('');
            $("."+conf.itemrightcss+" input",conf.baseobj).val('');
            $("."+conf.itemleftcss+" input",conf.baseobj).removeAttr('readonly');
            $("."+conf.itemrightcss+" input",conf.baseobj).removeAttr('readonly');
            $("."+conf.itemoutputcss+" input",conf.baseobj).val('');
            $('.'+conf.itemcss,conf.baseobj).removeClass('active');
            $('.'+conf.itemcss+':eq('+conf.actualscorecardbox+')',conf.baseobj).addClass('active');
            set_hide_extra_throw();
            set_strike_count_refresh();
            set_spare_count_refresh();
        }
        var get_throw_first_val = function(){
            return $("."+conf.itemleftcss+" input",$('.'+conf.itemcss+':eq('+conf.actualscorecardbox+')',conf.baseobj)).val()*1;
        }
        var get_throw_second_val = function(){
            return $("."+conf.itemrightcss+" input",$('.'+conf.itemcss+':eq('+conf.actualscorecardbox+')',conf.baseobj)).val()*1;
        }
        var get_throw_extra_val = function(){
            return $("."+conf.itemextracss+" input",$('.'+conf.itemcss+':eq('+conf.actualscorecardbox+')',conf.baseobj)).val()*1;
        }
        var get_last_throw_first_val = function(){
            return $("."+conf.itemleftcss+" input",$('.'+conf.itemcss+':eq('+(conf.actualscorecardbox-1)+')',conf.baseobj)).val()*1;
        }
        var get_last_throw_second_val = function(){
            return $("."+conf.itemrightcss+" input",$('.'+conf.itemcss+':eq('+(conf.actualscorecardbox-1)+')',conf.baseobj)).val()*1;
        }
        var get_throw_isok = function(){
            return (conf.actualthrow.val().match(/^[1-9]{1}[0]{0,1}$/) && conf.actualthrow.val()*1<=10) ? true:false;
        }
        set_proberty();
        set_event_input();
        return this; 
    }
})(jQuery);