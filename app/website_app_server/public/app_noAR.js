$(document).ready(function() {


    $(".buddy").on("swiperight", function() {
        popup();
        $(this).addClass('rotate-left').delay(300).fadeOut(1);
        $(this).removeClass('transparent').fadeOut(100);
        $('.buddy').find('.status').remove();
        // $(this).find('.transparent').remove();

        $(this).append('<div class="status like"><img style="width:50%;" src="./textures/frames/like.png"></div>');
        if ($(this).is(':last-child')) {
            lastpopup();
            $('.buddy:nth-child(1)').removeClass('rotate-left rotate-right').fadeIn(300);

        } else {
            $(this).next().addClass('visible').fadeIn(300);
            $(this).next().removeClass('rotate-left rotate-right').fadeIn(400);
        }
    });

    $(".buddy").on("swipeleft", function() {
        $(this).addClass('rotate-right').delay(300).fadeOut(1);
        $(this).removeClass('transparent').fadeOut(100);

        $('.buddy').find('.status').remove();
        $(this).append('<div class="status dislike"><img style="width:50%;left:60%;" src="./textures/frames/dislike.png"></div>');

        if ($(this).is(':last-child')) {
            lastpopup();
            $('.buddy:nth-child(1)').removeClass('rotate-left rotate-right').fadeIn(300);

            // alert(' MTA: This is the last stop of this train.');
        } else {
            $(this).next().addClass('visible').fadeIn(300);

            $(this).next().removeClass('rotate-left rotate-right').fadeIn(400);

        }
    });

});


let movers = [];
let moverNum = 60;
let mouse_force_weight = 0.5;
let mouse;

let attracting = true; //鼠标是吸引还是抵抗

let mouth, arrow;
let counter = 0.0;
let statues = [];

let fontBold;

let memes = [
    "I\’m usually a gold medalist, but I’ll make sure you come first tonight. You know you can submit someting to me on the bottom right?",
    "Why did the cookie go to the hospital?? Submit something back to me for the answer!",
    "Marry me.",
    "Are you emotionally unavailable or emotionally damaged? You don't rly need to answer me, but if you want to there is a submit button",
    "My mom told me not to talk to strangers online, but I’ll make an exception for you.",
    "Want to engage in a textually active relationship?Let me know? Submit button at the bottom right.",
    "Hello…it’s me…",
    "I think you’re attractive and would love to get to know you without a screen involved.",
    "You know what would be great? Talking to you.",
    "Are you Catfishing someone? Just checking…",
    "If you had been on the Titanic instead of Jack, I bet Rose would have made room for you on the headboard.",
    "Sup boo (sorry I couldn’t pull that off but it’s nice to unofficially meet you)",
    "What emoji is your spirit emoji?",
    "You look like you’d be fun to sit next to in bed with while we both stare at our phones.",
    "I can Google how to say Hi in like, 101 languages. Wanna see?",
    "Are you a Kelly, a Michelle, or a Beyoncé? If you are a Michelle then let me know? Submit button at the bottom right."

]


function preload() {
    arrow = loadImage("./textures/arrow_w.png");
    // mouth = loadImage("./textures/bg/mouth.png");
    for (let i = 1; i <= 6; i++) {
        statues.push(loadImage("./textures/statue/" + i + ".png"));
    }

}

function setup() {
    createCanvas(windowWidth, windowHeight);
    console.log(statues.length);
    noCursor();
    imageMode(CENTER);

    var canvas = document.getElementsByTagName("CANVAS")[0];
    canvas.style.cursor = 'none';
    canvas.style.position = "fixed";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.zIndex = "-20";

    // noStroke();
    // 在setup中定义声明每一个小boid
    for (let i = 0; i < moverNum; i++) {
        let boid = new Boid(random(0.5, 3), random(50, 100), random(height));
        movers.push(boid);
    }

    ellipseMode(CENTER);
};

function draw() {
    background(247, 63, 104);
    // 鼠标的位置转换成向量
    mouse = createVector(mouseX, mouseY);
    if (attracting) {
        // 如果是吸引模式
        // 将鼠标的吸引力赋予给每一个mover
        for (let i = 0; i < movers.length; i++) {
            let mouseForce = movers[i].seek(mouse); //先通过每个mover自带的seek函数得出吸引力
            movers[i].applyForce(mouseForce);
        }
    } else {
        //如果是反抗模式
        for (let i = 0; i < movers.length; i++) {
            let mouseForce = movers[i].repel(mouse); //变换为通过每个mover自带的repel函数得出反抗力
            movers[i].applyForce(mouseForce);
        }
    }


    // 对每一个mover进行操控， 更新，显示
    for (let i = 0; i < movers.length; i++) {
        movers[i].flock(movers);
        movers[i].update();
        movers[i].display();
        movers[i].checkEdges();
    }

    let increment = TWO_PI / 60;
    let a = 30;
    let basicSize = 60;
    // 用sin方式让嘴巴大小和声音音量大小有变化
    let scale = a * sin(increment * counter) + a + basicSize;
    factor = createVector(scale, scale);
    strokeWeight(20);
    textSize(26);
    text("← Swipe Here ←", width - width * 0.36, height*0.45, scale);

    counter++;
}

function popup() {
    let index = floor(random(memes.length));
    document.getElementById('popup').innerHTML = memes[index];
    document.getElementById('blocker').style.display = "block";
}
function lastpopup() {
    
    document.getElementById('popup').innerHTML = "out of swipe, refresh page to restart";
    document.getElementById('blocker').style.display = "block";
}

function cancel() {
    document.getElementById('blocker').style.display = "none";
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}