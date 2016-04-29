var express = require("express");
var bodyParser = require('body-parser');
var path= require("path");
var mongoose=require("mongoose");
var Movie=require("./models/movie");

var _ = require("underscore");

var port = process.env.PORT||3000;
var app = express();

mongoose.connect("mongodb://localhost/imooc");

app.set("views","./views");
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.locals.moment=require("moment");

app.listen(port);
console.log("服务是否成功启动－端口号：",port);

app.get("/",function(req,res){
	Movie.fetch(function(err,movies){
		if(err){
			console.log(err);
		}
		res.render("pages/index",{
			title:"imooc 首页",
			movies:movies
		});
	});
});

app.get("/detail/:id",function(req,res){//详情页
	var id=req.params.id;
	Movie.findById(id,function(err,movie){
		res.render("pages/detail",{
			title:"imooc 详情页",
			movie:movie
		});
	});
});

app.get("/admin",function(req,res){
	res.render("pages/admin",{
		title:"imooc 后台录入页",
		movie:{
			title:"名字",
			doctor:"导演",
			country:"国家",
			year:2016,
			poster:"海报",
			flash:"链接",
			summary:"简介",
			language:"语言"
		}
	});
});

//更新操作
app.get("/admin/update/:id",function(req,res){
	var id=req.params.id;
	if(id){
		Movie.findById(id,function(err,movie){
			res.render("pages/admin",{
				title:"更新操作",
				movie:movie
			});
		});
	};
});

//后台录入存储
app.post("/admin/new",function(req,res){

	var id=req.body.movie._id;
	var movieObj=req.body.movie;
	var _movie;

	if(id!=="undefined"&&id!==""){
		Movie.findById(id,function(err,movie){
			if(err){
				console.log(err);
			}
			_movie=_.extend(movie,movieObj);
			_movie.save(function(err,movie){
				if(err){
					console.log(err);
				}
				res.redirect("/detail/"+movie._id);
			});
		});
	}else{
		_movie= new Movie({
			doctor:movieObj.doctor,
			title:movieObj.title,
			language:movieObj.language,
			country:movieObj.country,
			summary:movieObj.summary,
			flash:movieObj.flash,
			poster:movieObj.poster,
			year:movieObj.year
		});
		_movie.save(function(err,movie){
			if(err){
				console.log("新数据保存",err);
			}
			res.redirect("/detail/"+ movie._id);
		});
	};
});

app.get("/list",function(req,res){
	Movie.fetch(function(err,movies){
		if(err){
			console.log(err);
		}
		res.render("pages/list",{
			title:"imooc 列表页",
			movies:movies
		});
	});	
});

app.delete("/admin/list",function(req,res){
	var id=req.query.id;
	if(id){
		Movie.remove({_id:id},function(err,movie){
			if(err){
				console.log(err);
			}else{
				res.json({success:1});
			}
		});
	}
});

