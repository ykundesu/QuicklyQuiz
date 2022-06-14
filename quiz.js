window.onbeforeunload = function(e) {
    e.returnValue = "ページを離れようとしています。よろしいですか？";
}
// URL が「http://www.example.com?lib=jquery&ver=3」の場合
var index = 0;
var correct = 0;
$(function () {
    $("#quiz").hide();
    $('#PlayButton').on('click', () => {
        index = -1;
        correct = 0;
        $('#MainTitle').fadeOut();
        Next()
    });
});
var data_json;
var parm = getParam('id');
if (parm == null){
    window.location.href = "../";
} else {
    $.ajax({
        type: "GET",
        url: "./quizdata/" + parm + ".json",
        dataType : "json"
      })
      // Ajaxリクエストが成功した場合
      .done(function(data){
        var data_stringify = JSON.stringify(data);
        data_json = JSON.parse(data_stringify);
        $("title").html(data_json["HtmlTitle"]);
        $("#LOADING").html(" ");
        $("#title").html(data_json["name"]);
        $("#QuizCount").html("クイズ数:"+Object.keys(data_json['Quizs']).length)
        $("#author").html("クイズ製作者:" + data_json["author"]);
        $("#description").html(data_json["description"]);
        for (ind = 0;ind < Object.keys(data_json['Quizs']).length;ind++){
            console.log(ind +" => "+ data_json['Quizs'][ind]["quiz"]);
        }
      })
      // Ajaxリクエストが失敗した場合
      .fail(function(XMLHttpRequest, textStatus, errorThrown){
        window.location.href = "../";
        alert("エラー:"+errorThrown);
      });
}

// タイプ表
// json内のタイプの種類です。
// 0 : 複数から選択
// 1 : ○☓
// 2 : 入力型数字
// 3 : 入力型テキスト

function GetQuizHtml(quizid){
    console.log(Object.keys(data_json['Quizs']).length);
    console.log(quizid);
    if (Object.keys(data_json['Quizs']).length <= quizid) return "";
    var quiz = data_json['Quizs'][quizid];
    var text = "";
    text += '<center><h2>'+quiz["quiz"]+'</h2>';
    var type = quiz["type"]
    var niceans = quiz["niceanswer"];
    switch (type){
        case "0":
            var answers = quiz["badanswers"];
            answers.push(niceans);
            answers = arrayShuffle(answers);
            for (var i = 0;i<answers.length;i++){
                text += '<button type="submit" onclick='+(answers[i] == niceans)+'Answer()>' + answers[i] + "</button>　";
            }
            break;
        case "1":
            text += '<button type="submit" onclick='+(niceans == "true")+'Answer()>○</button>　';
            text += '<button type="submit" onclick='+(niceans != "true")+'Answer()>☓</button>　';
            break;
        case "2":
            text += '<input type="number" id="numinput"></input>　';
            text += '<button type="submit" onclick=SendNum()>決定</button>　';
            break;
        case "2":
            text += '<input type="text" id="numinput"></input>　';
            text += '<button type="submit" onclick=SendNum()>決定</button>　';
            break;
    }
    text += "</center>";
    return text;
}
function SendNum(){
    var quiz = data_json['Quizs'][index];
    console.log("VALUE:"+$("#numinput").val());
    console.log(quiz["niceanswer"]);
    if ($("#numinput").val() == quiz["niceanswer"]){
        trueAnswer();
    } else {
        falseAnswer();
    }
}
function trueAnswer(){
    console.log(index+" => trueAnswer");
    correct++;
    AnswerEnd(true);
}
function falseAnswer(){
    console.log(index+" => falseAnswer");
    AnswerEnd(false);
}
function AnswerEnd(IsCorrect){
    var text = "";
    text += "<center><h1>"
    if (IsCorrect){
        text += "正解"
    } else {
        text += "不正解"
    }
    var quizdata = data_json["Quizs"][index];
    text += "</h1>"
    switch (quizdata["type"]){
        case "0":
        case "2":
        case "3":
            text += "正解:" +  quizdata["niceanswer"] + "<br>"
            break;
        case "1":
            if (quizdata["niceanswer"] == "true"){
            text += "正解:○<br>"
            } else {
                text += "正解:☓<br>"
            }
            break;
    }
    text += quizdata["explanation"] + "<br><br>"
    text += '<button type="submit" onclick="Next()">次へ進む</button>'
    text += "</center>"
    $('#quiz').fadeOut()
    setTimeout(function(){
        $("title").html(data_json["HtmlTitle"] + "｜"+(index+1)+"問目の答え発表");
        $('#quiz').html(text)
        $('#quiz').fadeIn();
    },335);
}
function SetIndex(ind){
    index = ind - 1;
    $('#MainTitle').fadeOut();
    Next();
}
function Next(){
    index++
    if (index >= Object.keys(data_json['Quizs']).length){
        ShowResult();
        return;
    }
    $('#quiz').fadeOut();
    setTimeout(function(){
        $("title").html(data_json["HtmlTitle"] + "｜"+(index+1)+"問目");
        $('#quiz').html(GetQuizHtml(index));
        $('#quiz').fadeIn();
    },335);
}
function ShowResult(){
    var text = "";
    var quizlen = Object.keys(data_json['Quizs']).length;
    text += "<center>"
    text += "<h1>結果発表</h1>"
    text += "正解数:" + correct + "/" + quizlen + "<br>"
    text += "正解率:" + (Math.round(correct / quizlen * 100)) + "%<br>"
    text += '<a href="https://twitter.com/intent/tweet?text='
    text += data_json["HtmlTitle"] + "で"+ quizlen + "問中"+ correct +"問正解しました！\n"
    text += '&url='
    text += window.location.href
    text += '&via=SNRDevs"><img src="https://i.gyazo.com/568a7f19257d6d79acd02d7dd7b1104b.png"></a>'
    text += "</center>"
    $('#quiz').fadeOut();
    setTimeout(function(){
        $("title").html(data_json["HtmlTitle"] + "｜結果発表");
        $('#quiz').html(text);
        $('#quiz').fadeIn();
    },335);
}
/**
 * Get the URL parameter value
 *
 * @param  name {string} パラメータのキー文字列
 * @return  url {url} 対象のURL文字列（任意）
 */
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function arrayShuffle(array) {  
    for(var i = (array.length - 1); 0 < i; i--){
            // 0〜(i+1)の範囲で値を取得 
            var r = Math.floor(Math.random() * (i + 1));
            // 要素の並び替えを実行    
            var tmp = array[i];    
            array[i] = array[r];    
            array[r] = tmp;  
    } 
    return array;
}