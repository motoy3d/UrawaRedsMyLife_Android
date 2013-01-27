var SelectedSearchBox = function (args) {
    var args = args || {};
    this.from        = args.from        || "";
    this.targets     = args.targets     || [];
    this.timeout     = args.timeout     || 0;
    this.ngwords     = args.ngwords     || [];
    this.ignoreTags  = args.ignoreTags  || [];
    this.linkTarget  = args.linkTarget  || "";
    this.queryLength = args.queryLength || 100;

    this.searchUrlAndTexts = args.searchUrlAndTexts ||
                             ["http://www.so-net.ne.jp/search/?type=web&query=", "で検索する"];

    if (args.addSearchUrlAndTexts)
        this.searchUrlAndTexts = this.searchUrlAndTexts.concat(args.addSearchUrlAndTexts);

    this.disableIE8 = args.disableIE8 || true;

    var self = this;
    this._addLoadEvent(function(){self._init();});
};

SelectedSearchBox.prototype = {
    VERSION: 1.1,
    _timerID:    null,
    _popupBox:   null,
    _mdPosX:     null,
    _mdPosY:     null,
    _mdStr:      "",
    _skipFlag:   false,
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
    init: function() {
        // dummy method for version 1.0
    },
    _init: function () {
        if (this.disableIE8 && navigator.userAgent.indexOf("MSIE")!=-1 && navigator.userAgent.indexOf("Trident/4.")!=-1)
            return; // isIE8

        var self = this;
        if (this.targets.length) {
            this._addEventListener(document.body, "mouseup", function(){self._clearPopup();});
            for (var i=0,len=this.targets.length; i<len; i++) {
                var elem = document.getElementById(this.targets[i]);
                if (!elem) return;
                this._addEventListener(elem, "mouseup", function(e){self._main(e);});
                this._addEventListener(elem, "mousedown", function(e){self._mousedown(e);});
            }
        } else {
            this._addEventListener(document.body, "mouseup", function(e){self._main(e);});
            this._addEventListener(document.body, "mousedown", function(e){self._mousedown(e);});
        }
    },
    _main: function (e) {
        clearTimeout(this._timerID);

        var str = this._trim(this._getSelectedText());
        var muPosX = this._getPosX(e);
        var muPosY = this._getPosY(e);

        if (muPosX==this._mdPosX && muPosY==this._mdPosY && str==this._mdStr) {
            // click & link
            this._mdStr = "";
            if (this._popupBox)
                this._popupBox.style.display = "none";
            return;
        }

        if (!str || this._filters(str, e)) {
            this._mdStr = "";
            if (this._popupBox)
                this._popupBox.style.display = "none";
            return;
        }

        if (!this._popupBox) {
            // initialize
            this._popupBox = document.createElement("div");
            this._popupBox.style.position        = "absolute";
            this._popupBox.style.display         = "none";
            this._popupBox.style.border          = "1px solid #888";
            this._popupBox.style.backgroundColor = "#FFF";
            this._popupBox.style.zIndex          = 2;
            this._popupBox.style.textAlign       = "left";
            this._popupBox.style.padding         = "3px";
            this._popupBox.style.fontSize        = "75%";
            document.body.appendChild(this._popupBox);
        }

        // layout
        var lines = [];
        var encStr = encodeURIComponent(str);
        var escStr = this._htmlEscape(str);
        for (var i=0; i<this.searchUrlAndTexts.length; i+=2) {
            var url = this.searchUrlAndTexts[i] + encStr + "&from=" + this.from;
            var html = '<img src="http://www.so-net.ne.jp/search/javascripts/select_search/icn_search.gif" style="vertical-align:middle" />';
            html += ' <a style="vertical-align:middle" href="' + url + '"';
            if (this.linkTarget) html += ' target="' + this.linkTarget + '"';
            html += '>「' + escStr + '」 ' + this.searchUrlAndTexts[i+1] + '</a>';
            lines.push(html);
        }
        this._popupBox.innerHTML = lines.join('<br/>');

        var x, y;
        if (muPosY > this._mdPosY) {
            x = muPosX;
            y = muPosY;
        } else {
            x = this._mdPosX;
            y = this._mdPosY;
        }
        this._popupBox.style.top  = y + 10 + "px";
        this._popupBox.style.left = x - 20 + "px";

        this._popupBox.style.display = "";

        this._skipFlag = true;
        this._mdStr = "";

        if (this.timeout) {
            var self = this;
            this._timerID = setTimeout(function () {
                self._popupBox.style.display = "none";
            }, this.timeout * 1000);
        }
    },
    _filters: function (str, e) {
        // str_length Filter
        if (str.length > this.queryLength) return true;

        // length=1 && !kanji Filter
        if (str.length == 1) {
            var c = str.charCodeAt(0);
            if ( !((c >= 0x4e00  && c <= 0x9fcf)  ||
                   (c >= 0x3400  && c <= 0x4dbf)  ||
                   (c >= 0x20000 && c <= 0x2a6df) ||
                   (c >= 0xf900  && c <= 0xfadf)  ||
                   (c >= 0x2f800 && c <= 0x2fa1f)) )
                return true; // not kanji
        }

        // element Filter
        if (!e) e = window.event;
        var srcElem = (e.srcElement) ? e.srcElement : e.target;
        for (var i=0,len=this.ignoreTags.length; i<len; i++)
            if (srcElem.tagName.toLowerCase() == this.ignoreTags[i]) return true;

        // NG word Filter
        for (var i=0,len=this.ngwords.length; i<len; i++)
            if (str.indexOf(this.ngwords[i]) != -1) return true;


        return false;
    },
    _getPosX: function (e) {
        if (!e) e = window.event;
        return (e.pageX) ? e.pageX : e.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft);
    },
    _getPosY: function (e) {
        if (!e) e = window.event;
        return (e.pageY) ? e.pageY : e.clientY + (document.body.scrollTop || document.documentElement.scrollTop);
    },
    _mousedown: function (e) {
        this._mdPosX = this._getPosX(e);
        this._mdPosY = this._getPosY(e);
        this._mdStr  = this._trim(this._getSelectedText());
    },
    _clearPopup: function () {
        if (this._skipFlag) {
            this._skipFlag = false;
            return;
        }

        clearTimeout(this._timerID);
        if (this._popupBox)
            this._popupBox.style.display = "none";
    },
    _trim: function (str) {
        str = str.replace(/^[\s　]+/, "").replace(/[\s　]+$/, ""); // strip
        str = str.replace(/[\s　]+/g, " ");
        return str;
    },
    _htmlEscape: function (str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    },
    _addEventListener: function (elem, evt, func) {
        if (elem.addEventListener) {
            elem.addEventListener(evt, func, false);
        } else if (elem.attachEvent) { // for IE
            elem.attachEvent("on" + evt, func);
        }
    },
    _getSelectedText: function () {
        if (window.getSelection)
            return window.getSelection() + "";
        else if (document.getSelection)
            return document.getSelection();
        else if (document.selection)
            return document.selection.createRange().text;

        return "";
    }
};
