//第一个盒子
(function(){
    var parseDate = d3.time.format("%Y-%m").parse,
        formatYear = d3.format("02d"),
        formatDate = function(d) { return "Q" + ((d.getMonth() / 3 | 0) + 1) + formatYear(d.getFullYear() % 100); };

    var margin = {top: 10, right: 20, bottom: 20, left: 60},
        width = 960 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    var y0 = d3.scale.ordinal()
        .rangeRoundBands([height, 0], .2);

    var y1 = d3.scale.linear();

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1, 0);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(formatDate);

    var nest = d3.nest()
        .key(function(d) { return d.group; });

    var stack = d3.layout.stack()
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; })
        .out(function(d, y0) { d.valueOffset = y0; });

    var color = d3.scale.category10();

    var svg = d3.select("#box1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("source/data1.csv", function(error, data) {

        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.value = +d.value;
        });

        var dataByGroup = nest.entries(data);

        stack(dataByGroup);
        x.domain(dataByGroup[0].values.map(function(d) { return d.date; }));
        y0.domain(dataByGroup.map(function(d) { return d.key; }));
        y1.domain([0, d3.max(data, function(d) { return d.value; })]).range([y0.rangeBand(), 0]);

        var group = svg.selectAll(".group")
            .data(dataByGroup)
            .enter().append("g")
            .attr("class", "group")
            .attr("transform", function(d) { return "translate(0," + y0(d.key) + ")"; });

        // added this segment
        var quarterTotal = [];
        for (var i = 0; i < 8; i++) {
            quarterTotal[i] = 0;
        }
        //

        group.append("text")
            .attr("class", "group-label")
            .attr("x", -6)
            .attr("y", function(d) { return y1(d.values[0].value / 2); })
            .attr("dy", ".35em")
            .text(function(d) { return "第" + d.key + "季度"; });

        group.selectAll("rect")
            .data(function(d) { return d.values; })
            .enter().append("rect")
            .style("fill", function(d) { return color(d.group); })
            .attr("x", function(d) { return x(d.date); })
            .attr("y", function(d) { return y1(d.value); })
            .attr("width", x.rangeBand())
            .attr("height", function(d) { return y0.rangeBand() - y1(d.value); });

        // added this segment
        group.selectAll(".value-label")
            .data(function(d) { return d.values; })
            .enter().append("text")
            .attr("class", "value-label")
            .style("fill", "white")
            .style("font-size", "12px")
            .attr("x", function(d) { return x(d.date); })
            .attr("y", y0.rangeBand())
            .attr("dx", ".20em")
            .attr("dy", "-.20em")
            .text(function(d,i) {
                quarterTotal[i] += d.value;
                return d.value;
            });
        //

        group.filter(function(d, i) { return !i; }).append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + y0.rangeBand() + ")")
            .call(xAxis);

        d3.selectAll("input").on("change", change);

        var timeout = setTimeout(function() {
            d3.select("input[value=\"stacked\"]").property("checked", true).each(change);
        }, 2000);

        function change() {
            clearTimeout(timeout);
            if (this.value === "multiples") transitionMultiples();
            else transitionStacked();
        }

        function transitionMultiples() {
            var t = svg.transition().duration(750),
                g = t.selectAll(".group").attr("transform", function(d) { return "translate(0," + y0(d.key) + ")"; });
            g.selectAll("rect").attr("y", function(d) { return y1(d.value); });
            g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2); });

            // added this segment
            g.selectAll(".value-label")
                .attr("y", y0.rangeBand())
                .style("opacity", 1)
                .text(function(d) {
                    return d.value;
                });
            //
        }

        function transitionStacked() {
            var t = svg.transition().duration(750),
                g = t.selectAll(".group").attr("transform", "translate(0," + y0(y0.domain()[0]) + ")");
            g.selectAll("rect").attr("y", function(d) { return y1(d.value + d.valueOffset); });
            g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2 + d.values[0].valueOffset); });

            // added this segment
            g.selectAll(".value-label")
                .attr("y", y1(0))
                .style("opacity", function(d,i,j) {
                    return j === 3 ? "1" : "0";
                })
                .text(function(d,i) {
                    return quarterTotal[i];
                });
            //
        }
    });
})()


