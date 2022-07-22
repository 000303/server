const express = require('express');//아까 설치한 라이브러리 첨부해줘
const { MongoClient } = require('mongodb');
const app = express(); //app(새로운 객체)에 express 모듈 불러오기, 새로운 객체 만들기
//const MongoClient=require('mongodb').MongoClient;
//서버열기 어디에다?->8080 port에 서버 띄워라 listen(서버띄울 포트번호, 띄운 후 실행할 코드)
//메소드오버라이드라는 라이브러리 이용하기위해 작성
const methodOverride=require('method-override')
app.use(methodOverride('_method'))

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

var db;//어떤폴더에 데이터저장할거니?
MongoClient.connect('mongodb+srv://yerin0303:im40787393@cluster0.3rsxlsr.mongodb.net/?retryWrites=true&w=majority',function(error,client){
    if(error) return console.log(error);
    db = client.db('todoapp'); //todoapp이라는 database(폴더)에 연결좀요
    
    /*db.collection('post').insertOne({_id:100, 이름: 'yerin', 나이: 23},function(error,result){
        console.log('저장완료');
    }); //post라는 이름의 파일에 insertOne{자료}*/

    app.listen(8081, function() {
        console.log('listening on 8081') //pc의 60000개의 네트워크 통신을 위한 포트중 하나인 8080으로 서버띄우기
    });
})


//누군가가 /pet(경로=url로 방문을하면 pet관련 안내문을 띄워주자)
/*app.get('/pet', function(요청,응답){
    응답.send('펫용품쇼핑사이트입니다');
  });
*/
// html파일 보낼거야 .sendFile(보낼파일경로)
/* app.get('/',function(요청,응답){
    응답.sendFile(__dirname+'/index.html')
})
*/ 

//데이터정제하기: 파일 가져오면 깨진 문자로 받지 않기위해
app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res) { 
    res.render('index.ejs');
});
app.get('/write', function(req, res) { 
    res.render('write1.ejs');
});




//어떤 사람이 /add 경로로 pst요청을 하면 ~해주세요
app.post('/add', function(req,res) {
    //res.send('전송완료'); //html화면에 한줄짜리 말 띄워주기
    console.log(req.body.doToday);
    console.log(req.body.detail);
    //counter라는 collection에서 name:'게시물갯수'인 데이터를 찾아주세요
    db.collection('counter').findOne({ name:'게시물갯수'}, function(error,result){
        console.log(result.totalPost);//서버에 있는 총 게시물 갯수
        var totalPost=result.totalPost;

        db.collection('post').insertOne({_id : totalPost+1 , 제목: req.body.doToday, 세부사항:req.body.detail},function(error,result){
            console.log('저장완료'); //글발행하고 다음에 증가
            //counter라는 콜렉션에 있는 totalPost라는 항목도 1증가 시켜야한다.(수정)
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc :{totalPost:1} },function(error,result){
                if(error) { return console.log(error)}
                res.redirect('/list');
            })
        });   
    });
    //db에 저장해주세요
    /*
    db.collection('post').insertOne({_id:totalPost+1 , 제목: req.body.doToday, 세부사항:req.body.detail},function(error,result){
        console.log('저장완료');
    });
    */
    /*db연동객체: client
    client.query('insert into userdata(name, age) vaules (?,?)',[name, age]) {

    });
    */
});
// /list로 get요청으로 접속하면 html을 보여줌.
// 실제 db에 저장된 데이터들로 예쁘게 꾸며진html보여줌
app.get('/list', function(req,res){
    //db에 저장된 post라는 collection안의 (모든,아이디가 뭐인, 제목이 뭐인 ) 데이터를 꺼내주세요
    db.collection('post').find().toArray(function(error,result){
        console.log(result);
        res.render('list.ejs',{ posts: result }); //서버에서 html말고 ejs파일보내주는법..
    });
   
});

app.delete('/delete',function(req,res){
    console.log(req.body); //요청시 함께 보낸 데이터(아까 그 게시물 번호)를 찾으려면 이렇게
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, function(error,result){
        console.log('삭제완료');
        res.status(200).send({ message: '성공했습니다' }); //응답코드400을 보내줘+메세지도보내줘. 서버는 꼭 뭔가 응답해줘야함
    })
});

app.get('/detail/:id',function(req, res){
   
    db.collection('post').findOne({_id : parseInt(req.params.id) },function(error,result){
        if(error){return console.log('error')}
        console.log(result);
        res.render('detail.ejs',{ data :result}) //result는 위의 값을 찾은 결과가 담겨짐.찾은 결과를 ejs파일에 넣어줌
    })
    
})
//수정하는 페이지
app.get('/edit/:id', function(req, res) { //ㅣㅡid에 4넣으면 여기 4
    db.collection('post').findOne({_id: parseInt(req.params.id)}, function(error,result){
        if(error){return console.log('error');}
        console.log(result);
        res.render('edit.ejs',{post :result});
    })
    
});

app.put('/edit',function(req,res){
    //폼에담긴 제목데이터,세부사항데이터를 갖고 db.collection에 업데이트함
    db.collection('post').updateOne({_id: parseInt(req.body.id) },{ $set : {제목:req.body.doToday , 세부사항: req.body.detail }},function(error,result){
        console.log('수정완료');
        res.redirect('/list');  //성공하고 url로 이동시켜주기
    })
})
//설치한 라이브러리 쓰기 위해 require
const passport= require('passport');
const LocalStrategy= require('passport-local').Strategy;
const session= require('express-session');
//미들웨어: 요청-응답 중간에 뭔가 실행되는 코드. 직접만들기도 가능
app.use(session({secret:'비밀코드', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req,res){ //로그인 페이지 라우팅하기
    res.render('login.ejs')
});

app.post('/login', passport.authenticate('local',{
    failureRedirect : '/fail'   //로그인 실패하면 이 경로로 이동해주세요 (라잉브러리 사용법보고)
}), function(req,res){ //아이디/비번 맞으면 로그인 성공페이지로 보내줘야함
    res.redirect('/')  //성공하면 여기로
});

//아이디 비번 인증하는 세부 코드 작성. 인증하는 방법을 strategy라고함
passport.use(new LocalStrategy({
    usernameField: 'id',  //form의 name 속성 적는 것. 사용자가 제출한 아이디가 어디 적혔는지
    passwordField: 'pw',  //사용자가 제출한 비번이 어디 적혔는지
    session: true,        //세션 만들건지
    passReqToCallback: false,  //아이디/비번 말고 다른 정보검사가 필요한지
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));