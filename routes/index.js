const router = require('koa-router')()

//静态ziyuan的路径
const static_img_path="http://118.89.233.19/"
//连接数据库
const mongoose =require("mongoose")
mongoose.connect("mongodb://localhost:27017/brain_twists",{useNewUrlParser: true})
const db=mongoose.connection;
db.on("error",console.error.bind(console,'connection error'))
db.once('open',function(){console.log('connection success')})

//创建数据表模型
let userSchema=new mongoose.Schema({
	username:{type:String},
	password:{type:String},
	headImg:{type:String},
	sex:{type:Number},
	nick:{type:String}
},{collection:'user'});

let bannerSchema=new mongoose.Schema({
	name:{type:String}
},{collection:'banner'});
//mongo模型
let userModule=mongoose.model('user',userSchema)
let bannerModule=mongoose.model('banner',bannerSchema)
router.get('/', async (ctx, next) => {
  await ctx.render('index')
})



//注册
router.post('/reg', async (ctx, next) => {
	const req=ctx.request.body;
	await userModule.find({'username':req.username},function(err,doc){
	  if(doc.length>0){
		ctx.body={
			code:0,
			msg:"该账号已注册!"
		}
	  }else{
		  var obj=new userModule({
			  username:req.username,
			  password:req.password,
			  headImg:"head.jpg",
			  sex:1,
			  nick:"游客-"+parseInt(Math.random()*Math.random()*100)
		  })
		  obj.save();
		  ctx.body={
			  code:1,
			  msg:"注册成功!"
		  }
	  }
	})
})
//登陆
router.post('/login',async(ctx,next)=>{
	const req=ctx.request.body;
	await userModule.find(req,function(err,doc){
		if(doc.length>0){
			let user=doc[0];
			let obj={id:user.id,nick:user.nick,headImg:static_img_path+user.headImg,sex:user.sex}
			ctx.body={
				code:1,
				data:obj,
				msg:"登录成功!"
			}
		}else{
			ctx.body={
				code:0,
				msg:"账号或密码错误!"
			}
		}
	})
})

//getBanner
router.get('/getBanner',async(ctx,next)=>{
	await bannerModule.find({},function(err,doc){
		if(doc.length>0){
			var arr=[];
			doc.forEach(function(i,j){
				arr.push(static_img_path+'images/'+i.name);
			});
			ctx.body={
				code:1,
				data:arr
			}
		}else{
			ctx.body={
				code:0,
				data:[]
			}
		}
	})
})

//修改用户的昵称
router.post('/editNick',async(ctx,next)=>{
	let req=ctx.request.body;
	await userModule.update({_id:req.id},{nick:req.value},{multi:false},(err,doc)=>{
		ctx.body={
			code:1,
			msg:'修改成功!'
		}
	})
})
//修改用户的性别
router.post('/editSex',async(ctx,next)=>{
	let req=ctx.request.body;
	await userModule.update({_id:req.id},{sex:req.value},{multi:false},(err,doc)=>{
		ctx.body={
			code:1,
			msg:'修改成功!'
		}
	})
})
//上传头像
router.post('/upload',async(ctx,next)=>{
	let req=ctx.request.body;
	let imgPath=ctx.request.files.file.path;
	let savePath=(imgPath.slice(imgPath.indexOf("uploads"))).replace(/\\/g,"/")
	await userModule.update({_id:req.id},{headImg:savePath},{multi:false},(err,doc)=>{
		ctx.body={
			code:1,
			headImg:static_img_path+savePath
		}
	})
	
})


module.exports = router