//第二个盒子
function distQuant(data, id){

    function getPoints(_, i){		return _.map(function(d,j){ return {x:j, y:d[i]};});	}
    function getPointsZero(_, i, k){		return _.map(function(d,j){ return {x:j, y:(i==k ? d[i] : 0 )};});	}
    function toComma(x) {    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

    var width=350, height=200, margin=20;
    var colors = ["#7D74FE","#7DFF26","#F84F1B","#28D8D5","#FB95B6","#9D9931","#F12ABF","#27EA88","#549AD5","#FEA526","#7B8D8B","#BB755F","#432E16",
        "#D75CFB","#44E337","#51EBE3","#ED3D24","#4069AE","#E1CC72","#E33E88","#D8A3B3","#428B50","#66F3A3","#E28A2A","#B2594D","#609297","#E8F03F","#3D2241",
        "#954EB3","#6A771C","#58AE2E","#75C5E9","#BBEB85","#A7DAB9","#6578E6","#932C5F","#865A26","#CC78B9","#2E5A52","#8C9D79","#9F6270","#6D3377","#551927","#DE8D5A",
        "#E3DEA8","#C3C9DB","#3A5870","#CD3B4F","#E476E3","#DCAB94","#33386D","#4DA284","#817AA5","#8D8384","#624F49","#8E211F","#9E785B","#355C22","#D4ADDE",
        "#A98229","#E88B87","#28282D","#253719","#BD89E1","#EB33D8","#6D311F","#DF45AA","#E86723","#6CE5BC","#765175","#942C42","#986CEB","#8CC488","#8395E3",
        "#D96F98","#9E2F83","#CFCBB8","#4AB9B7","#E7AC2C","#E96D59","#929752","#5E54A9","#CCBA3F","#BD3CB8","#408A2C","#8AE32E","#5E5621","#ADD837","#BE3221","#8DA12E",
        "#3BC58B","#6EE259","#52D170","#D2A867","#5C9CCD","#DB6472","#B9E8E0","#CDE067","#9C5615","#536C4F","#A74725","#CBD88A","#DF3066","#E9D235","#EE404C","#7DB362",
        "#B1EDA3","#71D2E1","#A954DC","#91DF6E","#CB6429","#D64ADC"];

    function draw(type){
        var maxT = d3.max(data[type].map(function(d){ return d3.sum(d); }));

        function tW(d){ return x(d*(data[type].length - 1)/50); }
        function tH(d){ return y(d*maxT/50); }

        var svg =d3.select("#"+id).select("."+type);

        //x and y axis maps.
        var x = d3.scale.linear().domain([0, data[type].length - 1]).range([0, width]);
        var y = d3.scale.linear().domain([0, maxT]).range([height, 0]);

        //draw yellow background for graph.
        svg.append("rect").attr("x",0).attr("y",0).attr("width",width).attr("height",height).style("fill","rgb(235,235,209)");

        // draw vertical lines of the grid.
        svg.selectAll(".vlines").data(d3.range(51)).enter().append("line").attr("class","vlines")
            .attr("x1",tW).attr("y1",0)
            .attr("x2", tW).attr("y2",function(d,i){ return d%10 ==0 && d!=50? height+12: height;});

        //draw horizontal lines of the grid.
        svg.selectAll(".hlines").data(d3.range(51)).enter().append("line").attr("class","hlines")
            .attr("x1",function(d,i){ return d%10 ==0 && d!= 50? -12: 0;})
            .attr("y1",tH).attr("x2", width).attr("y2",tH);

        // make every 10th line in the grid darker.
        svg.selectAll(".hlines").filter(function(d){ return d%10==0}).style("stroke-opacity",0.7);
        svg.selectAll(".vlines").filter(function(d){ return d%10==0}).style("stroke-opacity",0.7);

        function getHLabel(d,i){
            if(type=="dist"){ // for distribution graph use the min and max to get the 5 label values.
                var r= data.distMin+i*(data.distMax-data.distMin)/5;
                return Math.round(r*100)/100;
            }else{ // for quantile graph, use label 20, 40, 60, and 80.
                return (i*20)+' %';
            }
        }

        function getVLabel(d,i){
            if(type=="dist"){ // for dist use the maximum for sum of frequencies and divide it into 5 pieces.
                return Math.round(maxT*i/5);
            }else{ // for quantile graph, use percentages in increments of 20%.
                return (i*20)+' %';
            }
        }
        // add horizontal axis labels
        svg.append("g").attr("class","hlabels")
            .selectAll("text").data(d3.range(41).filter(function(d){ return d%10==0})).enter().append("text")
            .text(getHLabel).attr("x",function(d,i){ return tW(d)+5;}).attr("y",height+14);

        // add vertical axes labels.
        svg.append("g").attr("class","vlabels")
            .selectAll("text").data(d3.range(41).filter(function(d){ return d%10==0 })).enter().append("text")
            .attr("transform",function(d,i){ return "translate(-10,"+(tH(d)-14)+")rotate(-90)";})
            .text(getVLabel).attr("x",-10).attr("y",function(d){ return 5;});

        var area = d3.svg.area().x(function(d) { return x(d.x); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); })
            .interpolate("basis");

        var layers = d3.layout.stack().offset("zero")(data.dP.map(function(d,i){ return getPoints(data[type], i);}));

        svg.selectAll("path").data(layers).enter().append("path").attr("d", area)
            .style("fill", function(d,i) { return colors[i]; })
            .style("stroke", function(d,i) { return colors[i]; });

        //draw a white rectangle to hide and to show some statistics.
        var stat = svg.append("g").attr("class","stat");

        stat.append("rect").attr("x",-margin).attr("y",-margin)
            .attr("width",width+2*margin).attr("height",margin).style("fill","white");

        // show sum and mean in statistics
        if(type=="dist"){
            stat.append("text").attr("class","count").attr("x",20).attr("y",-6)
                .text(function(d){
                    var sum = d3.sum(data.dP.map(function(s){ return s[2];}));
                    return "Count: " +toComma(sum)+" / "+toComma(sum)+" ( 100 % )";
                });

            stat.append("text").attr("class","mean").attr("x",250).attr("y",-6)
                .text(function(d){ return "Mean: " +data.mean;});
        }
    }

    function transitionIn(type, p){
        var maxT = d3.max(data[type].map(function(d){ return d3.sum(d); }));
        var max  = d3.max(data[type].map(function(d){ return d[p]; }));

        var x = d3.scale.linear().domain([0, data[type].length - 1]).range([0, width]);
        var y = d3.scale.linear().domain([0, max]).range([height, 0]);

        function tW(d){ return x(d*(data[type].length - 1)/50); }
        function tH(d){ return y(d*maxT/50); }

        var area = d3.svg.area().x(function(d) { return x(d.x); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); })
            .interpolate("basis");

        var layers = d3.layout.stack().offset("zero")(data.dP.map(function(d,i){ return getPointsZero(data[type], i, p);}));
        var svg = d3.select("#"+id).select("."+type);
        //transition all the lines, labels, and areas.
        svg.selectAll("path").data(layers).transition().duration(500).attr("d", area);

        svg.selectAll(".vlines").transition().duration(500).attr("x1",tW).attr("x2", tW);
        svg.selectAll(".hlines").transition().duration(500).attr("y1",tH).attr("y2",tH);
        svg.selectAll(".vlabels").selectAll("text").transition().duration(500)
            .attr("transform",function(d,i){ return "translate(-10,"+(tH(d)-14)+")rotate(-90)";});

        //update the statistics rect for distribution graph.
        if(type=="dist"){
            svg.select(".stat").select(".count")
                .text(function(d){
                    var sumseg = data.dP[p][2];
                    var sum = d3.sum(data.dP.map(function(s){ return s[2];}));
                    return "Count: " +toComma(sumseg)+" / "+toComma(sum)+" ( "+Math.round(100*sumseg/sum)+" % )";
                });
            svg.select(".stat").select(".mean").text(function(d){ return "Mean: " +data.dP[p][1];});
        }
    }

    function transitionOut(type){
        var maxT = d3.max(data[type].map(function(d){ return d3.sum(d); }));

        function tW(d){ return x(d*(data[type].length - 1)/50); }
        function tH(d){ return y(d*maxT/50); }

        var x = d3.scale.linear().domain([0, data[type].length - 1]).range([0, width]);
        var y = d3.scale.linear().domain([0, maxT]).range([height, 0]);

        var area = d3.svg.area().x(function(d) { return x(d.x); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); })
            .interpolate("basis");
        var layers = d3.layout.stack().offset("zero")(data.dP.map(function(d,i){ return getPoints(data[type], i);}));

        // transition the lines, areas, and labels.
        var svg = d3.select("#"+id).select("."+type);
        svg.selectAll("path").data(layers).transition().duration(500).attr("d", area);
        svg.selectAll(".vlines").transition().duration(500).attr("x1",tW).attr("x2", tW);
        svg.selectAll(".hlines").transition().duration(500).attr("y1",tH).attr("y2",tH);
        svg.selectAll(".vlabels").selectAll("text").transition().duration(500)
            .attr("transform",function(d,i){ return "translate(-10,"+(tH(d)-14)+")rotate(-90)";});

        // for distribution graph, update the statistics rect.
        if(type=="dist"){
            svg.select(".stat").select(".count")
                .text(function(d){
                    var sum = d3.sum(data.dP.map(function(s){ return s[2];}));
                    return "Count: " +toComma(sum)+" / "+toComma(sum)+" ( 100 % )";
                });
            svg.select(".stat").select(".mean").text(function(d){ return "Mean: " +data.mean;});
        }
    }

    function mouseoverLegend(_,p){
        transitionIn("dist", p);
        transitionIn("quant", p);
    }

    function mouseoutLegend(){
        transitionOut("dist");
        transitionOut("quant");
    }
    // add title.
    d3.select("#"+id).append("h3").text(data.title);

    // add svg and set attributes for distribution.
    d3.select("#"+id).append("svg").attr("width",width+2*margin).attr("height",height+2*margin)
        .append("g").attr("transform","translate("+margin+","+margin+")").attr("class","dist");

    //add svg and set attributes for quantil.
    d3.select("#"+id).append("svg").attr("width",width+2*margin).attr("height",height+2*margin)
        .append("g").attr("transform","translate("+margin+","+margin+")").attr("class","quant");

    // Draw the two graphs.
    draw("dist");
    draw("quant");

    // draw legends.
    var legRow = d3.select("#"+id).append("div").attr("class","legend")
        .append("table").selectAll("tr").data(data.dP).enter().append("tr").append("td");
    legRow.append("div").style("background",function(d,i){ return colors[i];})
        .on("mouseover",mouseoverLegend).on("mouseout",mouseoutLegend).style("cursor","pointer");

    legRow.append("span").text(function(d){ return d[0];})
        .on("mouseover",mouseoverLegend).on("mouseout",mouseoutLegend).style("cursor","pointer");
}

