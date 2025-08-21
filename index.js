let scrollEnabled = false;

document.addEventListener("DOMContentLoaded", () => {
    // landing page logic
    const landing = document.getElementById("landing");
    const content = document.getElementById("content");

    // if (!sessionStorage.getItem('hasVisited')) {

        // prevent scrolling in section until entered site
        if (typeof fullpage_api !== 'undefined') {
            fullpage_api.setAutoScrolling(false);
            fullpage_api.setKeyboardScrolling(false);
        }
        function enterSite() {
            content.style.display = "block";
            document.body.classList.add("site-entered");

            // opens section specified in url
            if (typeof fullpage_api !== 'undefined') {
                fullpage_api.setAutoScrolling(true);
                fullpage_api.setKeyboardScrolling(true);
            }

            // after the transition finishes, hide the landing page
            landing.addEventListener('transitionend', () => {
                landing.style.display = 'none';
                scrollEnabled = true;
            });
        }

        // enter on click, scroll or key press
        const excludedKeys = ['Control', 'Alt', 'Shift', 'Meta'];
        window.addEventListener("keydown", (e) => { if (!excludedKeys.includes(e.key)) { enterSite(); }}, { once: true });
        landing.addEventListener("click", enterSite, { once: true });
        window.addEventListener("wheel", enterSite, { once: true });
    // } else {
    //     isTransitionLocked = false;
    //     enable_fullpage_scroll();
    //     scrollEnabled = true;
    //     content.style.display = "block";
    //     landing.style.display = 'none';
    // }

    // disable select features on non mouse devices
    window.addEventListener("load", function () {
        if (matchMedia("(pointer:fine)").matches) {
            // horizontalScrollEnabled = false;
            // horizontalScrolling(0); // disable horizontal scrolling
            // document.getElementById("header").style.display = "none"; // enable scrolling progress bar
        }
    });

    document.getElementById('projector-overlay').addEventListener('animationend', () => {
        document.body.classList.remove('is-changing-section');
        isTransitionLocked = false;
    });

    var myFullpage = new fullpage('#fullpage', {
        licenseKey: 'BAkvmgK&b5',

    	// navigation
    	menu: '#menu',
    	anchors:['tangledTapestry', 'echoesOfTheRoad', 'thePeopleOfDjerdap'],
    	navigation: false,

    	// scrolling
    	css3: true,
    	scrollingSpeed: 400,
    	autoScroll: true,
    	scrollBar: false,

    	// accessibility
    	keyboardScrolling: true,
    	touchSensitivity: 12,

    	lazyLoading: true,
    	lazyLoadThreshold: 0,
    	credits: { enabled: false, label: 'made with fullpage.js', position: 'right'},

        onLeave: function(origin, destination, direction) {
            if (document.body.classList.contains('is-changing-section')) {
                return;
            }

            isTransitionLocked = true;
            document.body.classList.add('is-changing-section');
            // document.getElementById('projector-sound')?.play(); // sound effect?

            setTimeout(() => { // after the shutter covers the screen:
                fullpage_api.silentMoveTo(destination.index + 1); // perform the invisible jump.
                scrollEnabled=true;

                const projectsElement = document.querySelector('#projects');
                if (projectsElement && projectsElement.classList.contains('active')) {
                    // if the change is effectuated from the projects page, reset to beginning of project. would be annoying to scroll backwards in to the previous project and end up at the beginning again.
                    const activeSection = document.querySelector('.fp-section.active');
                    const sectionInner = activeSection.querySelector('.section-inner');
                    sectionInner.scrollLeft = 0;
                    sectionInner.currentScrollX = 0;
                    sectionInner.targetScrollX = 0;

                    // hide the projects page
                    projectsElement.style.transition = 'none'; // remove projects animation for performance
                    projectsElement.classList.remove("active");
                    setTimeout(() => {
                        projectsElement.style.transition = ''; // re-add
                    }, 100);

                    // match nav to section
                    const section = document.querySelector('.fp-section.active'); // currently active section
                    const bgSource = section.querySelector('[id$="Canvas"]'); // try to find the first div ending with 'Canvas' inside the section
                    const nav = document.querySelector('nav ul');
                    nav.style.background = getComputedStyle(bgSource).background;
                    nav.style.color = "";
                    nav.style.borderColor = "";
                }
            }, 350);

            return false;
        },

        afterLoad: function(origin, destination, direction){
            setTimeout(() => {
                isTransitionLocked = false;
            }, 1300); // grace period to absorb leftover scroll events and wait for transition

            // match nav to section
            const section = destination.item; // currently active section
            const bgSource = section.querySelector('[id$="Canvas"]'); // try to find the first div ending with 'Canvas' inside the section
            const nav = document.querySelector('nav ul');
            nav.style.background = getComputedStyle(bgSource).background;
        }
    });

    // handle logic ourselves
    fullpage_api.setAllowScrolling(false);

    document.querySelectorAll('.section-inner').forEach(sectionInner => {
        sectionInner.currentScrollX = sectionInner.scrollLeft;
        sectionInner.targetScrollX = sectionInner.scrollLeft;
        sectionInner.isScrolling = false;
    });

    // some smooooth horizontal scrolling, only when a mouse is detected
    if (matchMedia("(pointer:fine)").matches) {
        window.addEventListener('wheel', function(e) {
            if (!scrollEnabled) return;

            if (isTransitionLocked) {
                e.preventDefault();
                return;
            }

            const activeSection = document.querySelector('.fp-section.active');
            if (!activeSection) return;

            const sectionInner = activeSection.querySelector('.section-inner');

            // If the active section doesn't have a horizontal sectionInner,
            // or if it's not wide enough to scroll, let fullpage work normally.
            if (!sectionInner || sectionInner.scrollWidth <= sectionInner.clientWidth) {
                fullpage_api.setAllowScrolling(true);
                return;
            }

            const edgeThreshold = 50;
            const atLeftEdge = sectionInner.currentScrollX < edgeThreshold;
            const atRightEdge = sectionInner.currentScrollX >= sectionInner.scrollWidth - sectionInner.clientWidth - edgeThreshold;
            const scrollingUp = e.deltaY < 0;
            const scrollingDown = e.deltaY > 0;

            if ((scrollingUp && atLeftEdge) || (scrollingDown && atRightEdge)) {
                if (isTransitionLocked) return;

                // Check if a vertical move is possible before locking.
                const sections = document.querySelectorAll('.fp-section');
                const sectionIndex = Array.from(sections).indexOf(activeSection);
                const canMoveUp = scrollingUp && sectionIndex > 0;
                const canMoveDown = scrollingDown && sectionIndex < sections.length - 1;

                if (canMoveUp || canMoveDown) {
                    // isTransitionLocked = true;
                    if (canMoveUp) {
                        fullpage_api.moveSectionUp();
                    } else {
                        fullpage_api.moveSectionDown();
                    }
                }
                // If a move is not possible (e.g., scrolling up on the first section),
                // we simply do nothing, and the scroll is ignored, preventing a lock.

            } else {
                // Perform horizontal scroll
                sectionInner.targetScrollX += e.deltaY;
                sectionInner.targetScrollX = Math.max(0, Math.min(sectionInner.targetScrollX, sectionInner.scrollWidth - sectionInner.clientWidth));

                if (!sectionInner.isScrolling) {
                    sectionInner.isScrolling = true;
                    requestAnimationFrame(() => smoothScroll(sectionInner));
                }
            }
        }, { passive: false });
    }


     // A single, generic animation function
     function smoothScroll(sectionInner) {
         // Stop if the sectionInner is no longer active or the animation flag is turned off, and set section back to beginning
         if (!sectionInner.closest('.fp-section.active') || !sectionInner.isScrolling) {
             sectionInner.isScrolling = false;
             return;
         }

         // Lerp logic
         sectionInner.currentScrollX += (sectionInner.targetScrollX - sectionInner.currentScrollX) * 0.1;
         sectionInner.scrollLeft = sectionInner.currentScrollX;

         // Stop when we're close enough to the target
         if (Math.abs(sectionInner.targetScrollX - sectionInner.currentScrollX) < 0.5) {
             sectionInner.isScrolling = false;
             return;
         }

         // Continue the animation
         requestAnimationFrame(() => smoothScroll(sectionInner));
     }
});

