/*!
 * g.Raphael 0.51 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009-2012 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
(function () {
    var mmin = Math.min,
        mmax = Math.max;

    function finger(x, y, width, height, dir, ending, isPath, paper) {
        var path,
            ends = { round: 'round', sharp: 'sharp', soft: 'soft', square: 'square' };

        // dir 0 for horizontal and 1 for vertical
        if ((dir && !height) || (!dir && !width)) {
            return isPath ? "" : paper.path();
        }

        ending = ends[ending] || "square";
        height = Math.round(height);
        width = Math.round(width);
        x = Math.round(x);
        y = Math.round(y);
        console.log(dir);
        switch (ending) {
            case "square":
                    path = [
                        "M", x + ~~(width / 2), y,
                        "l", 1 - width, 0, 0, -height, width - 1, 0,
                        "z"
                    ];
                break;
        }

        if (isPath) {
            return path.join(",");
        } else {
            return paper.path(path);
        }
    }

/*\
 * Paper.vbarchart
 [ method ]
 **
 * Creates a vertical bar chart
 **
 > Parameters
 **
 - x (number) x coordinate of the chart
 - y (number) y coordinate of the chart
 - width (number) width of the chart (respected by all elements in the set)
 - height (number) height of the chart (respected by all elements in the set)
 - values (array) values
 - opts (object) options for the chart
 o {
 o type (string) type of endings of the bar. Default: 'square'. Other options are: 'round', 'sharp', 'soft'.
 o gutter (number)(string) default '20%' (WHAT DOES IT DO?)
 o vgutter (number)
 o colors (array) colors be used repeatedly to plot the bars. If multicolumn bar is used each sequence of bars with use a different color.
 o stacked (boolean) whether or not to tread values as in a stacked bar chart
 o to
 o stretch (boolean)
 o }
 **
 = (object) path element of the popup
 > Usage
 | r.vbarchart(0, 0, 620, 260, [76, 70, 67, 71, 69], {})
 \*/
 
    function VBarchart(paper, x, y, width, height, values, opts) {
        opts = opts || {};

        var chartinst = this,
            type = opts.type || "square",
            gutter = parseFloat(opts.gutter || "20%"),
            chart = paper.set(),
            bars = paper.set(),
            covers = paper.set(),
            total = Math.max.apply(Math, values),
            stacktotal = [],
            colors = opts.colors || chartinst.colors,
            len = values.length;

        if (Raphael.is(values[0], "array")) {
            total = [];
            multi = len;
            len = 0;

            for (var i = values.length; i--;) {
                bars.push(paper.set());
                total.push(Math.max.apply(Math, values[i]));
                len = Math.max(len, values[i].length);
            }

            for (var i = values.length; i--;) {
                if (values[i].length < len) {
                    for (var j = len; j--;) {
                        values[i].push(0);
                    }
                }
            }

            total = Math.max.apply(Math, total);
        }

        total = (opts.to) || total;

        var barwidth = width / (len * (100 + gutter) + gutter) * 100,
            barhgutter = barwidth * gutter / 100,
            barvgutter = opts.vgutter == null ? 20 : opts.vgutter,
            stack = [],
            X = x + barhgutter,
            Y = (height - 2 * barvgutter) / total;

        if (!opts.stretch) {
            barhgutter = Math.round(barhgutter);
            barwidth = Math.floor(barwidth);
        }

        barwidth /= multi || 1;

        for (var i = 0; i < len; i++) {
            stack = [];

            for (var j = 0; j < (multi || 1); j++) {
                var h = Math.round((multi ? values[j][i] : values[i]) * Y),
                    top = y + height - barvgutter - h,
                    bar = finger(Math.round(X + barwidth / 2), top + h, barwidth, h, true, type, null, paper).attr({ stroke: "none", fill: colors[multi ? j : i] });

                bars[j].push(bar);

                bar.y = top;
                bar.x = Math.round(X + barwidth / 2);
                bar.w = barwidth;
                bar.h = h;
                bar.value = multi ? values[j][i] : values[i];

                X += barwidth;
            }

            X += barhgutter;
        }

        X = x + barhgutter;


        for (var i = 0; i < len; i++) {
            for (var j = 0; j < (multi || 1); j++) {
                var cover;

                covers.push(cover = paper.rect(Math.round(X), y + barvgutter, barwidth, height - barvgutter).attr(chartinst.shim));
                cover.bar = multi ? bars[j][i] : bars[i];
                cover.value = cover.bar.value;
                X += barwidth;
            }

            X += barhgutter;
        }


        chart.push(bars, covers);
        chart.bars = bars;
        chart.covers = covers;
        //console.log(bars);
        //console.log(covers);
        //console.log(chart);
        return chart;
    };
    
    //inheritance
    var F = function() {};
    F.prototype = Raphael.g;
    VBarchart.prototype = new F; //prototype reused by hbarchart

    Raphael.fn.barchart = function(x, y, width, height, values, opts) {
        return new VBarchart(this, x, y, width, height, values, opts);
    };
    
})();
