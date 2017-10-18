// https://stackoverflow.com/questions/7991474/calculate-position-of-selected-text-javascript-jquery
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
//check this too
//https://stackoverflow.com/questions/16103157/get-the-highlighted-text-position-in-html-and-text
//this one gives selection coordinates nice
//https://stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page

(function ($) {
    $.dynamic_mark = function () {
        this.ranges = null;
        this.container = null;
    };

    $.dynamic_mark.prototype = {
        markDynamicRanges: function (j_elem, ranges) {
            that = this;

            var that = this;
            this.ranges = {};
            this.container = j_elem;

            this.marker = j_elem.markRanges(ranges, {
                each: function (mark_elem, range) {
                    that.on_mark_each(mark_elem, range);
                }
            });

            var ranges_array = [];
            for (var key in this.ranges) {
                ranges_array.push(this.ranges[key]);
            }
            delete this.ranges;
            this.ranges = ranges_array;

            this.add_cursors();

            this.container.contents().filter(function () {
                return this.nodeType == 3 && $.trim(this.textContent) != '';
            }).wrap('<span class="foobar" />');

            this.container.mousemove(function (event) {
                that.on_container_mouse_move(event);
            });

            // ranges[0].length += 10;
            //
            // this.marker = j_elem.markRanges(ranges, {
            //     // each: function (mark_elem, range) {
            //     //     that.on_mark_each(mark_elem, range);
            //     // }
            // });

            // window.setInterval(function () {
            //     ranges[0].length += i;
            //
            //     j_elem.markRanges(ranges);
            //     console.log(i);
            //     i += 1;
            // }, 1000);

            // console.log(this.marker);
        },
        on_container_mouse_move: function (event) {
            var offset = this.container.offset();
            var x = event.pageX - offset.left;
            var y = event.pageY - offset.top;
            console.log("(X: " + x + ", Y: " + y + ")");
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
            var container_offset = this.container.offset();
            var position = $(elem).position();

            var x = position.left - container_offset.left;
            var y = position.top - container_offset.top;

            // var range_obj = $(this).data().range;
            // $(".context").caret(range_obj.range.start, range_obj.range.start + range_obj.range.length);
            console.log("ELEM (X: " + x + ", Y: " + y + ")");
        },
        add_cursors: function () {
            var that = this;

            for (var i = 0; i < this.ranges.length; i++) {
                var cursor_before = $("<img class='cursor_before'/>");
                cursor_before.data({index: i, is_begin: true});

                cursor_before.bind("mousedown", function () {
                    that.on_mouse_down(this);
                });

                cursor_before.insertBefore(this.ranges[i].marks[0]);


                var cursor_after = $("<img class='cursor_after'/>");
                cursor_after.data({index: i, is_begin: false});

                cursor_after.insertAfter(this.ranges[i].marks[this.ranges[i].marks.length - 1]);
            }
        }
    }
}(jQuery));