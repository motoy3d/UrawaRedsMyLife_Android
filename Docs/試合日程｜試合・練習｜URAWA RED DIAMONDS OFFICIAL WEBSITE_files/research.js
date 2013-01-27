var ResearchBox = function(args) {
    var args            = args           || {};
    this.from           = args.from      || '';
    this.ifrm_id        = args.id        || 'researchFrame';
    this.ifrm_width     = args.width     || 240;
    this.ifrm_height    = args.height    || 85;
    this.ifrm_position  = args.position  || 'fixed';
    this.ifrm_top       = args.top       || 1;
    this.ifrm_bottom    = args.bottom    || null;
    this.ifrm_right     = args.right     || 1;
    this.ifrm_left      = args.left      || null;
    this.ifrm_border    = args.border    || 0;
    this.ifrm_zindex    = args.zindex    || 2;
    this.ifrm_scrolling = args.scrolling || 'no';
    this.ifrm_allowTransparency = args.allowTransparency || true;
    this.researchUrl = args.researchUrl || 'http://www.so-net.ne.jp/search/?type=web&query=';

    this._isIE6andPosFixed(); // for 'position: fixed' of IE6

    var self = this;
    this._addLoadEvent(function(){self._create();});
};

ResearchBox.prototype = {
    VERSION: 1.1,
    _SEARCHES: [
        {
            // google
            query:       'q',
            enc_param:   'ie',
            default_enc: 'utf-8',
            url_regex:   '^http://www\.google\.(co\.jp|com)'
        }, {
            // yahoo
            query:       'p',
            enc_param:   'ei',
            default_enc: 'utf-8',
            url_regex:   '^http://[^/]*search\.yahoo\.(co\.jp|com)'
        }, {
            // so-net
            query:       'query',
            enc_param:   'charset',
            default_enc: 'utf8',
            url_regex:   '^http://www\.so-net\.ne\.jp/search/'
        }
    ],
    _addLoadEvent: function(func) {
        if(window.addEventListener) { //for W3C DOM
            window.addEventListener("load", func, false);
        } else if(window.attachEvent) { //for IE
            window.attachEvent("onload", func);
        } else {
            var oldonload = window.onload;
            if(typeof window.onload != 'function'){
                window.onload = func;
            } else {
                window.onload = function() {
                    oldonload();
                    func();
                }
            }    
        }
    },
    _create: function() {
        if(document.getElementById(this.ifrm_id)) return;

        var ref = document.referrer;
        if(!ref) return;

        for(var i=0,len=this._SEARCHES.length; i<len; i++) {
            var s = this._SEARCHES[i];
            if(ref.match(s.url_regex)) {
                var params = this._parseParameters(ref);
                if(!params) return;
                
                var q   = params[s.query];
                if(!q) return;
                
                var enc = params[s.enc_param] || s.default_enc;
                if(!enc.match(/utf-?8/i)) return;
                
                var rurl = this.researchUrl + q + '&from=' + this.from;

                // iframe
                var ifrm = document.createElement('iframe');
                ifrm.id                = this.ifrm_id;
                ifrm.style.width       = this.ifrm_width + 'px';
                ifrm.style.height      = this.ifrm_height + 'px';

                if( !((navigator.userAgent.toLowerCase().indexOf('msie 6.') != -1) && (this.ifrm_position=='fixed')) ) {
                    ifrm.style.position    = this.ifrm_position;
                    if(this.ifrm_bottom)
                        ifrm.style.bottom  = this.ifrm_bottom + 'px';
                    else
                        ifrm.style.top     = this.ifrm_top + 'px';
                    if(this.ifrm_left)
                        ifrm.style.left    = this.ifrm_left + 'px';
                    else
                        ifrm.style.right   = this.ifrm_right + 'px';
                }

                ifrm.frameBorder       = this.ifrm_border;
                ifrm.style.zIndex      = this.ifrm_zindex;
                ifrm.style.scrolling   = this.ifrm_scrolling;
                ifrm.allowTransparency = this.ifrm_allowTransparency;
                document.body.appendChild(ifrm);

                var ifrmdoc = document.all ? ifrm.contentWindow.document : ifrm.contentDocument;
                ifrmdoc.open();
                ifrmdoc.writeln(
                    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
                    + '<html xmlns="http://www.w3.org/1999/xhtml">'
                    + '<head>'
                    + '<meta http-equiv="Pragma" content="no-cache" />'
                    + '<meta http-equiv="Cache-Control" content="no-cache" />'
                    + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
                    + '<style type="text/css">'
                    + '* { margin: 0; padding: 0; }'

                    + 'html { position:absolute; top:0; left:0;}'

                    + 'body { font-family:Verdana, Arial, sans-serif; font-weight: bold; background-color: transparent; margin:0; padding:0; }'
                    + 'a { text-decoration: none; }'
                    + 'a img { border: 0; }'
                    + 'div.searchFrame { width: 240px; height: 85px; word-break: break-all; word-wrap: break-word; overflow: hidden; background-image: url(http://blog.so-net.ne.jp/_images/blog/_523/filestore/research_bg.png); background-repeat: no-repeat;  position: absolute; top: 0px; left: 0px; }'
                    + '* html div.searchFrame { filter:Progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=crop,src=http://blog.so-net.ne.jp/_images/blog/_523/filestore/research_bg.png); background: none; }'
                    + 'a.btnClose { position: absolute; top:7px; left: 218px; color:#ffffff; }'
                    + 'a.searchText { position:absolute; top:25px; left: 7px; width: 208px; height: 42px; padding:4px 8px; background:#ffffff; border:1px solid #888888; color: #0887B6; font-size: 16px; line-height: 1.4; display: block; overflow:hidden; }'
                    + 'a.searchText:hover { text-decoration: underline; color: #ff9a00; }'
                    + 'a.more { position:absolute; top:4px; left:7px; width:105px; height:18px; }'
                    + '</style>'
                    + '</head>'

                    + '<body>'
                    + '<div class="searchFrame"></div>'
                    + '<a href="' + rurl + '" target="_parent" class="more"></a>'
                    + '<a href="javascript:void(0);" onclick="var frm=parent.window.document.getElementById(\'' + this.ifrm_id
                    + '\'); frm.parentNode.removeChild(frm);"  class="btnClose">'
                    + '<img src="http://blog.so-net.ne.jp/_images/blog/_523/filestore/btn_close.gif" alt="閉じる" /></a>'
                    + '<a href="' + rurl + '" target="_parent" class="searchText">'
                    + this._htmlEscape(decodeURIComponent(q.replace(/\+/g, ' '))) + '</a>'
                    + '</body></html>'
                );
                ifrmdoc.close();

                return;
            }
        }
    },
    _htmlEscape: function(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
    _parseParameters: function(url) {
        var params = {};

        var idx = url.indexOf('?');
        if(idx == -1) return;
        var str = url.substring(idx + 1);

        var pairs = str.split('&');
        for(var i=0,len=pairs.length; i<len; i++){
            var pair = pairs[i].split('=');
            if(pair[0] && pair[1]) params[pair[0]] = pair[1];
        }
        return params;
    },
    _isIE6andPosFixed: function() {
        if ((navigator.userAgent.toLowerCase().indexOf('msie 6.') != -1) && (this.ifrm_position == 'fixed')) {
            // CSS for IE6
            var cssdoc = '<style type="text/css">';
            cssdoc += "* html body { filter: expression(''); } ";
            cssdoc += '* html #' + this.ifrm_id + ' { ';
            cssdoc += 'position: absolute; ';
            if(this.ifrm_bottom) {
                cssdoc += 'top: auto; ';
                cssdoc += "bottom: expression(this.style.filter = '', '" + this.ifrm_bottom + "'); ";
            } else {
                cssdoc += 'top: expression( ';
                cssdoc += 'document.documentElement && document.documentElement.scrollTop || ';
                cssdoc += 'document.body && body.scrollTop || 0 ';
                cssdoc += "+ " + this.ifrm_top + " + 'px'";
                cssdoc += '); ';
            }

            if(this.left) {
                cssdoc += 'left: expression( ';
                cssdoc += 'document.documentElement && document.documentElement.scrollLeft || ';
                cssdoc += 'document.body && body.scrollLeft || 0 ';
                cssdoc += "+ " + this.ifrm_left + " + 'px'";
                cssdoc += '); ';
            } else {
                cssdoc += 'left: auto; ';
                cssdoc += "right: expression(this.style.filter = '', '" + this.ifrm_right + "'); ";
            }

            cssdoc += '} </style>';
            document.writeln(cssdoc);
        }
    }
}


