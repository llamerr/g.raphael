/*!
 * g.venn 0.2 - 2-area Venn-diagrams
 * Needs g.Raphael 0.5.1 - Charting library, based on Raphaël
 *
 * Copyright (c)2010-2011 zynamics GmbH (http://zynamics.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * license.
 *
 * Author: Christian Blichmann <christian.blichmann@zynamics.com>
 */

(function () {
    var PI180 = Math.PI/180;
    function deg2rad(deg) { return deg * PI180; }

    /**
     *
     * @param paper
     * @param cx
     * @param cy
     * @param width
     * @param height
     * @param values { values : [a,b], overlaps : [ab] }
     * @param opts { colors : [a,b], opacity : [a,b] }
     * @return {*}
     * @constructor
     */
    function VennChart(paper, cx, cy, width, height, values, opts) {
        /** CHECK VALUES AND OPTS **/
        //[ [12] ]
        //[ [12, 13], [23] ]
        //[ [12, 13, 14], [23, 24], [34] ]
        if (typeof values.overlaps == 'undefined') {
            values.overlaps = [];
            for (var i = 0; i < values.values.length-1; i++) {
                values.overlaps[i] = [];
                for (var j = i+1; j < values.values.length; j++) {
                    values.overlaps[i][j-i-1] = 0.5;
                }
            }
        }
        //console.log(values.overlaps);
        opts = opts || {};
        if (typeof opts.scaledown == 'undefined') opts.scaledown = true;
        if (typeof opts.scaleup == 'undefined') opts.scaleup = true;
        if (typeof opts.hoverscalesize == 'undefined') opts.hoverscalesize = 10;
        //set colors if not set
        if (typeof opts.colors == 'undefined' || opts.colors.length < values.values.length) {
            if (typeof opts.colors == 'undefined') opts.colors = [];
            for ( var i = 0; i < values.values.length; i++) {
                if (typeof opts.colors[i] == 'undefined') opts.colors[i] = Raphael.getColor();
            }
        }
        //set opacity if not set
        if (typeof opts.opacity == 'undefined' || opts.opacity.length < values.values.length) {
            if (typeof opts.opacity == 'undefined') opts.opacity = [];
            for ( var i = 0; i < values.values.length; i++) {
                if (typeof opts.opacity[i] == 'undefined') opts.opacity[i] = 0.75;
            }
        }

        /** BUILD CONFIGURATION **/
        //[ [angle,overlap], [angle,overlap], ... ] - x,y here is relative percent of paper
        var conf;
        if (typeof opts.conf != 'undefined') {
            conf = opts.conf;
        } else {
            conf = [];
            //place at the center of the paper
            if (values.values.length == 1) {
                conf.push([width / 2, height / 2]);
            }
            //place one next to other
            else if (values.values.length == 2) {
                var s = values.values[0] > values.values[1] ? 1 : 0;

                var maxh = Math.max.apply(Math, values.values);
                var maxw = values.values[0] + values.values[1] - values.values[s] * values.overlaps[0][0];
            } else if (values.values.length == 3) {
                throw { message : 'Not implemented yet.' }
            } else {
                throw { message : 'You must pass conf for charts with more then 3 areas.' }
            }
        }

        //calculate width and height of configuration
        var total_width = 0, total_height = 0, nextx = 0, nexty = 0, thisx = 0, thisy = 0, s;
        total_width  += values.values[0] * 2;
        total_height += values.values[0] * 2;
        //skip start point
        for (var i = 0; i < conf.length; i++) {
            //second value is overlap of smallest area
            s = values.values[i] > values.values[i+1] ? 1 : 0;
            thisx = nextx; thisy = nexty;
            //calculate next position according to direction and radiuses/overlap - see docs/g.venn1.png
            nextx += Math.cos(deg2rad(conf[i][0])) * (values.values[i+1] - conf[i][1] * values.values[s]);
            nexty += Math.sin(deg2rad(conf[i][0])) * (values.values[i+1] - conf[i][1] * values.values[s]);
            //add one more radius to total width & height from next point
            if (thisx + values.values[i] < nextx + values.values[i+1]) {
                something
            }
            if (thisx + values.values[i] > nextx + values.values[i+1]) {
                something
            }
            something
            //total_width +=
        }

        var maxr = Math.max.apply(Math, radiuses);
        //scale up or down
        if (maxr * 2 > height && opts.scaledown || maxr * 2 < height && opts.scaleup) {
            var coef = height / (maxr * 2);
            for (var i = 0; i < radiuses.length; i++) {
                radiuses[i] = Math.floor( radiuses[i] * coef );
            }
        }

        //convert percents of overlaps to pixels - we take percent of the smallest one
        var ov = [], s, ovi;
        for (var i = 0; i < radiuses.length-1; i++) {
            ov[i] = [];
            for (var j = i+1; j < radiuses.length; j++) {
                s = radiuses[i] > radiuses[j] ? j : i;
                ovi = values.overlaps[i][j-i-1];
                ov[i][j-i-1] = radiuses[s] * (ovi > 1 ? ovi / 100 : ovi);
            }
        }

        var chart = paper.set(),
            areas = paper.set(),
            //0 for x, 1 for y
            coords = [];
        var radiuses = values.values.slice();

        //fill coords array with given count of radiuses
        for (var i = 0; i < radiuses.length; i++) {
            coords[i] = [];
            coords[i][1] = cy + height / 2;
        }
        //set A center first, find B center accordingly to intersection size TODO: move inside previous for
        coords[0][0] = cx + radiuses[0];
        coords[1][0] = cx + radiuses[0] + (radiuses[0] - ov[0][0] / 2) + (radiuses[1] - ov[0][0] / 2);

        chart.areas = [];
        //draw A and B
        for (var i = 0; i < radiuses.length; i++) {
            var area = paper.circle(coords[i][0],coords[i][1],radiuses[i])
              .attr({ stroke: "white", "stroke-width" : "1", fill: opts.colors[i], opacity : opts.opacity[i] });
            area.i = i;
            area.x = coords[i][0];
            area.y = coords[i][1];
            area.value = values.values[i];
            areas.push(area);
            chart.areas[i] = area;
        }
        chart.push(areas);

        //set holder position
        if (typeof window.jQuery != 'undefined') {
            chart.holder = jQuery(paper.canvas).parent();
            chart.holderPosition = chart.holder.position();
        } else {
            chart.holder = paper.canvas.parentNode;
            chart.holderPosition = {left : chart.holder.offsetLeft, top : chart.holder.offsetTop};
        }

        chart.fin = function fin() {
            //console.log('fin');
            if (opts.hoverscalesize) {
                var d = this.attrs.r * 2;
                var s = (opts.hoverscalesize / d);
                this.stop().animate( { transform: "s" +  (1 + s) }, 500, "elastic");
            }
            if (!this.valuepopup) {
                this.valuepopup = paper.set();
                this.valuepopup.push(paper.text(this.x, this.y, this.value).attr({fill: 'white'}));
                this.valuepopup.push(this.valuepopup[0].blob());
            }
            this.valuepopup.show();
        }

        chart.fout = function fout() {
            //console.log('fout');
            if (opts.hoverscalesize) this.stop().animate({transform: ""}, 500, "elastic");
            if (this.valuepopup) this.valuepopup.hide();
        }

        chart.mousemove = function(e){
            var areas = chart.areas.slice(0);
            //fix coords
            var x = e.pageX-chart.holderPosition.left;
            var y = e.pageY-chart.holderPosition.top;
            //find all points under cursor
            var els = paper.getElementsByPoint(x, y);
            if (els.length) {
                //show elements in focus
                var circles = [];
                for (var i=0; i < els.length; i++) {
                    if (els[i].type == 'circle') {
                        circles.push(els[i]);
                    }
                }
                //going backwards so every element of areas have correct index
                if (circles.length) for (var i=circles.length-1; i >= 0; i--) {
                    areas.splice(circles[i].i,1);
                    chart.fin.apply(circles[i]);
                }
            }
            //hide non-focused elements
            if (areas.length) {
                for (var i=0; i < areas.length; i++) {
                    chart.fout.apply(areas[i]);
                }
            }
        }

        return chart;
    };

    //inheritance
    var F = function () {};
    F.prototype = Raphael.g;
    VennChart.prototype = new F;

    //public
    Raphael.fn.vennchart = function (cx, cy, width, height, values, opts) {
        return new VennChart(this, cx, cy, width, height, values, opts);
    }

})();