function drawAll(data, id){
    var seg = d3.select("#"+id).selectAll("div").data(d3.range(data.length)).enter()
        .append("div").attr("id",function(d,i){ return "segment"+i;}).attr("class","distquantdiv");
    d3.range(data.length).forEach(function(d,i){ distQuant(dqData[i], "segment"+i );});
}
drawAll(dqData, "box2");

//第三个
(function(){
    var data1 = [{value: "42", label: "卡通巡游", valueSuffix: "%"}, {value: "69", label: "好莱坞特技秀", valueSuffix: "%"}, {value: "29", label: "卡通互动表演", valueSuffix: "%"}, {value: "52", label: "魔术表演", valueSuffix: "%"}];
    var config1 = rectangularAreaChartDefaultSettings();
    config1.expandFromLeft = false;
    config1.colorsScale = d3.scale.category20b();
    config1.maxValue = 100;
    loadRectangularAreaChart("rectangularareachart1", data1, config1);

    var data2 = [{value: "78", label: "自驾车", valuePrefix: "Num of "}, {value: "37", label: "旅游巴士", valuePrefix: "Num of "}, {value: "55", label: "轻轨", valuePrefix: "Num of "}];
    var config2 = rectangularAreaChartDefaultSettings();
    config2.colorsScale = d3.scale.ordinal().range(["#fc8d59","#ffffbf","#91bfdb"]);
    config2.textColorScale = d3.scale.ordinal().range(["#444","#333","#222"]);
    config2.labelAlignDiagonal = true;
    config2.valueTextAlignDiagonal = true;
    config2.valueTextPadding.right = 18;
    config2.animateDelay = 1000;
    config2.animateDelayBetweenBoxes = 0;
    config2.valueTextCountUp = false;
    loadRectangularAreaChart("rectangularareachart2", data2, config2);

    var data3 = [{value: "45", label: "王国盛典"}, {value: "34", label: "神奇酷乐小子之消失的魔音"}, {value: "55", label: "梦回伊甸园"}, {value: "64", label: "狂欢加勒比戏水巡游"}, {value: "95", label: "狂欢加勒比影光秀"}, {value: "87", label: "太阳祭传说"}, {value: "80", label: "鬼魅新娘"}];
    var config3 = rectangularAreaChartDefaultSettings();
    config3.expandFromLeft = false;
    config3.expandFromTop = true;
    config3.maxValue = 100;
    config3.colorsScale = d3.scale.ordinal().range(["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016c59","#014636"]);
    config3.textColorScale = d3.scale.ordinal().range(["#555","#777","#999","#aaa","#ddd","#fff","#fff"]);
    config3.animateDelay = 2000;
    loadRectangularAreaChart("rectangularareachart3", data3, config3);

    var data4 = [{value: "56", label: "男性"}, {value: "44", label: "女性"}];
    var config4 = rectangularAreaChartDefaultSettings();
    config4.expandFromLeft = true;
    config4.expandFromTop = true;
    config4.maxValue = 100;
    config4.labelAlignDiagonal = true;
    config4.animateDelay = 3500;
    config4.displayValueText = false;
    config4.animateDelayBetweenBoxes = 0;
    config4.colorsScale = d3.scale.ordinal().range(["#7570b3","#e7298a","#66a61e"]);
    config4.textColorScale = d3.scale.ordinal().range(["#ffffbf","#ffffbf","#66a61e"]);
    loadRectangularAreaChart("rectangularareachart4", data4, config4);
})()


