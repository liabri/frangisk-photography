// global var holding current horizontalScrolling() instance ID, to delete it on section change
let rafId;

// detect if a mouse is present
var mouseDetected = false;
if (matchMedia("(pointer:fine)").matches) mouseDetected = true;

window.addEventListener("load", function () {
    if (mouseDetected) {
        // enable horizontal scrolling for first section
        horizontalScrolling(0);
        // enable buttons to change section
        try { document.getElementById("right").style.display = "flex"; }  catch {}
        // disable fullPage scrolling between sections
        fullpage_api.setAllowScrolling(false);
    } else {
        // remove "scroll to navigate progress bar"
        document.getElementById("header").style.display = "none";
    }
});

var myFullpage = new fullpage('#fullpage', {
    licenseKey: 'BAkvmgK&b5',

	// Navigation
	menu: '#menu',
	anchors:['tangledTapestry', 'echoesOfTheRoad', 'thePeopleOfDjerdap'],
	navigation: false,

	// Scrolling
	css3: true,
	scrollingSpeed: 700,
	autoScroll: false,
	scrollBar: false,
	scrollOverflow: false,

	// Accessibility
	keyboardScrolling: true,
	touchSensitivity: 12,

	lazyLoading: true,
	lazyLoadThreshold: 0,
	credits: { enabled: true, label: 'made with fullpage.js', position: 'right'},

    // apply horizontalScrolling to current canvas
    onLeave: function(origin, destination, direction, trigger){ if (mouseDetected) horizontalScrolling(destination.index) }
});

// open menu
function show(self, about) {
    if (about) {
        document.getElementById("about").classList.add("active");
    } else {
        document.getElementById("projects").classList.add("active");
    }
}

// close menu
function hide() {
    document.getElementById("about").classList.remove("active");
    document.getElementById("projects").classList.remove("active");
}

function horizontalScrolling(index) {
    var canvasses = [];
    canvasses = document.querySelectorAll(".canvas");
    scrollContainer = canvasses[index];

    if (typeof scrollContainer == 'undefined') {
        scrollContainer = document.getElementById("firstroll");
    }

    try {
        var offsetX = scrollContainer.scrollLeft;
    } catch {
        var offsetX = 0;
    }

    var speedX = 0;
    const deltaMultiplier = 25;
    const maxSpeed = 55;
    const friction = 0.7;

    function draw() {
        cancelAnimationFrame(rafId);

        offsetX += speedX;
        const maxScrollLeft =
            scrollContainer.scrollWidth - scrollContainer.clientWidth;
        offsetX = Math.min(offsetX, maxScrollLeft);
        offsetX = Math.max(offsetX, 0);

        scrollContainer.scrollLeft = offsetX;
        speedX *= friction;

        // update progress bar
        progressBarPercentage=Math.round((offsetX/maxScrollLeft)*100);
        document.getElementById("progressBar").style.width = progressBarPercentage + "%";
        if (progressBarPercentage>4) {
            document.getElementById("progressBarTip").style.opacity = 0;
            document.getElementById("progressBarTip").style.visibility = "hidden";
        } else {
            document.getElementById("progressBarTip").style.opacity = 0.8;
            document.getElementById("progressBarTip").style.visibility = "visible";
        }

        console.log("drawing");

        // about 60 times a second
        rafId = requestAnimationFrame(draw);
    }

    scrollContainer.addEventListener("wheel", (ev) => {
        // ev.preventDefault();
        var delta = -1 * Math.sign(ev.wheelDelta);
        speedX += delta * deltaMultiplier;
        speedX =
            speedX > 0
                ? Math.min(speedX, maxSpeed)
                : Math.max(speedX, -maxSpeed);
        return false;
    }, {passive: true});

    document.addEventListener("keydown", (ev) => {
        // ev.preventDefault();
        delta = 0;
        if (ev.code=="ArrowRight" || ev.code=="ArrowDown") {
            delta = 3;
        } else if (ev.code=="ArrowLeft" || ev.code=="ArrowUp") {
            delta = -3;
        }

        speedX += delta * deltaMultiplier;
        speedX =
            speedX > 0
                ? Math.min(speedX, maxSpeed)
                : Math.max(speedX, -maxSpeed);
        return false;
    }, {passive: true});

    draw();
}

// // Get the current page scroll position
// scrollTop =
//     window.pageYOffset ||
//     document.documentElement.scrollTop;
// scrollLeft =
//     window.pageXOffset ||
//     document.documentElement.scrollLeft,

//     // if any scroll is attempted,
//     // set this to the previous value
//     window.onscroll = function () {
//         window.scrollTo(scrollLeft, scrollTop);
//     };