// show/hide nav section
function hide_unless_show(self) {
    const active = document.querySelector(".active");
    const target = self.id === "explore-button" ? "projects" : "about";

    // if current matches the hover, close; if current does not match the hover, close current and open new one; if nothing is open, show
    if (active && active.id === target) {
        hide();
    } else {
        if (active) hide();
        show(self);
    }
}

function show(self) {
    if (isTransitionLocked) return;
    const nav = document.querySelector('nav ul');

    // if (about) {
    if (self.id=="about-button") {
        const close = document.querySelector('#about .close');
        nav.style.backgroundColor = "rgba(255, 254, 237, 0.9)";
        close.style.backgroundColor = "rgba(255, 254, 237, 0.9)";
        document.getElementById("about").classList.add("active");
    }
    else if (self.id=="explore-button") {
        nav.style.backgroundColor = "#090909";
        nav.style.borderColor= "rgba(255, 254, 237, 0.9)";
        nav.style.color = "rgba(255, 254, 237, 0.9)";

        const close = document.querySelector('#projects .close');
        close.style.backgroundColor = "#090909";

        document.getElementById("projects").classList.add("active");
    }

    scrollEnabled=false;
}

function hide() {
    scrollEnabled=true;

    document.getElementById("about").classList.remove("active");
    document.getElementById("projects").classList.remove("active");

    // match nav to section
    const section = document.querySelector('.fp-section.active'); // currently active section
    const bgSource = section.querySelector('[id$="Canvas"]'); // try to find the first div ending with 'Canvas' inside the section
    const nav = document.querySelector('nav ul');
    nav.style.background = getComputedStyle(bgSource).background;
    nav.style.color = "";
    nav.style.borderColor = "";
}