//第5个
function box5(){
    var svg = d3.select("#box5")
        .append("svg")
        .append("g");

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labels");
    svg.append("g")
        .attr("class", "lines");

    var width = 550,
        height = 350,
        radius = Math.min(width, height) / 2;

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    var arc = d3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    svg.attr("transform", "translate(" + width / 2 + "," + height / 1.5 + ")");

    var key = function(d){ return d.data.label; };

    var color = d3.scale.ordinal()
        .domain(["疯狂小镇", "神秘沙漠", "金属工厂", "魔法森林", "传奇城堡", "婚礼殿堂", "美国大街"])
        .range(["#ff4d5a", "#cb9a28", "#9aa5af", "#6ec64d", "#32d3fe", "#d13dc1", "#327ffe"]);

    function randomData (){
        var labels = color.domain();
        return labels.map(function(label){
            return { label: label, value: Math.random() }
        });
    }

    change(randomData());

    setInterval(function(){
        change(randomData());
    },2*1000);

    function change(data) {

        /* ------- PIE SLICES -------*/
        var slice = svg.select(".slices").selectAll("path.slice")
            .data(pie(data), key);

        slice.enter()
            .insert("path")
            .style("fill", function(d) { return color(d.data.label); })
            .attr("class", "slice");

        slice
            .transition().duration(1000)
            .attrTween("d", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    return arc(interpolate(t));
                };
            });

        slice.exit()
            .remove();

        /* ------- TEXT LABELS -------*/
        var text = svg.select(".labels").selectAll("text")
            .data(pie(data), key);

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .text(function(d) {
                return d.data.label;
            });

        function midAngle(d){
            return d.startAngle + (d.endAngle - d.startAngle)/2;
        }

        text.transition().duration(1000)
            .attrTween("transform", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate("+ pos +")";
                };
            })
            .styleTween("text-anchor", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start":"end";
                };
            });

        text.exit()
            .remove();

        /* ------- SLICE TO TEXT POLYLINES -------*/
        var polyline = svg.select(".lines").selectAll("polyline")
            .data(pie(data), key);

        polyline.enter()
            .append("polyline");

        polyline.transition().duration(1000)
            .attrTween("points", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };
            });

        polyline.exit()
            .remove();
    }
}
box5();
