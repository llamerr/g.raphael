/*!
 * g.venn 0.2 - 2-area Venn-diagrams
 * Needs g.Raphael 0.5.1 - Charting library, based on Raphaël
 *
 * Copyright (c)2010-2011 zynamics GmbH (http://zynamics.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * license.
 *
 * Author: Alexey Lukin <llamerr@gmail.com>
 */

(function () {
    var PI180 = Math.PI/180;
    function deg2rad(deg) {return deg * PI180;}
    function sin(deg) {return Math.sin(deg2rad(deg)).toFixed(15);}
    function cos(deg) {return Math.cos(deg2rad(deg)).toFixed(15);}

    /**
     *
     * @param paper
     * @param cx
     * @param cy
     * @param width
     * @param height
     * @param values { values: [a,b], overlaps: [ab] }
     * @param opts { colors: [a,b], opacity: [a,b], scaledown: true, scaleup: true, hoverscalesize: 10  }
     * @return {*}
     * @constructor
     */
    function VennChart(paper, cx, cy, width, height, values, opts) {
        //console.log(' ');

        //console.log($(paper.canvas).parent().attr('id'));
        /** CHECK VALUES AND OPTS **/
        if (typeof values.overlaps == 'undefined') {
            values.overlaps = [];
            for (var i = 0; i < values.values.length-1; i++) {
                values.overlaps[i] = [];
                for (var j = i+1; j < values.values.length; j++) {
                    values.overlaps[i][j-i-1] = 0.5;
                }
            }
        }
        //console.log(values.values); console.log(values.overlaps);
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
        //set empty titles array
        if (typeof opts.titles == 'undefined') opts.titles = [];

        /** BUILD CONFIGURATION **/
        //[ [angle,overlap], [angle,overlap], ... ] - x,y here is relative percent of paper
        var conf;
        if (typeof opts.conf != 'undefined') {
            conf = opts.conf;
        } else {
            conf = [];
            //place at the center of the paper
            if (values.values.length == 1) {}
            //place one next to other
            else if (values.values.length == 2) {
                conf.push([0,0.5]);
            } else if (values.values.length == 3) {
                throw { message : 'Not implemented yet. You must pass conf for charts with more then 2 areas.' }
            } else {
                throw { message : 'You must pass conf for charts with more then 3 areas.' }
            }
        }
        //console.log(conf);

        /** CALCULATE WIDTH AND HEIGHT OF CONFIGURATION **/
        var total_width = 0, total_height = 0,
            thisx = 0, thisy = 0,
            nextx = 0, nexty = 0,
            thisleftx = 0, thisrightx = 0, thistopy = 0, thisboty = 0,
            nextleftx = 0, nextrightx = 0, nexttopy = 0, nextboty = 0,
            s;

        total_width  += values.values[0] * 2;
        total_height += values.values[0] * 2;
        var leftx = -values.values[0], rightx = values.values[0], topy = -values.values[0], boty = values.values[0];
        for (var i = 0; i < conf.length; i++) {

            thisx = nextx; thisy = nexty;
            thisleftx  = thisx - values.values[i];thisrightx = thisx + values.values[i];
            thistopy   = thisy - values.values[i];thisboty   = thisy + values.values[i];
            //console.log('thisxy',thisx, thisy);

            //second value is overlap of smallest area
            s = values.values[i] > values.values[i+1] ? i+1 : i;

            //calculate next position according to direction and values.values/overlap - see docs/g.venn1.png
            nextx += cos(conf[i][0]) * (values.values[i] + values.values[i+1] - conf[i][1] * values.values[s]);
            nexty += sin(conf[i][0]) * (values.values[i] + values.values[i+1] - conf[i][1] * values.values[s]);
            nextleftx  = nextx - values.values[i+1];nextrightx = nextx + values.values[i+1];
            nexttopy   = nexty - values.values[i+1];nextboty   = nexty + values.values[i+1];

            //find out how much our sizes changed - see docs/g.venn2.png

            //compare bot y of both - new bot lower(higher value) then prev
            if (boty < nextboty) {
                total_height += Math.abs(nextboty - boty);
                boty = nextboty;
            }
            //compare top y of both - new top higher(lower value) then prev
            if (topy > nexttopy) {
                total_height += Math.abs(topy - nexttopy);
                topy = nexttopy;
            }
            //compare left x of both - new left is lefter(lower value) then prev
            if (leftx > nextleftx) {
                total_width += Math.abs(leftx - nextleftx);
                leftx = nextleftx;
            }
            //compare right x of both - new rigth is righter(higher value) then prev
            if (rightx < nextrightx) {
                total_width += Math.abs(nextrightx - rightx);
                rightx = nextrightx;
            }

        }
        //console.log('total',total_width,total_height);

        var chart = paper.set(),
            areas = paper.set();

        var sc = 1;
        total_width += opts.hoverscalesize;
        total_height += opts.hoverscalesize;
        //scale up or down
        if ( (total_width > width || total_height > height) && opts.scaledown
            || total_width < width && total_height < height && opts.scaleup) {
            sc = Math.min( width/total_width, height/total_height );
        }
        //console.log('coef',sc);
        //console.log('whc', width / total_width, height / total_height);

        var midx = width / 2, midy = height / 2;
        //console.log('mid',midx,midy);
        var x = midx - (leftx + (rightx - leftx)/2)*sc,
            y = midy - (topy + (boty - topy)/2)*sc,
            rx, ry;
        //console.log('sxy',x,y);
        chart.areas = [];
        //draw areas
        for (var i = 0; i < values.values.length; i++) {
            rx = x; ry = y;
            var area = paper.circle(rx,ry,values.values[i] * sc)
              .attr({ stroke: "white", "stroke-width" : "1", fill: opts.colors[i], opacity : opts.opacity[i] });
            area.i = i;
            area.x = rx;
            area.y = ry;
            //console.log('xyr',area.x,area.y,values.values[i] * sc)
            area.value = values.values[i];
            area.title = opts.titles[i] ? opts.titles[i] : '';
            areas.push(area);
            chart.areas[i] = area;
            //move to next point if any
            if (i == conf.length) continue;
            s = values.values[i] > values.values[i+1] ? i+1 : i;
            x += cos(conf[i][0]) * (values.values[i] + values.values[i+1] - conf[i][1] * values.values[s]) * sc;
            y += sin(conf[i][0]) * (values.values[i] + values.values[i+1] - conf[i][1] * values.values[s]) * sc;
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
                this.valuepopup.push(paper.text(this.x, this.y, (this.title ? this.title+':\n' : '' ) + this.value).attr({fill: 'white'}));
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
