(function(exports) {

function MarioKart() {

    /////////////////////////////// GAME PARAMETER //////////////////////////////////////

    var strPlayer = "browser";
    var strMap = "map1";
    var tryHardness = 0;

    ///////////////////////////// END GAME PARAMETER //////////////////////////////////////

    var initialDate = new Date();
    var currentDate = new Date();
    var initialTime = initialDate.getTime();
    var currentScore = "Up";
    var tabDirection = ["Up","Left","Right"];
    //var socket = io();

   function resetInitialTime(){
       initialDate = new Date();
       initialTime = initialDate;
   }

    var oMaps = {
        "map1": {
            "texture": "media/map_1_rl.png",
            "width": 512,
            "height": 512,
            "collision": [
                [84, 80, 52, 216],
                [68, 276, 20, 56],
                [136, 188, 208, 60],
                [344, 208, 64, 40],
                [368, 248, 40, 160],
                [368, 4, 140, 76],
                [4, 436, 236, 72]
            ],
            "startpositions": [{
                x: 476,
                y: 356
            }, {
                x: 476 - 18,
                y: 356 - 18
            }, {
                x: 476,
                y: 356 - 24
            },{
                x: 476 -18,
                y: 356 - 36
            }],
            "startrotation": 180,
            "aipoints": [
                [467, 273],
                [459, 208],
                [317, 128],
                [160, 50],
                [64, 53],
                [44, 111],
                [38, 272],
                [50, 351],
                [106, 349],
                [215, 300],
                [278, 305],
                [337, 417],
                [405, 451],
                [462, 414]
            ]
        },
        "map2": {
            "texture": "media/map_2.png",
            "width": 512,
            "height": 512,
            "collision": [
                [120, 116, 8, 228],
                [124, 100, 20, 20],
                [140, 88, 16, 16],
                [152, 84, 48, 8],
                [196, 72, 16, 12],
                [208, 68, 96, 8],
                [296, 68, 8, 28],
                [304, 88, 56, 8],
                [352, 96, 8, 196],
                [356, 288, 12, 36],
                [364, 320, 16, 16],
                [376, 332, 16, 16],
                [388, 344, 16, 16],
                [400, 356, 16, 16],
                [412, 368, 12, 24],
                [412, 244, 32, 8],
                [476, 244, 32, 8],
                [204, 0, 100, 36],
                [196, 4, 8, 24],
                [124, 340, 16, 16],
                [136, 352, 16, 16],
                [148, 364, 16, 16],
                [160, 376, 16, 16],
                [172, 388, 12, 12],
                [180, 396, 12, 12],
                [280, 284, 8, 224],
                [268, 272, 16, 16],
                [256, 260, 16, 16],
                [248, 252, 12, 12],
                [240, 244, 12, 12],
                [232, 236, 12, 12],
                [224, 228, 12, 12],
                [216, 220, 12, 12]
            ],
            "startpositions": [{
                x: 70,
                y: 322
            }, {
                x: 70 - 18,
                y: 322 - 18
            }, {
                x: 70,
                y: 322 - 24
            }, {
                x: 70 -18,
                y: 322 - 24
            }],
            "startrotation": 180,
            "aipoints": [
                [64, 253],
                [55, 184],
                [67, 132],
                [141, 59],
                [215, 51],
                [317, 53],
                [416, 51],
                [462, 125],
                [392, 191],
                [399, 270],
                [464, 353],
                [431, 431],
                [347, 373],
                [303, 238],
                [210, 191],
                [187, 253],
                [242, 378],
                [188, 459],
                [87, 420]
            ]
        }
    }
    var aAvailableMaps = ["map1", "map2"];
    // render modes: 0: One screen canvas 1: One canvas per horizontal screen line
    var iRenderMode = 0;
    var iWidth = 80;
    var iHeight = 35;
    var iScreenScale = 8;
    var iQuality = 1; // 1 = best, 2 = half as many lines, etc.
    var bSmoothSprites = true;
    var _self = this;

    function setRenderMode(iValue) {
        if (bCounting) return;
        iRenderMode = iValue;
        if (bRunning) resetScreen();
    }
    this.setRenderMode = setRenderMode;

    function setScreenScale(iValue) {
        if (bCounting) return;
        iScreenScale = iValue;
        if (bRunning) resetScreen();
    }
    this.setScreenScale = setScreenScale;

    function setQuality(iValue) {
        if (bCounting) return;
        iQuality = iValue;
        if (bRunning) resetScreen();
    }
    this.setQuality = setQuality;
    
    var oMap;
    var oHills;
    var oTrees;
    var aCharacters = ["mario", "luigi", "browser", "peach"];
    var aPlayers = ["browser"];
    var oPlayer;
    //this.getoPlayer = function(){ return oPlayer};
    var playerCount = 3;
    var iStartPos = -1;
    var iMapWidth;
    var iMapHeight;
    var oMapImg;


    function resetGame(strMap) {
        oMap = oMaps[strMap];
        loadMap(oMap);
    }
    this.resetGame = resetGame;

    function loadMap() {
        oMapImg = new Image();
        iMapWidth = oMap.width;
        iMapHeight = oMap.height;
        oMapImg.onload = startGame;
        oMapImg.src = oMap.texture;
    }
    var fMaxSpeed = 6;
    var fMaxRotInc = 6;
    var fMaxRotTimer = 0;
    var aKarts = [];
    var bRunning = false;
    var bCounting = false;

    function startGame() {
        resetScreen();
        aKarts = [];
        for (var i = 0, l = aPlayers.length; i < l; ++i) {
            ++iStartPos;
            var p = {
                player: aPlayers[i],
                x: oMap.startpositions[iStartPos].x,
                y: oMap.startpositions[iStartPos].y,
                speed: 0,
                speedinc: 0,
                rotation: oMap.startrotation,
                rotincdir: 0,
                rotinc: 0,
                sprite: new Sprite(aPlayers[i]),
                cpu: false
            };
            if (aPlayers[i] == strPlayer)
                oPlayer = p;
            aKarts.push(p);
        }
        for (i = 0, l = aCharacters.length; i < l; ++i) {
            if (aPlayers.indexOf(aCharacters[i]) === -1) {
                ++iStartPos;
                var oEnemy = {
                    player: aCharacters[i],
                    x: oMap.startpositions[iStartPos].x,
                    y: oMap.startpositions[iStartPos].y,
                    speed: 0,
                    speedinc: 0,
                    rotation: oMap.startrotation,
                    rotincdir: 0,
                    rotinc: 0,
                    sprite: new Sprite(aCharacters[i]),
                    cpu: true,
                    aipoint: 0
                };
                aKarts.push(oEnemy);
            }
        }
        render();
        bCounting = true;
        var oCount = document.createElement("div");
        var oCntStyle = oCount.style;
        oCntStyle.position = "absolute";
        oCntStyle.width = (12 * iScreenScale) + "px";
        oCntStyle.height = (12 * iScreenScale) + "px";
        oCntStyle.overflow = "hidden";
        oCntStyle.top = (4 * iScreenScale) + "px";
        oCntStyle.left = (8 * iScreenScale) + "px";
        var oCountImg = document.createElement("img");
        oCountImg.src = "media/countdown.png";
        oCountImg.style.position = "absolute";
        oCountImg.style.left = "0px";
        oCountImg.height = 12 * iScreenScale;
        oCount.appendChild(oCountImg);
        oContainer.appendChild(oCount);
        var iCntStep = 1;
        oCount.scrollLeft = 0;
        var fncCount = function() {
                oCount.scrollLeft = iCntStep * 12 * iScreenScale;
                iCntStep++;
                if (iCntStep < 4) {
                    setTimeout(fncCount, 1000);
                }
                else {
                    setTimeout(

                    function() {
                        oContainer.removeChild(oCount);
                        bCounting = false;
                    }, 1000);
                    cycle();
                    bRunning = true;
                }
            }
        setTimeout(fncCount, 1000);
    }

    var fSpriteScale = 0;
    var fLineScale = 0;
    // setup main container
    var oContainer = document.createElement("div")
    oContainer.tabindex = 1;
    var oCtrStyle = oContainer.style;
    oCtrStyle.position = "absolute";
    oCtrStyle.border = "2px solid black";
    oCtrStyle.overflow = "hidden";
    document.getElementById("mariokartcontainer").appendChild(oContainer);
    // setup screen canvas for render mode 0.
    var oScreenCanvas = document.createElement("canvas");
    var oScreenCtx = oScreenCanvas.getContext("2d");
    var oScrStyle = oScreenCanvas.style;
    oScrStyle.position = "absolute";
    oContainer.appendChild(oScreenCanvas);
    // setup strip container render mode 1.
    var oStripCtr = document.createElement("div");
    oStripCtr.style.position = "absolute";
    oContainer.appendChild(oStripCtr);
    // array for screen strip descriptions
    var aStrips = [];
    var iCamHeight = 24;
    var iCamDist = 32;
    var iViewHeight = -10;
    var iViewDist = 0;
    var fFocal = 1 / Math.tan(Math.PI * Math.PI / 360);

    function resetScreen() {
        fSpriteScale = iScreenScale / 4;
        fLineScale = 1 / iScreenScale * iQuality;
        aStrips = [];
        oStripCtr.innerHTML = "";
        // change dimensions of main container
        oCtrStyle.width = (iWidth * iScreenScale) + "px";
        oCtrStyle.height = (iHeight * iScreenScale) + "px";
        if (oHills) oContainer.removeChild(oHills.div);
        if (oTrees) oContainer.removeChild(oTrees.div);
        // change dimensions of screen canvas
        oScreenCanvas.width = iWidth / fLineScale;
        oScreenCanvas.height = iHeight / fLineScale;
        oScrStyle.width = (iWidth * iScreenScale + iScreenScale) + "px";
        oScrStyle.left = (-iScreenScale / 2) + "px";
        oScrStyle.top = iScreenScale + "px";
        oScrStyle.height = (iHeight * iScreenScale) + "px";
        oStripCtr.style.width = (iWidth * iScreenScale + iScreenScale) + "px";
        oStripCtr.style.left = (-iScreenScale / 2) + "px";
        var fLastZ = 0;
        // create horizontal strip descriptions
        for (var iViewY = 0; iViewY < iHeight; iViewY += fLineScale) {
            var iTotalY = iViewY + iViewHeight; // total height of point (on view) from the ground up
            var iDeltaY = iCamHeight - iTotalY; // height of point relative to camera
            var iPointZ = (iTotalY / (iDeltaY / iCamDist)); // distance to point on the map
            var fScaleRatio = fFocal / (fFocal + iPointZ);
            var iStripWidth = Math.floor(iWidth / fScaleRatio);
            if (fScaleRatio > 0 && iStripWidth < iViewCanvasWidth) {
                if (iViewY == 0) fLastZ = iPointZ - 1;
                var oCanvas;
                if (iRenderMode == 1) {
                    var oCanvas = document.createElement("canvas");
                    oCanvas.width = iStripWidth;
                    oCanvas.height = 1;
                    var oStyle = oCanvas.style;
                    oStyle.position = "absolute";
                    oStyle.width = (iWidth * iScreenScale + iScreenScale) + "px";
                    oStyle.height = (iScreenScale * fLineScale) + iScreenScale * 0.5;
                    oStyle.left = (-iScreenScale / 2) + "px";
                    oStyle.top = Math.round((iHeight - iViewY) * iScreenScale) + "px";
                    oStripCtr.appendChild(oCanvas);
                }
                aStrips.push({
                    canvas: oCanvas || null,
                    viewy: iViewY,
                    mapz: iPointZ,
                    scale: fScaleRatio,
                    stripwidth: iStripWidth,
                    mapzspan: iPointZ - fLastZ
                })
                fLastZ = iPointZ;
            }
        }
        oHills = new BGLayer("hills", 360);
        oTrees = new BGLayer("trees", 720);
    }
    // setup canvas for holding the currently visible portion of the map
    // this is the canvas used to draw from when rendering
    var iViewCanvasHeight = 90; // these height, width and y-offset values 
    var iViewCanvasWidth = 256; // have been adjusted to work with the current camera setup
    var iViewYOffset = 10;
    var oViewCanvas = document.createElement("canvas");
    var oViewCtx = oViewCanvas.getContext("2d");
    oViewCanvas.width = iViewCanvasWidth;
    oViewCanvas.height = iViewCanvasHeight;

    // canvas timer
    var oViewCanvasTimer = document.createElement("canvas");
    var oViewCtxTimer = oViewCanvasTimer.getContext("2d");
    oViewCanvasTimer.height = 30;
    oViewCanvasTimer.width = 100;

    // canvas score move
    var oViewCanvasMove = document.createElement("canvas");
    var oViewCtxMove = oViewCanvasMove.getContext("2d");
    oViewCanvasMove.height = 100;
    oViewCanvasMove.width = 100;

    function Sprite(strSprite) {
        var oImg = new Image();
        oImg.style.position = "absolute";
        oImg.style.left = "0px";
        oImg.src = "media/sprite_" + strSprite + (bSmoothSprites ? "_smooth" : "") + ".png";
        var oSpriteCtr = document.createElement("div");
        oSpriteCtr.style.width = "32px";
        oSpriteCtr.style.height = "32px";
        oSpriteCtr.style.position = "absolute";
        oSpriteCtr.style.overflow = "hidden";
        oSpriteCtr.style.zIndex = 10000;
        oSpriteCtr.style.display = "none";
        oSpriteCtr.appendChild(oImg);
        oContainer.appendChild(oSpriteCtr);
        var iActiveState = 0;
        this.draw = function(iX, iY, fScale) {
            var bDraw = true;
            if (iY > iHeight * iScreenScale || iY < 6 * iScreenScale) {
                bDraw = false;
            }
            if (!bDraw) {
                oSpriteCtr.style.display = "none";
                return;
            }
            oSpriteCtr.style.display = "block";
            var fSpriteSize = Math.round(32 * fSpriteScale * fScale);
            oSpriteCtr.style.left = Math.round(iX - fSpriteSize / 2) + "px";
            oSpriteCtr.style.top = Math.round(iY - fSpriteSize / 2) + "px";
            oImg.style.height = fSpriteSize + "px";
            oSpriteCtr.style.width = fSpriteSize + "px";
            oSpriteCtr.style.height = fSpriteSize + "px";
            oImg.style.left = -Math.round(fSpriteSize * iActiveState) + "px";
        }
        this.setState = function(iState) {
            iActiveState = iState;
        }
        this.div = oSpriteCtr;
    }

    function BGLayer(strImage, iLayerWidth) {
        var oLayer = document.createElement("div");
        oLayer.style.height = (10 * iScreenScale) + "px";
        oLayer.style.width = (iWidth * iScreenScale) + "px";
        oLayer.style.position = "absolute";
        oLayer.style.overflow = "hidden";
        var oImg1 = new Image();
        oImg1.height = 20;
        oImg1.width = iLayerWidth;
        oImg1.style.position = "absolute";
        oImg1.style.left = "0px";
        var oImg2 = new Image();
        oImg2.height = 20;
        oImg2.width = iLayerWidth;
        oImg2.style.position = "absolute";
        oImg2.style.left = "0px";
        var oCanvas1 = document.createElement("canvas");
        oCanvas1.width = iLayerWidth;
        oCanvas1.height = 20;
        oImg1.onload = function() {
            oCanvas1.getContext("2d").drawImage(oImg1, 0, 0);
        }
        oImg1.src = "media/bg_" + strImage + ".png";
        oCanvas1.style.width = Math.round(iLayerWidth / 2 * iScreenScale + iScreenScale) + "px"
        oCanvas1.style.height = Math.round(10 * iScreenScale) + "px";
        oCanvas1.style.position = "absolute";
        oCanvas1.style.left = "0px";
        var oCanvas2 = document.createElement("canvas");
        oCanvas2.width = iLayerWidth;
        oCanvas2.height = 20;
        oImg2.onload = function() {
            oCanvas2.getContext("2d").drawImage(oImg2, 0, 0);
        }
        oImg2.src = "media/bg_" + strImage + ".png";
        oCanvas2.style.width = Math.round(iLayerWidth / 2 * iScreenScale) + "px";
        oCanvas2.style.height = Math.round(10 * iScreenScale) + "px";
        oCanvas2.style.position = "absolute";
        oCanvas2.style.left = Math.round(iLayerWidth * iScreenScale) + "px";
        oLayer.appendChild(oCanvas1);
        oLayer.appendChild(oCanvas2);
        oContainer.appendChild(oLayer);
        return {
            draw: function(fRotation) {
                // something is wrong in here. For now, it looks fine due to fortunate hill placement
                var iRot = -Math.round(fRotation);
                while (iRot < 0)
                iRot += 360;
                while (iRot > 360)
                iRot -= 360;
                // iRot is now between 0 and 360
                var iScaledWidth = (iLayerWidth / 2 * iScreenScale);
                // one degree of rotation equals x width units:
                var fRotScale = iScaledWidth / 360;
                var iScroll = iRot * fRotScale;
                var iLeft1 = -iScroll;
                var iLeft2 = -iScroll + iScaledWidth;
                oCanvas1.style.left = Math.round(iLeft1) + "px";
                oCanvas2.style.left = Math.round(iLeft2) + "px";
            },
            div: oLayer
        }
    }

    function formatTime(ms){
        var rawSec = parseInt(ms/1000);
        var minute = parseInt(rawSec/60);
        var sec = parseInt(rawSec%60);
        var mSec = parseInt(1000*(ms/1000 - rawSec));
        return String(minute)+':'+String(sec)+'.'+String(mSec);
    }

    function render() {
        // (posx, posy) should be at (iViewCanvasWidth/2, iViewCanvasHeight - iViewYOffset) on view canvas
        oViewCanvas.width = oViewCanvas.width;
        oViewCtx.fillStyle = "green";
        oViewCtx.fillRect(0, 0, oViewCanvas.width, oViewCanvas.height);
        oViewCtx.save();
        oViewCtx.translate(iViewCanvasWidth / 2, iViewCanvasHeight - iViewYOffset);
        oViewCtx.rotate((180 + oPlayer.rotation) * Math.PI / 180);
        oViewCtx.drawImage(oMapImg, -oPlayer.x, -oPlayer.y);
        oViewCtx.restore();
        oScreenCanvas.width = oScreenCanvas.width;
        oScreenCtx.fillStyle = "green";
        oViewCtxTimer.fillStyle = "black";
        oViewCtxTimer.fillRect(0, 0, oViewCanvasTimer.width, oViewCanvasTimer.height);
        oViewCtxTimer.font = "15px bold Arial";
        oViewCtxTimer.fillStyle = "white";
        oViewCtxTimer.fillText(formatTime(new Date().getTime()-initialTime),10,20);
        oViewCtxMove.fillStyle = "black";
        oViewCtxMove.fillRect(0, 0, oViewCanvasMove.width, oViewCanvasMove.height);
        oViewCtxMove.font = "30px bold Arial";
        oViewCtxMove.fillStyle = "white";
        oViewCtxMove.fillText(currentScore,10,75);
        for (var i = 0; i < aStrips.length; i++) {
            var oStrip = aStrips[i];
            if (iRenderMode == 0) {
                try {
                    oScreenCtx.drawImage(
                        oViewCanvas, iViewCanvasWidth / 2 - (oStrip.stripwidth / 2),
                        ((iViewCanvasHeight - iViewYOffset) - oStrip.mapz) - 1, oStrip.stripwidth, oStrip.mapzspan, 0, (iHeight - oStrip.viewy) / fLineScale, iWidth / fLineScale, 1
                    );
                    // add a black area to put the score of the current move
                    oScreenCtx.drawImage(oViewCanvasMove, 0, 50, 
                                oViewCanvasMove.width, oViewCanvasMove.height);
                    // add a black area to put the time of the current lap
                    oScreenCtx.drawImage(oViewCanvasTimer, 0, 155, 
                                oViewCanvasTimer.width, oViewCanvasTimer.height);
                }
                catch (e) {};
            }
            if (iRenderMode == 1) {
                var iStripHeight = Math.max(3, oStrip.mapzspan);
                oStrip.canvas.height = iStripHeight;
                oStrip.canvas.getContext("2d").clearRect(0, 0, oStrip.stripwidth, 1);
                try {
                    oStrip.canvas.getContext("2d").drawImage(
                        oViewCanvas, iViewCanvasWidth / 2 - (oStrip.stripwidth / 2), 
                        ((iViewCanvasHeight - iViewYOffset) - oStrip.mapz) - 1, oStrip.stripwidth, 
                        oStrip.mapzspan, 0, 0, oStrip.stripwidth, iStripHeight
                    );
                }
                catch (e) {};
            }
        }
        var iOffsetX = (iWidth / 2) * iScreenScale;
        var iOffsetY = (iHeight - iViewYOffset) * iScreenScale;
        var zIndexBase = 10000;
        for (var i = 0; i < aKarts.length; i++) {
            var oKart = aKarts[i];
            if (oKart != oPlayer) {
                var fCamX = -(oPlayer.x - oKart.x);
                var fCamY = -(oPlayer.y - oKart.y);
                var fRotRad = oPlayer.rotation * Math.PI / 180;
                var fTransX = fCamX * Math.cos(fRotRad) - fCamY * Math.sin(fRotRad);
                var fTransY = fCamX * Math.sin(fRotRad) + fCamY * Math.cos(fRotRad);
                var iDeltaY = -iCamHeight;
                var iDeltaX = iCamDist + fTransY;
                var iViewY = ((iDeltaY / iDeltaX) * iCamDist + iCamHeight) - iViewHeight;
                var fViewX = -(fTransX / (fTransY + iCamDist)) * iCamDist;
                var fAngle = oPlayer.rotation - oKart.rotation;
                while (fAngle < 0)
                fAngle += 360;
                while (fAngle > 360)
                fAngle -= 360;
                var iAngleStep = Math.round(fAngle / (360 / 22));
                if (iAngleStep == 22) iAngleStep = 0;
                
                oKart.sprite.setState(iAngleStep);
                oKart.sprite.div.style.zIndex = Math.round(zIndexBase - fTransY);
                oKart.sprite.draw(((iWidth / 2) + fViewX) * iScreenScale, (iHeight - iViewY) * iScreenScale, fFocal / (fFocal + (fTransY)));
            }
            else {
                oKart.sprite.div.style.zIndex = zIndexBase;
                oKart.sprite.draw(iOffsetX, iOffsetY, 1);
            }
        }
        oHills.draw(oPlayer.rotation);
        oTrees.draw(oPlayer.rotation);
    }

    function canMoveTo(iX, iY) {
        if (iX > iMapWidth - 5 || iY > iMapHeight - 5) return false;
        if (iX < 4 || iY < 4) return false;
        for (var i = 0; i < oMap.collision.length; i++) {
            var oBox = oMap.collision[i];
            if (iX > oBox[0] && iX < oBox[0] + oBox[2]) {
                if (iY > oBox[1] && iY < oBox[1] + oBox[3]) {
                    return false;
                }
            }
        }
        return true;
    }

    function move(oKart) {
        if (oKart.rotincdir) {
            oKart.rotinc += 2 * oKart.rotincdir;
        }
        else {
            if (oKart.rotinc < 0) {
                oKart.rotinc = Math.min(0, oKart.rotinc + 1);
            }
            if (oKart.rotinc > 0) {
                oKart.rotinc = Math.max(0, oKart.rotinc - 1);
            }
        }
        oKart.rotinc = Math.min(oKart.rotinc, fMaxRotInc);
        oKart.rotinc = Math.max(oKart.rotinc, -fMaxRotInc);
        if (oKart.speed) {
            oKart.rotation += (oKart.speedinc < 0 || (oKart.speedinc == 0 && oKart.speed < 0)) ? -oKart.rotinc : oKart.rotinc;
        }
        if (oKart.rotation < 0) oKart.rotation += 360;
        if (oKart.rotation > 360) oKart.rotation -= 360;
        if (!oKart.cpu) {
            if (oKart.rotincdir == 0) {
                oKart.sprite.setState(0);
            }
            else {
                if (oKart.rotincdir < 0) {
                    if (oKart.rotinc == -fMaxRotInc && fMaxRotTimer > 0 && (new Date().getTime() - fMaxRotTimer) > 800) oKart.sprite.setState(26);
                    else oKart.sprite.setState(24);
                }
                else {
                    if (oKart.rotinc == fMaxRotInc && fMaxRotTimer > 0 && (new Date().getTime() - fMaxRotTimer) > 800) oKart.sprite.setState(27);
                    else oKart.sprite.setState(25);
                }
            }
            if (Math.abs(oKart.rotinc) != fMaxRotInc) {
                fMaxRotTimer = 0;
            }
            else if (fMaxRotTimer == 0) {
                fMaxRotTimer = new Date().getTime();
            }
        }
        oKart.speed += oKart.speedinc;
        var fMaxKartSpeed = fMaxSpeed;
        if (oKart.cpu) fMaxKartSpeed *= 0.95;
        if (oKart.speed > fMaxKartSpeed) oKart.speed = fMaxKartSpeed;
        if (oKart.speed < -fMaxKartSpeed / 4) oKart.speed = -fMaxKartSpeed / 4;
        // move position
        var fMoveX = oKart.speed * Math.sin(oKart.rotation * Math.PI / 180);
        var fMoveY = oKart.speed * Math.cos(oKart.rotation * Math.PI / 180);
        var fNewPosX = oKart.x + fMoveX;
        var fNewPosY = oKart.y + fMoveY;
        if (canMoveTo(Math.round(fNewPosX), Math.round(fNewPosY))) {
            oKart.x = fNewPosX;
            oKart.y = fNewPosY;
        }
        else {
            oKart.speed *= -1;
        }
        // decrease speed
        oKart.speed *= 0.9;
    }

    function ai(oKart) {
        var aCurPoint = oMap.aipoints[oKart.aipoint];
        // first time, get the point coords
        if (!oKart.aipointx) oKart.aipointx = aCurPoint[0];
        if (!oKart.aipointy) oKart.aipointy = aCurPoint[1];
        var iLocalX = oKart.aipointx - oKart.x;
        var iLocalY = oKart.aipointy - oKart.y;
        iRotatedX = iLocalX * Math.cos(oKart.rotation * Math.PI / 180) - iLocalY * Math.sin(oKart.rotation * Math.PI / 180);
        iRotatedY = iLocalX * Math.sin(oKart.rotation * Math.PI / 180) + iLocalY * Math.cos(oKart.rotation * Math.PI / 180);
        var fAngle = Math.atan2(iRotatedX, iRotatedY) / Math.PI * 180;
        if (Math.abs(fAngle) > 10) {
            if (oKart.speed == fMaxSpeed) oKart.speedinc = -0.5;
            oKart.rotincdir = fAngle > 0 ? 1 : -1;
        }
        else {
            oKart.rotincdir = 0;
        }
        oKart.speedinc = 1;
        var fDist = Math.sqrt(iLocalX * iLocalX + iLocalY * iLocalY);
        if (fDist < 40) {
            oKart.aipoint++;
            if (oKart.aipoint >= oMap.aipoints.length) oKart.aipoint = 0;
            var oNewPoint = oMap.aipoints[oKart.aipoint];
            oKart.aipointx = oNewPoint[0] + (Math.random() - 0.5) * 10;
            oKart.aipointy = oNewPoint[1] + (Math.random() - 0.5) * 10;
        }
    }

    console.log("Reinforcement learning -- Let's go !!!!!!");


    ///////////////////////////////    SOCKET      ////////////////////////////////////

    this.moveDirection = function(data){
		if (oPlayer===undefined) {
                oPlayer = {player: "browser", x: 476,y: 456,
                speed: 0,
                speedinc: 0,
                rotation: oMap.startrotation,
                rotincdir: 0,
                rotinc: 0,
                sprite: new Sprite("sprite_browser_smooth.png"),
                cpu: false};
                };
		oPlayer.speedinc = 1
		oPlayer.rotincdir = 0
                currentScore = tabDirection[data];
		var x = oPlayer.x;
		var y = oPlayer.y;
		var rotation = oPlayer.rotation;
                var move = data;
                console.log('x : '+oPlayer.x+' ,y : '+oPlayer.y);
		switch (data) {
		    case 0:
		        // up
		        oPlayer.speedinc = 1;
			console.log('Go up!');
		        break;
		    case 1:
		        // left
		        oPlayer.rotincdir = 1;
		        console.log('Go left!');
		        break;
		    case 2:
		        // right
		        oPlayer.rotincdir = -1;
		        console.log('Go right!');
		        break;
                    // I removed the possibility to go back for the training
		}
		return {x, y, rotation, move};
	}

    function moveRandomPlayer(){
	oPlayer.speedinc = 1
	uni_dir = Math.floor(Math.random() * 3);
	switch (uni_dir) {
            case 0:
                // up
                oPlayer.speedinc = 1;
                break;
            case 1:
                // left
                oPlayer.rotincdir = 1;
                break;
            case 2:
                // right
                oPlayer.rotincdir = -1;
                break;
        }
    }
    
    function cycle() {
        for (var i = 0; i < aKarts.length; i++) {
            if (aKarts[i].cpu) ai(aKarts[i]);
            move(aKarts[i]);
        }
	// move the kart of the player randomly (uniform law)
	//moveRandomPlayer()
        setTimeout(cycle, 1000 / 15);
        if (Math.floor(oPlayer.x/20) > 19 && Math.floor(oPlayer.y/20) === 13){
            resetInitialTime();
	}
        render();
    }

    ///////////////////////////////    END SOCKET      ////////////////////////////////////



    document.onkeydown = function(e) {
        if (!bRunning) return;
        switch (e.keyCode) {
            case 38:
                // up
                oPlayer.speedinc = 1;
                socket.emit('position',{'x':oPlayer.x,
                                        'y':oPlayer.y,
                                        'rotation': oPlayer.rotation,
                                        'move':1});
                break;
            case 37:
                // left
                oPlayer.rotincdir = 1;
                socket.emit('position',{'x':oPlayer.x,
                                        'y':oPlayer.y,
                                        'rotation': oPlayer.rotation,
                                        'move':0});
                break;
            case 39:
                // right
                oPlayer.rotincdir = -1;
                socket.emit('position',{'x':oPlayer.x,
                                        'y':oPlayer.y,
                                        'rotation': oPlayer.rotation,
                                        'move':2});
                break;
            case 40:
                // down
                oPlayer.speedinc -= 0.2;
                break;
        }
    }
    document.onkeyup = function(e) {
        if (!bRunning) return;
        switch (e.keyCode) {
            case 38:
                // up
                oPlayer.speedinc = 0;
                break;
            case 37:
                // left
                oPlayer.rotincdir = 0;
                socket.emit('position',{'x':oPlayer.x,
                                        'y':oPlayer.y,
                                        'rotation': oPlayer.rotation,
                                        'move':1});
                break;
            case 39:
                // right
                oPlayer.rotincdir = 0;
                socket.emit('position',{'x':oPlayer.x,
                                        'y':oPlayer.y,
                                        'rotation': oPlayer.rotation,
                                        'move':1});
                break;
            case 40:
                // down
                oPlayer.speedinc = 0;
                break;
        }
    }

    this.gotoGameStart = function() {
        oScr = null
        if (oScr){
            oScr.innerHTML = "";
            oContainer.removeChild(oScr);
            oScr = oStatus = null;
        }
        resetGame(strMap);
    }
    
    for (var i = 0; i < aCharacters.length; i++) {
        var oImg = new Image();
        oImg.src = "media/sprite_" + aCharacters[i] + "_smooth.png";
    }
    
    this.setStatusMessage = function(msg) {
        if (oStatus && oStatus.firstChild)
            oStatus.firstChild.nodeValue = msg.toString();
    }
    
    // multiplayer logic
    this.addPlayer = function(name) {
        if (bRunning || !name || aPlayers.indexOf(name) > -1)
            return;
        aPlayers.push(name);
    };

    this.setMap = function(map) {
        if (bRunning)
            return;
        strMap = map;
    };

    this.addPlayer(strPlayer);
    this.gotoGameStart();


    this.movePlayer = function(player, data) {
        if (!bRunning || !aKarts.length)
            return;
        for (var i = 0, l = aKarts.length; i < l; ++i) {
            if (aKarts[i].player != player)
                continue;
            for (var j in data)
                aKarts[i][j] = data[j];
        }
    };
    
    this.setPlayerCount = function(num) {
        if (bRunning)
            return;
        playerCount = parseInt(num);
        //_self.emit("playerCountChange", playerCount);
    };
    
    this.getPlayerCount = function() {
        return playerCount;
    };
}

var isArray = Array.isArray || function(arr) {
    return arr && Object.prototype.toString.call(arr) === "[object Array]";
};

// browser detection:
var sAgent = navigator.userAgent.toLowerCase() || "",
    // 1->IE, 0->FF, 2->GCrome, 3->Safari, 4->Opera, 5->Konqueror 
    b      = (typeof/./)[0]=='f'?+'1\0'?3:2:+'1\0'?5:1-'\0'?1:+{valueOf:function(x){return!x}}?4:0;
if((typeof/./)[0]=='f' && parseFloat((sAgent.match(/(?:firefox|minefield)\/([\d\.]+)/i) || {})[1]) <= 2)
    b = 0;
if (b == 2 && sAgent.indexOf("chrome") == -1) 
    b = 3;

var isOpera       = b===4 || b===5;
var isIE          = b===1;

// DOMReady implementation
var load_events = [],
    load_timer  = null,
    load_done   = false,
    load_init   = null;

function execDeferred() {
    var len = load_events.length;
    while (len--)
        (load_events.shift())();
}

function onDomReady(func) {

    if (load_done)
        return func();

    if (!load_init) {
        load_init = function() {
            if (load_done) return;
            clearInterval(load_timer);
            load_timer = null;
            load_done  = true;
            execDeferred();
        };
    }

    load_events.push(func);

    if (func && load_events.length == 1) {
        var doc = document, UNDEF = "undefined";
        if ((typeof doc.readyState != UNDEF && doc.readyState == "complete")
          || (doc.getElementsByTagName("body")[0] || doc.body))
            return load_init();
        if (doc.addEventListener && !isOpera) {
            window.addEventListener("DOMContentLoaded", load_init, false);
        }
        else if (isIE && window == top) {
            load_timer = setInterval(function() {
                try {
                    doc.documentElement.doScroll("left");
                }
                catch(ex) {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                load_init();
            }, 10);
        }
        else if (isOpera) {
            doc.addEventListener("DOMContentLoaded", function() {
                load_timer = setInterval(function() {
                    for (var i = 0, l = doc.styleSheets.length; i < l; i++) {
                        if (doc.styleSheets[i].disabled)
                            return;
                    }
                    // all is fine, so we can call the init!
                    load_init();
                }, 10);
            }, false);
        }
    }
}

exports.onDomReady = onDomReady;

onDomReady(function() {
    exports.MarioKart = new MarioKart();
});

})(self);
