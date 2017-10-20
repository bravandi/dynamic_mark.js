// https://stackoverflow.com/questions/7991474/calculate-position-of-selected-text-javascript-jquery

$.fn.selectRange = function (start, end) {
    var e = document.getElementById($(this).attr('id')); // I don't know why... but $(this) don't want to work today :-/
    if (!e) return;
    else if (e.setSelectionRange) {
        e.focus();
        e.setSelectionRange(start, end);
    } /* WebKit */
    else if (e.createTextRange) {
        var range = e.createTextRange();
        range.collapse(true);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
    } /* IE */
    else if (e.selectionStart) {
        e.selectionStart = start;
        e.selectionEnd = end;
    }
};

function getSelectionCharOffsetsWithin(element) {
    var start = 0, end = 0;
    var sel, range, priorRange;
    if (typeof window.getSelection != "undefined") {
        range = window.getSelection().getRangeAt(0);
        priorRange = range.cloneRange();
        priorRange.selectNodeContents(element);
        priorRange.setEnd(range.startContainer, range.startOffset);
        start = priorRange.toString().length;
        end = start + range.toString().length;
    } else if (typeof document.selection != "undefined" &&
        (sel = document.selection).type != "Control") {
        range = sel.createRange();
        priorRange = document.body.createTextRange();
        priorRange.moveToElementText(element);
        priorRange.setEndPoint("EndToStart", range);
        start = priorRange.text.length;
        end = start + range.text.length;
    }
    return {
        start: start,
        end: end
    };
}

function getSelectionCoords(win) {
    win = win || window;
    var doc = win.document;
    var sel = doc.selection, range, rects, rect;
    var x = 0, y = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            range.collapse(true);
            x = range.boundingLeft;
            y = range.boundingTop;
        }
    } else if (win.getSelection) {
        sel = win.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getClientRects) {
                range.collapse(true);
                rects = range.getClientRects();
                if (rects.length > 0) {
                    rect = rects[0];
                }
                x = rect.left;
                y = rect.top;
            }
            // Fall back to inserting a temporary element
            if (x == 0 && y == 0) {
                var span = doc.createElement("span");
                if (span.getClientRects) {
                    // Ensure span has dimensions and position by
                    // adding a zero-width space character
                    span.appendChild(doc.createTextNode("\u200b"));
                    range.insertNode(span);
                    rect = span.getClientRects()[0];
                    x = rect.left;
                    y = rect.top;
                    var spanParent = span.parentNode;
                    spanParent.removeChild(span);

                    // Glue any broken text nodes back together
                    spanParent.normalize();
                }
            }
        }
    }
    return {x: x, y: y};
}

function selectRawText() {
    var range2 = document.createRange();
    //must be text element otherwise range2.setStart will throw an error
    var txt_elem = elem.childNodes[4].childNodes[0]
    range2.setStart(txt_elem, 10);
    range2.setEnd(txt_elem, 50);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range2);
}

document.onmouseup = function () {
    // var coords = getSelectionCoords();
    // console.log(coords.x + ", " + coords.y);

    // var z = getSelectionCharOffsetsWithin($(".context")[0]);
    // console.log(z);

    // var elem = $(".context")[0];
    //


    // if (document.selection) {
    //     var range = document.body.createTextRange();
    //     range.moveToElementText(elem);
    //     range.select();
    // } else if (window.getSelection) {
    //     var range = document.createRange();
    //     range.selectNode(elem);
    //     window.getSelection().removeAllRanges();
    //     // range.moveStart("character", 10);
    //     // range.moveEnd("character", 20);
    //     range.setStart(elem, 0);
    //     window.getSelection().addRange(range);
    // }
};

//check this too
//https://stackoverflow.com/questions/16103157/get-the-highlighted-text-position-in-html-and-text
//this one gives selection coordinates nice
//https://stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page

