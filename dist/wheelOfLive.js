

// svg - Snap Element

function WheelOfLife(svg, userOpt, userData){
	'use strict';

	// static methods
	if (arguments.length < 1){
		return {
			range: _range,
			createDataArr: _createDataArr,
			randomColors: _randomColors
		}
	};

    var userOpt = userOpt;
	var opt = {

		centreX : 250,
		centreY : 250,
		width : 500,
		height : 500,
		r : 240,
		arcOffset: 0,

		backCircleAttr: {
			fill: '#f00'
		},

		miniSectorAttr: {
			strokeWidth: 1,
			stroke: '#777',
			fill: 'rgba(255, 255, 255, 0.7)',
			strokeLinejoin: 'round',
			strokeLinecap: 'round'
		},
		sectorAttr: {},
		miniSectorHover: [function(){},function(){}],
		backgroundAnimAttr: {},
		backgroundAnimColors: [],
		speedBackgroundAnim: 1000,
		enable: true,
		captionWidth: 30,
		textAttr: {
			fontSize: 30,
			strokeWidth: 0,
			stroke: '#ddd',
			fill: '#fff'
		}
	};

	// пример:
	// data = [{
	// 	name: String,
	// 	value: integer,
	//  caption: String,
	// 	parts:[{
	// 		value: integer,
	// 		groupName: string
	// 	}]
	// }];

	var data = [];

	var sectors = [];

	_init();
	function _init(){
		for(var option in userOpt){
			if(!userOpt.hasOwnProperty(option)){
				continue;
			}
			opt[option] = userOpt[option];
		}
		for(var option in userData){
			if(!userData.hasOwnProperty(option)){
				continue;
			}
			data[option] = userData[option];
		}
		drawAll();
	};

	function drawAll(){
		var f = svg.filter(Snap.filter.shadow(0, 0, 4, '#000', 1));
		svg.circle(opt.centreX,opt.centreY,opt.r + opt.captionWidth -1)
		.attr(opt.backCircleAttr)
		.attr({
			filter: f
		});

		drawSectors();
	}

	function drawSectors(){

		if(data.length < 2){
			throw new Error("Количество секторов должно быть больше 1, педик!");
		}

		var step = 360 / data.length;

		if(opt.backgroundAnimColors.length < data.length){
			opt.backgroundAnimColors = opt.backgroundAnimColors.concat(
				WheelOfLife().randomColors(
					data.length - opt.backgroundAnimColors.length));
		}

		for (var i = 0; i < data.length; i++) {

			sectors.push(new Sector(svg, {
				centreX: opt.centreX,
				centreY: opt.centreY,
				r: opt.r,
				arc1: i*step + 90 + opt.arcOffset,
				arc2: (i+1)*step + 90 + opt.arcOffset,
				miniSectorAttr: opt.miniSectorAttr,
				sectorAttr: {},
				miniSectorHover: opt.miniSectorHover,
				backgroundAnimAttr: opt.backgroundAnimAttr,
				backgroundAnimColor: opt.backgroundAnimColors[i],
				speedBackgroundAnim: opt.speedBackgroundAnim,
				enable: opt.enable,
				captionWidth: opt.captionWidth,
				textAttr: opt.textAttr
			}, {
				parts: data[i].parts,
				name: data[i].name,
				value: data[i].value,
				caption: data[i].caption
			}))
		};
		svg.selectAll('.path').forEach(function(item){
			item.prependTo(svg)
		});
	}

	this.getData = function(){
		var result = {};
		sectors.forEach(function(item){
			result[item.getData().name] = item.getData().value;
		});
		return result;
	}

	function Sector(svg, userOpt, userData){

		var isDrawed = false;

		var elem; 

		var svg = svg;

		var opt = {
			centreX: 0,
			centreY: 0,
			r: 0,
			arc1: 0,
			arc2: 0,
			sectorAttr: {},
			miniSectorAttr:{
				strokeWidth: 1,
				stroke: '#333',
				fill: 'none'
			},
			miniSectorHover: [function(){},function(){}],
			backgroundAnimAttr: {},
			speedBackgroundAnim: 1000,
			backgroundAnimColor: "#555",
			enable: true,
			captionWidth: 30,
			textAttr: {
				fontSize: 30,
				strokeWidth: 0,
				stroke: '#ddd',
				fill: '#fff'
			}
		}

		var data = {
			name: 'default',
			caption: 'default',
			value: 0,
			parts: []
		}

		var backgroundAnim;

		_init();
		function _init(){
			for(var option in userOpt){
				if(!userOpt.hasOwnProperty(option)){
					continue;
				}
				opt[option] = userOpt[option];
			}
			for(var option in userData){
				if(!userData.hasOwnProperty(option)){
					continue;
				}
				data[option] = userData[option];
			}
			drawAll();
		};

		function drawSectorGroup(){
			var step = opt.r / data.parts.length;
			var group = svg.g();
			backgroundAnim = new MiniSector(group, {
					centreX: opt.centreX,
					centreY: opt.centreY,
					r1: 0,
					r2: 0,
					arc1: opt.arc1,
					arc2: opt.arc2,
					miniSectorAttr: opt.backgroundAnimAttr,
					speedBackgroundAnim: opt.speedBackgroundAnim
				});
			backgroundAnim.el().attr({
				fill: opt.backgroundAnimColor
			});
			for (var i = 0; i < data.parts.length; i++) {
				new MiniSector(group, {
					centreX: opt.centreX,
					centreY: opt.centreY,
					r1: step*(i+1),
					r2: step*i,
					arc1: opt.arc1,
					arc2: opt.arc2,
					miniSectorAttr: opt.miniSectorAttr,
					miniSectorHover: opt.miniSectorHover,
					clickHandler: function(target, optTarget, dataTarget){
						if(!opt.enable) return false;
						backgroundAnim.animateRadius(optTarget.r1, 100);
						data.value = dataTarget.value;
					}
				}, {
					value: data.parts[i].value,
					groupName: data.name
				});
				if(i + 1 == data.value){
					backgroundAnim.animateRadius(step*(i+1));
				}
			};

			group.attr(opt.sectorAttr);

			return group;
		}

		function drawAll(){
			if(isDrawed) {
				return false;
			}
			isDrawed = true;
			
			elem = drawSectorGroup()
				.attr(opt.sectorAttr)
			for(var option in data){
				if(!data.hasOwnProperty(option)){
					continue;
				}
				elem.data(option,data[option]);
			}
			drawCaption();
		}

		function drawCaption(){

			var r1 = opt.r + opt.captionWidth;
			var r2 = opt.r;

			var center = {
				x: opt.centreX,
				y: opt.centreY
			}

			var radian2 = Snap.rad(opt.arc2);

			var endX1 = Math.sin(radian2)*r1 + center.x;
			var endY1 = Math.cos(radian2)*r1 + center.y;

			var textRadius = r2 + 10;

			var textPath = elem.path(MiniSector().getArcPath(
						opt.arc2, opt.arc1, textRadius, false, center))
				.attr({
					fill: 'none',
					stroke: 'none',
					strokeWidth: 0
				})
				.addClass('path');

			var textStart = Math.abs(Snap.rad(opt.arc1 - opt.arc2)*textRadius);

			var caption = elem.prepend(elem.text(textStart/2, 0, data.caption)
				.attr({
					textpath: textPath,
					textAnchor: 'middle'
				}).attr(opt.textAttr));

			elem.prepend(elem.path( MiniSector().getArcPath(
						opt.arc1, opt.arc2, r2, false, center)+
				' L'+endX1+','+endY1+ ' ' +
						MiniSector().getArcPath(
						opt.arc2, opt.arc1, r1, true, center)+
				' Z')
			.attr({
				fill: opt.backgroundAnimColor
			}));
		}

		this.getData = function(){
			return data;
		}

		this.el = function(){
			return elem;
		}

	}

    // класс мини сектора
    // имеет data данные
	function MiniSector(svg, userOpt, userData){

		// static methods
		if (arguments.length < 1){
			return {
				getArcPath: getArcPath
			}
		};


		var isDrawed = false;

		var elem; 

		var svg = svg;

		var opt = {
			centreX: 0,
			centreY: 0,
			r1: 0,
			r2: 0,
			arc1: 0,
			arc2: 0,
			miniSectorAttr: {
				strokeWidth: 2,
				stroke: '#333',
				fill: 'none'
			},
			miniSectorHover: [function(){},function(){}],
			speedBackgroundAnim: 1000
		}

		var data = {
			value: 1,
			groupName: 'default'
		}
		_init();
		function _init(){
			for(var option in userOpt){
				if(!userOpt.hasOwnProperty(option)){
					continue;
				}
				opt[option] = userOpt[option];
			}
			for(var option in userData){
				if(!userData.hasOwnProperty(option)){
					continue;
				}
				data[option] = userData[option];
			}

			drawAll();
		};

		function getMiniSectorPath(){

			var radian2 = Snap.rad(opt.arc2);

			var endX1 = Math.sin(radian2)*opt.r1 + opt.centreX;
			var endY1 = Math.cos(radian2)*opt.r1 + opt.centreY;

			return getArcPath(opt.arc1, opt.arc2, opt.r2)+
				' L'+endX1+','+endY1+ ' ' +
				getArcPath(opt.arc2, opt.arc1, opt.r1, true)+
				' Z';
		}

		function getArcPath(arc1, arc2, r, withoutStart, center){
			var centreX;
			var centreY;

			if(center){
				centreX = center.x;
				centreY = center.y;
			}else{
				centreX = opt.centreX;
				centreY = opt.centreY;
			}

			if(!r) return 'M'+centreX+','+centreY;

			var radian1 = Snap.rad(arc1);
			var radian2 = Snap.rad(arc2);

			var startX = Math.sin(radian1)*r + centreX;
			var startY = Math.cos(radian1)*r + centreY;

			var endX = Math.sin(radian2)*r + centreX;
			var endY = Math.cos(radian2)*r + centreY;

			var largeFlag = Math.abs(arc1-arc2) < 180 ? '0' : '1' ;

			var sweepFlag = arc1 - arc2 < 0 ? '0' : '1';

			var start = withoutStart ? '' : 'M'+startX+','+startY+' ';

			return start+'A'+r+','+r+' 0 '+largeFlag+','+sweepFlag+' '+endX+','+endY;
		}

		function drawAll(){
			if(isDrawed) {
				return false;
			}
			isDrawed = true;

			elem = svg.path(getMiniSectorPath());

			elem.attr(opt.miniSectorAttr)
				.hover(opt.miniSectorHover[0],opt.miniSectorHover[1])
				.click(clickHandler);
			for(var option in data){
				if(!data.hasOwnProperty(option)){
					continue;
				}
				elem.data(option, data[option]);
			}
		}

		function clickHandler(){
			opt.clickHandler(this, opt, data);
		}

		this.getData = function(){
			return data;
		}

		this.el = function(){
			return elem;
		}

		this.animateRadius = function(r){
			opt.r1 = r;
			elem.animate({
				d: getMiniSectorPath()
			}, opt.speedBackgroundAnim);
			return this;
		} 

	}


	// static methods

	function _range(start, step, count){
		var arr = [];
		for(var i = 0; i < count; i++){
			arr.push(start);
			start+=step;
		}
		return arr;
	}

	function _createDataArr(sectorsNameArr, valueRange, values, captions){
		var arr = [];
		values = !!values ? values : [];
		captions = !!captions ? captions : [];
		for(var i = 0; i < sectorsNameArr.length; i++){
			var partsArr = [];
			for(var j = 0; j < valueRange.length; j++){
				partsArr.push({
					value: valueRange[j],
					groupName: sectorsNameArr[i]
				});
			}

			arr.push({
				name: sectorsNameArr[i],
				caption: captions.length > i ? captions[i] : 'default',
				value: values.length > i ? values[i] : 0,
				parts: partsArr
			});
		}

		return arr;
	}

	function _randomColors(count){
		var colors = [];
		for (var i = 0; i < count; i++) {
			colors.push(Snap.rgb(random(50, 255), random(50, 255), random(50, 255)));
		};
		return colors;
		function random(min, max){
			return Math.floor(Math.random()*(max-min) + min);
		}
	}
}