(function ($) {
    $.dynamic_mark = function (container) {
        this.ranges = null;
        this.current_cursor = null;
        this.first_mouse_down = false;
        this.container = $(container);

        var that = this;
        this.container.bind("mouseup", function () {
            that.on_container_mouse_up();
        })
    };

    $.dynamic_mark.prototype = {
        markDynamicRanges: function (ranges) {
            that = this;
            $(".cursor_after, .cursor_before").remove();

            var that = this;
            this.ranges = {};
            this.container.unmark();

            this.container.markRanges(ranges, {
                each: function (mark_elem, range) {
                    that.on_mark_each(mark_elem, range);
                    console.log("eachhhh");
                }
            });

            var ranges_array = [];
            for (var key in this.ranges) {
                ranges_array.push(this.ranges[key]);
            }
            delete this.ranges;
            this.ranges = ranges_array;

            this.add_cursors();

            //make sure all text are inside an element
            // this.container.contents().filter(function () {
            //     return this.nodeType == 3 && $.trim(this.textContent) != '';
            // }).wrap('<span class="foobar" />');


            // ranges[0].length += 10;
            //
            // this.marker = j_elem.markRanges(ranges, {
            //     // each: function (mark_elem, range) {
            //     //     that.on_mark_each(mark_elem, range);
            //     // }
            // });

            // console.log(this.marker);
        },
        on_container_mouse_move: function (event) {
            // this.container.mousemove(function (event) {
            //     that.on_container_mouse_move(event);
            // });
            var offset = this.container.offset();
            var x = event.pageX - offset.left;
            var y = event.pageY - offset.top;
            // console.log("(X: " + x + ", Y: " + y + ")");
        },
        on_mark_each: function (mark_elem, range) {
            var key = range.start + "-" + range.length;
            if (!this.ranges[key]) {
                this.ranges[key] = {
                    marks: [],
                    start: range.start,
                    end: range.start + range.length
                };
            }

            this.ranges[key].marks.push(mark_elem);
        },
        on_mouse_down: function (elem) {
            elem = $(elem);

            $(".cursor_selected").removeClass("cursor_selected");
            elem.addClass("cursor_selected");

            var container_offset = this.container.offset();
            var position = elem.position();

            var x = position.left - container_offset.left;
            var y = position.top - container_offset.top;

            this.current_cursor = elem.data();
            this.first_mouse_down = true;

            // var coords = getSelectionCoords();

            // var range_obj = $(this).data().range;
            // $(".context").caret(range_obj.range.start, range_obj.range.start + range_obj.range.length);
            // console.log("ELEM [ " + elem_data.index + " ] (X: " + x + ", Y: " + y + ")");
            // console.log(coords.x + ", " + coords.y);
        },
        on_container_mouse_up: function () {
            if (this.first_mouse_down) {
                this.first_mouse_down = false;
                return;
            }

            if (this.current_cursor) {
                var z = getSelectionCharOffsetsWithin($(".context")[0]);

                var cursor_range = this.ranges[this.current_cursor.index];
                var cursor_index = this.current_cursor.index;
                var allow = true;

                if (this.current_cursor.is_begin) {
                    if (z.start >= cursor_range.end) {
                        allow = false;
                    }
                    //restrict go behind more than one marked range
                    else if (this.ranges[cursor_index - 1] && z.start <= this.ranges[cursor_index - 1].start) {
                        allow = false;
                    }
                    else if (this.ranges[cursor_index - 1] && z.start >= this.ranges[cursor_index - 1].start && z.start <= this.ranges[cursor_index - 1].end) {
                        this.ranges[cursor_index - 1].end = z.start;
                    }
                    if (allow) {
                        cursor_range.start = z.start;
                    }
                } else {
                    if (z.end <= cursor_range.start) {
                        allow = false;
                    }
                    //restrict go over more than one marked range
                    else if (this.ranges[cursor_index + 1] && z.end >= this.ranges[cursor_index + 1].end) {
                        allow = false;
                    }
                    else if (this.ranges[cursor_index + 1] && z.end >= this.ranges[cursor_index + 1].start && z.end <= this.ranges[cursor_index + 1].end) {
                        this.ranges[cursor_index + 1].start = z.end;
                    }
                    if (allow) {
                        cursor_range.end = z.end;
                    }
                }

                if (allow) {
                    this.re_apply_ranges();
                    this.current_cursor = null;
                    $(".cursor_selected").removeClass("cursor_selected");
                }
            }
        },
        re_apply_ranges: function () {
            var ranges_markjs_format = []

            for (var i = 0; i < this.ranges.length; i++) {
                ranges_markjs_format.push({
                    start: this.ranges[i].start,
                    length: this.ranges[i].end - this.ranges[i].start
                })
            }

            this.markDynamicRanges(ranges_markjs_format);
        },
        add_cursors: function () {
            var that = this;

            for (var i = 0; i < this.ranges.length; i++) {
                var cursor_before = $("<img class='cursor_before'/>");
                cursor_before.data({index: i, is_begin: true});

                cursor_before.bind("mousedown", function (event) {
                    that.on_mouse_down(this);
                    event.stopPropagation();
                });

                cursor_before.insertBefore(this.ranges[i].marks[0]);


                var cursor_after = $("<img class='cursor_after'/>");
                cursor_after.data({index: i, is_begin: false});

                cursor_after.bind("mousedown", function (event) {
                    that.on_mouse_down(this);
                    event.stopPropagation();
                });

                cursor_after.insertAfter(this.ranges[i].marks[this.ranges[i].marks.length - 1]);
            }
        }
    }
}(jQuery));