var puzzle;

var acrossClues;
var downClues;
var zoomVal = 0;
var dragger;

var prevSelectectedLiId;
var canvasFix = 0.5;
var solvedState;
var canvas;
var stage;
var grid;
var gridContainer;
var board;
var cellSize;
var cellMap;
var selectedCell = null;
var selectedCells = [];
var clueNumbers = {};
var horizontal = true;
var selectedWord;
var currentCache;
var canvasScale = 1;
var draggingCanvas;
var canvasX = 0;
var canvasY = 0;
var offsetX;
var offsetY;

var currentX = 0;
var currentY = 0;
var innerHeight;
var timer = new Timer();

var RESIZE_OPTION = {
    RESET:"reset",
    ZOOM_IN:"zoomIn",
    ZOOM_OUT:"zoomOut",
    UNKNOWN:"unknown"
}

function supportsTouch() {
    return (('ontouchstart' in window)
    || (navigator.MaxTouchPoints > 0)
    || (navigator.msMaxTouchPoints > 0));
}

function mouseScrolled(e) {
    // var delta = 0;
    // e = e || window.event;

    // if (e.wheelDelta)
    //     delta = e.wheelDelta / 120;
    // else if (e.detail)
    //     delta = -e.detail / 3;

    // if (delta)zoomBoard(delta);
    // if (e.preventDefault)
    //     e.preventDefault();
    // e.returnValue = false;
}

function zoomBoard(delta) {
    // resizeGrid(delta < 0 ? RESIZE_OPTION.ZOOM_OUT : RESIZE_OPTION.ZOOM_IN);
}

function startGame() {
    centerBoard();
    $('#intro').hide();
    $('#crossword').css('top', 0);

    if (!supportsTouch()){
        canvas.addEventListener('mousedown', canvasMouseDown, false);
        canvas.addEventListener('mouseup', canvasMouseUp, false);
        canvas.addEventListener('mousemove', canvasMouseMove, false);

        // dragger[0].onmousewheel = mouseScrolled;
        // dragger[0].addEventListener('DOMMouseScroll', mouseScrolled, false);
    }
}

function selectFirstWord(){
    if ($('#content').width() > 600 && !supportsTouch())
        $('.clue_list li a').first().click();
}

function centerBoard(){
    // var left = (board.width() - dragger.width()) / 2;
    // dragger.css("left", Math.round(left));
    // var top = ((board.height()) - dragger.height()) / 2;
    // dragger.css("top", Math.round(top));
}

function resizeGrid(option) {

    if (option == RESIZE_OPTION.UNKNOWN) {
        resize();
        centerBoard();
    }

    if (option == RESIZE_OPTION.RESET) {

        zoomVal = 1;
        canvasScale = 1;
        centerBoard();

        canvasX = 0;
        canvasY = 0;

        transformDragger(canvasScale, canvasX, canvasY);
    }
    if (option == RESIZE_OPTION.ZOOM_IN) {

        zoomVal = 1;
        if (canvasScale != 5) {
            canvasScale += 0.1;
            canvasScale = Math.min(canvasScale, 5);
            transformDragger(canvasScale, canvasX, canvasY);
        }
    }
    if (option == RESIZE_OPTION.ZOOM_OUT) {
        zoomVal = 1;

        if (canvasScale != 1) {
            canvasScale -= 0.1;
            canvasScale = Math.max(canvasScale, 1);

            transformDragger(canvasScale, canvasX, canvasY);

            var x = ((dragger.width() * canvasScale - dragger.width()) / 2) - ((board.width() - dragger.width()) / 2);
            x = (board.width() > dragger.width() * canvasScale) ? 0 : x;

            var height = (dragger.height() * canvasScale - dragger.height()) / 2;
            var totalHeight = ((dragger.height() * canvasScale - dragger.height()) / 2) + (dragger.height() - board.height());


            if (canvasX >= x) {
                transformDragger(canvasScale, x, canvasY);
                canvasX = x;
            }
            else if (canvasX < -x) {
                transformDragger(canvasScale, -x, canvasY);
                canvasX = -x;
            }
            if (canvasY >= height) {
                transformDragger(canvasScale, canvasX, height)
                canvasY = height;
            }
            else if (canvasY < -totalHeight) {
                transformDragger(canvasScale, 'canvasX', -totalHeight);
                canvasY = -totalHeight;
            }
            if (canvasScale < 1) {
                transformDragger(canvasScale, 0, 0);
                canvasX = 0;
                canvasY = 0;
            }
        }
    }
}

function canvasMouseDown(e) {
    transformDragger(canvasScale, canvasX, canvasY);
    draggingCanvas = draggingCanvas ? false : true;

    offsetX = e.clientX;
    offsetY = e.clientY;
}

function canvasMouseUp(ev) {

    draggingCanvas = false;
    var finalMatrix = dragger.css("-moz-transform");
    if (finalMatrix == undefined)finalMatrix = dragger.css("-ms-transform");
    if (finalMatrix == undefined)finalMatrix = dragger.css("-o-transform");
    if (finalMatrix == undefined)finalMatrix = dragger.css("-webkit-transform");
    var parts = finalMatrix.split(',');
    var tempX = parseInt(parts[4]);
    var tempY = parseInt(parts[5]);
    canvasX = tempX;
    canvasY = tempY;
    var newX = ((dragger.width() * canvasScale - dragger.width()) / 2) - ((board.width() - dragger.width()) / 2);

    newX = (board.width() > dragger.width() * canvasScale)? 0 : newX;
    var newY = (dragger.height() * canvasScale - dragger.height()) / 2;
    var height = ((dragger.height() * canvasScale - dragger.height()) / 2) + (dragger.height() - board.height());
    if (tempX >= newX) {

        transformDragger(canvasScale, newX, currentY);
        currentX = newX;
        canvasX = newX;
    }
    else if (tempX < -newX) {
        transformDragger(canvasScale, -newX, currentY);
        currentX = -newX;
        canvasX = -newX;
    }
    if (tempY >= newY) {
        transformDragger(canvasScale, currentX, newY);
        currentY = newY;
        canvasY = newY;
    }
    else if (tempY < -height) {
        transformDragger(canvasScale, currentX, -height);
        currentY = -height;
        canvasY = -height;
    }
    if (canvasScale < 1) {
        transformDragger(canvasScale, 0, 0);
        canvasX = 0;
        canvasY = 0;
    }
}

function canvasMouseMove(e) {
    if (draggingCanvas) {
        var x = e.clientX - offsetX + canvasX;
        var y = e.clientY - offsetY + canvasY;
        transformDragger(canvasScale, x, y);
    }
}

function transformDragger(scale, x, y){
    dragger.css("-moz-transform", "matrix(" + scale + ",0,0," + scale + "," + x + "px," + y + "px)");
    dragger.css("-ms-transform", "matrix(" + scale + ",0,0," + scale + "," + x + "," + y + ")");
    dragger.css("-o-transform", "matrix(" + scale + ",0,0," + scale + "," + x + "," + y + ")");
    dragger.css("-webkit-transform", "matrix(" + scale + ",0,0," + scale + "," + x + "," + y + ")");
}

function clearBoard(){

    $('.fixed-action-btn').closeFAB();
    $('#clear_title').html(puzzle.labels.clear_dialog_title);
    $('#clear_warning').html(puzzle.labels.clear_dialog_text);

    $('#modal4').openModal();

    $('#btn-yes').click(function(){
       clearEntireGrid();
        deselectWord();
        currentCache = [];
        selectFirstWord();

    });
}

function setCanvasDimensions(){

    var rows = puzzle.width;
    var columns = puzzle.height;
    var maxwidth = board.width();
    var maxHeight = board.height()-10;

    var boxWidth = parseInt(maxwidth / columns);
    var boxHeight = parseInt(maxHeight / rows);

    var boxSize;
    if (boxWidth >= boxHeight) {
        boxSize = maxHeight/rows;
        canvas.width = canvas.height = maxHeight;
    } else {
        boxSize = maxwidth/columns;
        canvas.width = canvas.height = maxwidth;
    }

    dragger.width(canvas.width);
    dragger.height(canvas.height);

    cellSize = {width: boxSize, height: boxSize};
}

function setLabels() {
    $('#crossword_theme').html(puzzle.labels.crossword_theme);
    $('#description').html(puzzle.labels.description);

    $('#help_text').html(puzzle.labels.help_text);
    $('#help_title').html(puzzle.labels.help_title);
    $('.game_title').html(puzzle.labels.game_title);
    $('#btn_dialog_close').html(puzzle.labels.button_label_dialog_close);

    $('#across_label').html(puzzle.labels.across);
    $('#down_label').html(puzzle.labels.down);

    $('#congrat_title').html(puzzle.labels.congrat_title);
    $('.dialog_close').html(puzzle.labels.button_label_dialog_close);
    $('#btn_share_win').html(puzzle.labels.btn_label_share_win);

    $('#btn-yes').html(puzzle.labels.btn_label_yes);
    $('#btn-no').html(puzzle.labels.btn_label_no);

    $('#reveal_letter').html(puzzle.labels.reveal_letter);
    $('#reveal_word').html(puzzle.labels.reveal_word);
    $('#submit').html(puzzle.labels.submit_answer);
}

function setupGameMenu(){

    var btn_menu_opener = $('.fixed-action-btn');
    var btn_menu_clear = $('#btn_menu_clear');
    var btn_menu_reveal_word = $('#btn_menu_reveal_word');
    var btn_menu_reveal_letter = $('#btn_menu_reveal_letter');
    var btn_menu_check = $('#btn_menu_check');


    if(supportsTouch()){
        btn_menu_opener.addClass('click-to-toggle');
    }

    if ($('#content').width() <= 600){
        btn_menu_reveal_letter.parent().remove();
        btn_menu_reveal_word.parent().remove();
    }
}

function resize() {

    if(selectedCell){
        var tmpSelectedX = selectedCell.gridX;
        var tmpSelectedY = selectedCell.gridY;
    }

    gridContainer.removeAllChildren();
    for(var x = 0; x < cellMap.length; x++) {
        for(var y = 0; y < cellMap[x].length; y++) {
            if(cellMap[x][y]){
                cellMap[x][y] = null;
            }
        }
    }

    setCanvasDimensions();
    createCrosswordGrid();
    restoreGridState();

    if(selectedCell){
        if(selectedWord)
            selectClue(selectedWord,true);
        selectedCell = cellMap[tmpSelectedX][tmpSelectedY];
        selectedCell.setSelected(true);
    }

    stage.update();

}


function showSuccess(){

    $('#key_interceptor').blur();

    $('#modal3').openModal();

    setTimeout(function(){
        $(".check").attr("class", "check check-complete");
    }, 500);
}

function setupClueLists(){

    var acrossUl = $('#across_list_ul');
    var downUl = $('#down_list_ul');

    for(var i=0;i<acrossClues.length;i++){
        acrossUl.append('<li id="clue_H_'+ acrossClues[i].number +'" ><a class="clue_text">' + acrossClues[i].number + '. ' + acrossClues[i].clue + '</a></li>');
    }

    for(var i=0;i<downClues.length;i++){
        downUl.append('<li id="clue_V_'+ downClues[i].number +'" ><a class="clue_text">' + downClues[i].number + '. ' + downClues[i].clue + '</a></li>');
    }

    $('.clue_list li a').hover(function(){
            if(!$(this).hasClass('clue_highlight')){
                $(this).addClass('clue_hover');
            }
        },
        function(){
            $('.clue_list li a').removeClass('clue_hover');
        });


    var parent, ink, d, x, y;

    $('.clue_list li a').click(function(e){
        var selectedId = $(this).parent().attr('id');
        var num = selectedId.substring(selectedId.lastIndexOf('_') + 1);
        num = parseInt(num);

        var dir = extractDirectionFromClueLi($(this));

        selectClue({number:num,across:dir=='H'?true:false});

        parent = $(this).parent();

        if(parent.find(".ink").length == 0)
            parent.prepend("<span class='ink'></span>");

        ink = parent.find(".ink");

        ink.removeClass("animate");

        if(!ink.height() && !ink.width()){
            d = Math.max(parent.outerWidth(), parent.outerHeight());
            ink.css({height: d, width: d});
        }

        x = e.pageX - parent.offset().left - ink.width()/2;
        y = e.pageY - parent.offset().top - ink.height()/2;

        ink.css({top: y+'px', left: x+'px'}).addClass("animate");

        renderClue(false);

        $('#key_interceptor').focus();
    });
}

function extractDirectionFromClueLi(li){
    var id = li.parent().attr('id');
    return id.substr(id.indexOf('_')+1, 1);
}

function createSolvedCrosswordGrid() {
    var grid = createEmptyCrosswordGrid(puzzle.width, puzzle.height);
    var answer;
    for(var x = 0; x < acrossClues.length; x++) {
        answer = acrossClues[x].answer;
        for(var i = 0; i < answer.length; i++) {
            grid[acrossClues[x].x + i][acrossClues[x].y] = {letter: answer[i]};
        }
    }
    for(var y = 0; y < downClues.length; y++) {
        answer = downClues[y].answer;
        for(var i = 0; i < answer.length; i++) {
            grid[downClues[y].x][downClues[y].y + i] = {letter: answer[i]};
        }
    }
    return grid;
}

function setCrosswordNumbers() {
    var cols = solvedState[0].length;
    var rows = solvedState.length;
    var number = 1;
    for( var y = 0; y < rows; y++) {
        for(var x = 0; x < cols; x++) {
            if((findClosestWord(x, y, 1, 0) && !findClosestWord(x, y, -1, 0)) || (findClosestWord(x, y, 0, 1) && !findClosestWord(x, y, 0, -1))){
                for(var i = 0; i < acrossClues.length; i++) {
                    if(acrossClues[i].x == x && acrossClues[i].y == y) {
                        acrossClues[i].number = number;
                    }
                }
                for(var i = 0; i < downClues.length; i++) {
                    if(downClues[i].x == x && downClues[i].y == y) {
                        downClues[i].number = number;
                    }
                }
                if(solvedState[x][y]) {
                    solvedState[x][y].number = number;
                    number++;
                }
            }
        }
    }
}

function cacheCurrentGridState(){
    var cols = solvedState[0].length;
    var rows = solvedState.length;
    currentCache = createEmptyCrosswordGrid(rows, cols)
    for(var x = 0; x < cellMap.length; x++) {
        for(var y = 0; y < cellMap[x].length; y++) {
            if(cellMap[x][y]) {
                currentCache[x][y] = cellMap[x][y].letter

            }
        }
    }
}

function doInitialSelection(){
    var cols = solvedState[0].length;
    var rows = solvedState.length;
    currentCache = createEmptyCrosswordGrid(rows, cols);
    selectFirstWord();
}

function restoreGridState(){
    for(var x = 0; x < currentCache.length; x++) {
        for(var y = 0; y < currentCache[x].length; y++) {
            if(currentCache[x][y]) {
                cellMap[x][y].letter = currentCache[x][y]
                cellMap[x][y].update();
            }
        }
    }
}

function createCrosswordGrid(){
    stage = new createjs.Stage(canvas);
    stage.snapToPixelEnabled=true;
    stage.enableMouseOver();

    createjs.Touch.enable(stage);
    var columns = solvedState.length;
    var rows = solvedState[0].length;

    gridContainer = new createjs.Container();
    cellMap = createEmptyCrosswordGrid(rows, columns);

    setCanvasDimensions();

    stage.addChild(gridContainer);

    var cells = solvedState;
    for(var x = 0; x < cells.length; x++) {
        for(var y = 0; y < cells[x].length; y++) {

            var cell = cells[x][y];

            if(typeof cell != 'undefined') {
                var ct = new Cell(cell.number, x, y);
                setCell(x, y, ct);
            }else{
                var empty = new createjs.Container();
                var shape=new createjs.Shape();
                shape.snapToPixel = true;
                shape.graphics.beginFill(puzzle.settings.empty_cell_color);
                shape.graphics.drawRect(0,0,cellSize.width,cellSize.height);
                shape.graphics.endFill();
                shape.graphics.setStrokeStyle(1)
                shape.graphics.beginStroke(puzzle.settings.cell_line_color);
                shape.graphics.moveTo(0,0);
                shape.graphics.lineTo(0,cellSize.width);

                shape.graphics.moveTo(0,0);
                shape.graphics.lineTo(cellSize.width,0);
                shape.graphics.endStroke();
                empty.addChild(shape);
                empty.x = Math.floor(x * cellSize.width)- canvasFix;
                empty.y = Math.floor(y * cellSize.height)- canvasFix;
                empty.cursor = 'move';
                gridContainer.addChild(empty)
            }
        }
    }
    stage.update();
}

function highlightWord(clue){
    for(var i = 0; i < selectedCells.length; i++) {
        selectedCells[i].highlight(false);
    }

    selectedCells = findWordCells.apply(this, [clueNumbers[clue.number], clue.across]);
    for(var i = 0; i < selectedCells.length; i++) {
        selectedCells[i].highlight(true);
    }
}

function selectClue(clue, resizing){

    highlightWord(clue);

    selectedWord = clue;

    if(!resizing){
        if(selectedCell) {
            selectedCell.setSelected(false);
        }
        selectedCell = selectedCells[0];
        selectedCell.setSelected(true);
        gridContainer.parent.update();
    }

    $("#header_clue").html(getClueByNumber(selectedWord));
}

function findWordCells(cell, horizontal) {
    var x,y;
    if(horizontal) {
        x = 1;
        y = 0;
    }else{
        x = 0;
        y = 1;
    }
    return findCompleteWord.apply(this, [cell, -x, -y]).concat([cell]).concat(findCompleteWord.apply(this, [cell, x, y]));
}

function findCompleteWord(cell, x, y) {
    var wordCells = [];
    var nextCell = findConsecutiveCell(cell, x, y);
    while(nextCell) {
        wordCells.push(nextCell);
        nextCell = findConsecutiveCell(nextCell, x, y);
    }
    if(x < 0 || y < 0) {
        wordCells.reverse();
    }
    return  wordCells;
}

function findConsecutiveCell(cell, x, y){
    var cells = {x:cell.gridX, y:cell.gridY};
    cells.x += x;
    cells.y += y;
    if( cells.x >= 0 && cells.y >= 0 && cells.x < cellMap.length && cells.y < cellMap[cells.x].length) {
        return cellMap[cells.x][cells.y];
    }
}

function setCell(x, y, cell) {
    if(cell.number) {
        clueNumbers[cell.number] = cell;
    }

    gridContainer.addChild(cell);
    cell.x = Math.floor(x * cellSize.width)- canvasFix;
    cell.y = Math.floor(y * cellSize.height)- canvasFix;
    cell.scale(cellSize.width, cellSize.height);
    cellMap[x][y] = cell;
}

function renderClue(rightAway) {
    var number = selectedWord.number;
    var dir = selectedWord.across ? 'H' : 'V';

    if(screen.width >= 600){

        var timeout = rightAway ? 0 : 510;

        setTimeout(function(){
            $('#across_list li a').removeClass('clue_highlight');
            $('#down_list li a').removeClass('clue_highlight');
            var a = $('#clue_'+dir+'_'+(number) + ' a');
            a.addClass('clue_highlight');

            var selectedLi = $('#clue_'+dir+'_'+(number));

            var top = selectedLi.offset().top;

            var list;
            if(dir == 'H'){
                list = $('#across_list_ul');
            }else{
                list = $('#down_list_ul');
            }

            var firstTop = list.children(':first').offset().top;

            if(prevSelectectedLiId != selectedLi.attr('id')){
                list.parent().animate({
                    scrollTop: top-firstTop
                }, 'slow');
            }

            prevSelectectedLiId = selectedLi.attr('id');

        },timeout);
    }

}

function cellClicked(newCell){
    $('#key_interceptor').blur();
    var oldSelectedCell;

    if(selectedCell!=null) {
        selectedCell.setSelected(false);
        oldSelectedCell = selectedCell;
        oldSelectedCell.setSelected(false);
    }

    var horizontalCells = findWordCells.apply(this, [newCell, true]);
    var verticalCells = findWordCells.apply(this, [newCell, false]);
    var newCells;
    if(horizontalCells.length == 1 && verticalCells.length > 1) {
        horizontal = false;
    } else if(verticalCells.length == 1) {
        horizontal = true;
    } else {
        if(newCell == oldSelectedCell) {
            horizontal = ! horizontal;
        } else if(horizontalCells.length > 1 && verticalCells.length > 1){
            var horizontalLocation = horizontalCells.indexOf(newCell);
            var verticalLocation = verticalCells.indexOf(newCell);
            var horizontalSum = 0;
            var verticalSum = 0;

            if(horizontalLocation > 0 && horizontalCells[horizontalLocation - 1].letter){
                horizontalSum++;
            }
            if(horizontalLocation < horizontalCells.length - 1 && horizontalCells[horizontalLocation + 1].letter) {
                horizontalSum++;
            }
            if(verticalLocation > 0 && verticalCells[verticalLocation - 1].letter){
                verticalSum++;
            }
            if(verticalLocation < verticalCells.length - 1 && verticalCells[verticalLocation + 1].letter) {
                verticalSum++;
            }
            if(horizontalSum != verticalSum) {
                horizontal = horizontalSum < verticalSum;
            } else {
                horizontal = true;
            }
        }
    }

    if(horizontal) {
        newCells = horizontalCells;
    } else {
        newCells = verticalCells;
    }


    selectedCell = newCell;

    var number = newCells[0].number;
    oldSelectedCell = selectedCell;

    selectedWord = {number: number, across: horizontal}

    selectClue(selectedWord);

    if(screen.width >= 600){
        renderClue(true);
    }

    selectedCell.setSelected(false);
    selectedCell = oldSelectedCell;
    selectedCell.setSelected(true);
    gridContainer.parent.update();



    if(screen.width >= 600)
        triggerInput(selectedCell);
    else{
        //if (!$('#key_interceptor').is(":focus")) {
            showCluePopup();
        //}
    }
}


function showCluePopup(){

    $("#clue_number").text((selectedWord.number) + ', ' + (selectedWord.across ? puzzle.labels.across : puzzle.labels.down));
    var clueText = getClueByNumber(selectedWord);
    $("#clue_text").html(clueText);
    $('#header_clue').html(clueText);

    $('#modal2').openModal();

    $('.lean-overlay').click(function(){
        if($('#modal2').length){
            deselectWord();
        }
    });
}


function setEvents(){

    $('#btn_start').click(function (e) {
        e.preventDefault();

        startGame();

        timer.start();
        timer.addEventListener('secondsUpdated', function (e) {
            $('#chrono').html(timer.getTimeValues().toString());
        });

    });

    $('.modal-trigger').leanModal();

    $('#submit').click(function (e) {
        e.preventDefault();
        $('#modal2').closeModal();
        selectedCell.setSelected(true);

        //setTimeout(function () {
            triggerInput(selectedCells[0]);
        //}, 1000);
    });


    $('#reveal_letter').click(function (e) {

        $('#modal2').closeModal();

        setTimeout(function(){
            revealCurrentSquare(false);

            if(selectedCell){
                setTimeout(showCluePopup, 1000);
            }
        },500);

    });

    $('#reveal_word').click(function (e) {

        $('#modal2').closeModal();

        setTimeout(function(){
            revealCurrentWord(false);
        },500);
    });

    $('#btn_menu_check').click(function(){
        $('.fixed-action-btn').closeFAB();
        checkEntireGrid();
    });

     $('#btn_menu_reveal_letter').click(function (e) {
        revealCurrentSquare();
     });

    $('#btn_menu_reveal_word').click(function (e) {
        revealCurrentWord(true);
    });

    $('#btn_menu_clear').click(clearBoard);

    $('#btn_menu_reset_zoom').click(function(){
        $('.fixed-action-btn').closeFAB();
        resizeGrid(RESIZE_OPTION.RESET);
    });

    $("#reload").click(function (e) {
        e.preventDefault();
        location.reload();
    });

    $(window).resize(function () {
        if (!$('#key_interceptor').is(":focus")) {
            resizeGrid(RESIZE_OPTION.UNKNOWN);
        }
    });

    window.addEventListener("orientationchange", function() {
        resizeGrid(RESIZE_OPTION.UNKNOWN);

        orientationWarn();

    }, false);


    $('#key_interceptor').blur(function(){
        //deselectWord();
    });
}

function orientationWarn(){
    if(window.orientation && Math.abs(window.orientation) == 90 && $('#content').width() < 600){
        $('#rotate').show();
    }else{
        $('#rotate').hide();
    }
}

function triggerInput(selectedCell){
    if(selectedCell && supportsTouch()){
        var key_interceptor = document.getElementById('key_interceptor');
        key_interceptor.focus();
        key_interceptor.style.left = selectedCell.x + 'px';
        key_interceptor.style.top = selectedCell.y  + 'px';
    }
}

function getClueByNumber(w){

    var arr = w.across?acrossClues:downClues;
    for(var i=0;i<arr.length;i++){
        if(arr[i].number == w.number)
        return arr[i].clue;
    }

   /* for(var i=0;i<clues.length;i++){
        console.log(clues[i])
        if(clues[i].number ==n)
            return clues[i].clue;
    }*/
}

function setLetter(letter, focusNextCell){
    if(selectedCell) {
        selectedCell.setSelected(false);
        selectedCell.letter = letter;
        selectedCell.ripple();
        selectedCell.letterText.color = "#000";
        selectedCell.update();

        cacheCurrentGridState();

        var gameFinished = trackCorrectAnswers();

        if(!gameFinished){
            if(supportsTouch()){
                if(selectedCell == selectedCells[selectedCells.length-1]){
                    deselectWord();
                }else{
                    if(focusNextCell){
                        triggerInput(selectedCell);
                    }

                }
            }

            var number = selectedCells.indexOf(selectedCell);
            selectedCell = number < selectedCells.length - 1 ? selectedCells[number + 1] : selectedCell;
            if(selectedCell)
                selectedCell.setSelected(true);

            stage.update();

        }else{
            showSuccess();
        }

    }
}

function trackCorrectAnswers(){
    for(var i = 0; i < cellMap.length; i++) {
        for(var j = 0; j < cellMap[i].length; j++) {
            if(cellMap[i][j] && cellMap[i][j].letter != solvedState[i][j].letter.toUpperCase()){
                return false;
            }
        }
    }

    return true;
}


function getMobileKey(){

    var key_interceptor = document.getElementById('key_interceptor');

    $('#key_interceptor').on('keydown', function(e){

        var keyCode = e.keyCode;

        if(keyCode== 8 || keyCode==13 || keyCode==37 || keyCode== 38 || keyCode==39 || keyCode==40 || keyCode == 46){
            keydown(e);
            key_interceptor.value = '';
        }

    });


    $('#key_interceptor').on('keyup', function(e){

        var text = key_interceptor.value;
        key_interceptor.value = '';
        var letter = '';

        if(text.length>0){
            letter = text.charAt(text.length-1);
        }

        if(letter && letter.length>0){
            key_interceptor.value = '';
            letter = letter.toUpperCase();
            if (letter.match(new RegExp('['+puzzle.settings.alphabet+']','i'))) {
                setLetter(letter.toUpperCase(), true);
            }
        }

    });

}


function keypress(e){
    e = e || window.event;

    var letter = String.fromCharCode(e.charCode);

    if (letter.match(new RegExp('['+puzzle.settings.alphabet+']','i'))) {
        setLetter(letter.toUpperCase(), true);
    }
}


function keydown(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        directionKeyPressed({xdir: 0, ydir: -1})
    }
    else if (e.keyCode == '40') {
        directionKeyPressed({xdir: 0, ydir: 1});
    }
    else if (e.keyCode == '37') {
        directionKeyPressed({xdir: -1, ydir: 0})
    }
    else if (e.keyCode == '39') {
        directionKeyPressed({xdir: 1, ydir: 0});
    }
    else if(e.keyCode == '46'){
        deleteCurrentLetter();
    }
    else if(e.keyCode == '8'){
        e.preventDefault();
        backspace();

    }
    else if(e.keyCode == '13'){
        if(supportsTouch())
            deselectWord();
    }
}

function backspace(){
    selectedCell.setSelected(false);
    selectedCell.letter = ''
    selectedCell.update();
    var curNum = selectedCells.indexOf(selectedCell);
    selectedCell = curNum > 0 ? selectedCells[curNum - 1] : selectedCell;
    selectedCell.setSelected(true);
    gridContainer.parent.update();
    cacheCurrentGridState();
    triggerInput();
}

function deleteCurrentLetter(){
    selectedCell.letter = '';
    selectedCell.update();
    gridContainer.parent.update();
    cacheCurrentGridState();
}

function directionKeyPressed(data){
    var cell = findConsecutiveCell(selectedCell, data.xdir, data.ydir);
    if(cell){
        cell.onClick();
    }
}

function revealCurrentSquare(focusNextCell){
    setLetter(solvedState[selectedCell.gridX][selectedCell.gridY].letter.toUpperCase(), focusNextCell);
}

function deselectWord(){
    if(selectedCell)
        selectedCell.setSelected(false);

    for(var i=0;i<selectedCells.length;i++){
        selectedCells[i].highlight(false);
    }

    selectedCell = null;
    selectedCells = [];
    selectedWord = null;

    $('#across_list li a').removeClass('clue_highlight');
    $('#down_list li a').removeClass('clue_highlight');
    //if (!$('#key_interceptor').is(":focus")) {
        $('#key_interceptor').blur();
    //}

    $('#key_interceptor').css('left','-100px');
    $('#key_interceptor').css('top','-100px');

    stage.update();
    $('#header_clue').text('');
}

function revealCurrentWord(focusNextCell){

    selectedCell = selectedCells[0];

    for(var i=0;i<selectedCells.length;i++){
        var cell = selectedCells[i];
        var correctCell = solvedState[cell.gridX][cell.gridY];
        var letter = solvedState[selectedCell.gridX][selectedCell.gridY].letter.toUpperCase();
        setLetter(letter, focusNextCell);

    }

    if(screen.width<600){
        deselectWord();
    }
    stage.update();
}

function clearEntireGrid(){
    for (var x = 0; x < cellMap.length; x++) {
        for (var y = 0; y < cellMap[x].length; y++) {
            if (cellMap[x][y]) {
                cellMap[x][y].letter='';
                cellMap[x][y].showIncorrect(false);
                cellMap[x][y].update();
            }
        }
    }
    stage.update();
}

function checkEntireGrid() {
    for (var x = 0; x < cellMap.length; x++) {
        for (var y = 0; y < cellMap[x].length; y++) {
            if(cellMap[x][y])
                if (cellMap[x][y] && cellMap[x][y].letter != solvedState[x][y].letter.toUpperCase()) {
                    cellMap[x][y].showIncorrect(true);
                }else{
                    cellMap[x][y].showIncorrect(false);
                }
        }
    }
    stage.update()
}

function createEmptyCrosswordGrid(width, height) {
    var grid = [[]];
    for(var x = 0; x < width; x++) {
        grid[x] = new Array(height);
    }
    return grid;
}

function findClosestWord (x, y, right, down) {
    var nx = x + right;
    var nd = y + down;
    if(nx >= 0 && nd >= 0 && nx < solvedState.length && nd < solvedState[nx].length) {
        return solvedState[nx][nd];
    }
}

var rippleZIndex = 100;

function Cell(number, x, y){

    var c = new createjs.Container();

    for (var property in c) {
        this[property] = c[property];
    }


    this.gridX = x;
    this.gridY = y;
    this.mainBg = paint(puzzle.settings.letter_cell_color);

    this.addChild(this.mainBg);
    this.highlightBg = paint(puzzle.settings.cell_highlight_color);
    this.addChild(this.highlightBg);
    this.selectBg = paint(puzzle.settings.selected_cell_color);
    this.addChild(this.selectBg);
    this.highlightBg.visible = false;
    this.selectBg.visible = false;

    this.incorrectBg = paint(puzzle.settings.wrong_cell_color);
    this.addChild(this.incorrectBg);
    this.incorrectBg.visible=false;

    this.letter = '';
    this.letterText = new createjs.Text(this.letter, "bold 20px Arial", puzzle.settings.letter_color);

    this.letterText.align = "center";

    this.addChild(this.letterText);
    this.number = number;
    this.numberText = new createjs.Text(number, "36px Arial", puzzle.settings.number_color);
    this.numberText.align = "left";
    this.numberText.x = 0;
    this.addChild(this.numberText);


    var thisCell=this;

    this.onClick = function (e){
        console.log("click")
        $('.hint-box').removeClass('active')
        cellClicked(thisCell, e);
    }
    this.addEventListener("click", this.onClick, false);

    this.update = function() {
        this.letterText.text = this.letter;
        this.numberText.text = this.number;
        this.letterText.x = cellSize.width/2-this.letterText.getMeasuredWidth()/2;
    }

    this.highlight = function(on) {
        this.highlightBg.visible = on;
    }

    this.setSelected = function(on) {
        this.selectBg.visible = on;
    }

    this.scale = function(w, h) {
        this.numberText.x = w * 0.03;
        this.numberText.y = w * 0.03;
        //this.letterText.x = h * 0.3;
        this.letterText.y = h * 0.15;

        this.numberText.font = 'bold ' + (w / 3) + 'px Arial';
       this.letterText.font = 'bold ' + (w/1.7) + 'px Arial';
    }


    this.showIncorrect = function (show) {
        if (this.letterText.text) {
            this.incorrectBg.visible=show;

        }
    }

    this.ripple = function(){

        var tileId = 'tile_'+this.gridX+'_'+this.gridY;

        var cellWidth = (cellSize.width-1);
        var cellHeight = (cellSize.height-1);

        $('<div>',{
            id:tileId,
            class:'reveal_ripple',
            css:{
                'position':'absolute',
                'z-index':++rippleZIndex,
                'overflow':'hidden',
                'width':cellWidth+'px',
                'height':cellHeight+'px',
                'left':(this.x)+'px',
                'top':(this.y)+'px'
            }
        }).appendTo('#dragger');

        $('<a>',{
            id:tileId+'_a',
            href: '#',
            css:{
                'z-index':'10',
                'width':'100%',
                'height':'100%'
            }
        }).appendTo('#'+tileId);


        var element = $('#'+tileId+'_a');

        var parent = element.parent();

        if(parent.find(".tile_animator").length == 0)
            parent.prepend("<span class='tile_animator'></span>");

        parent.css('overflow','hidden');

        var tile_animator = parent.find(".tile_animator");
        tile_animator.removeClass("animate");
        tile_animator.css('overflow','hidden');

        if(!tile_animator.height() && !tile_animator.width()){
            var d = Math.max(parent.outerWidth(), parent.outerHeight());
            tile_animator.css({height: d, width: d});
        }


        var xPos = element.offset().left - parent.offset().left;
        var yPos = element.offset().top - parent.offset().top;

        tile_animator.css({top: yPos+'px', left: xPos+'px'}).addClass("animate");

        setTimeout(function(){
            $('#'+tileId).remove();
        },600);

    }

    function paint(color){
        var shape = new createjs.Shape();

        shape.graphics.beginFill(color);

        shape.graphics.snapToPixel = true;
        shape.graphics.drawRect(0, 0, cellSize.width, cellSize.height);
        shape.graphics.endFill();

        shape.graphics.setStrokeStyle(1)
        shape.graphics.beginStroke("#393939");
        shape.graphics.moveTo(0,0);
        shape.graphics.lineTo(0,cellSize.width);

        shape.graphics.moveTo(0,0);
        shape.graphics.lineTo(cellSize.width,0);
        shape.graphics.endStroke();

        return shape

    }
}

function jsonLoaded(data){
    puzzle = data;
    acrossClues = puzzle.acrossClues;
    downClues = puzzle.downClues;

    main();
}

function main() {

    setEvents();

    canvas = document.getElementById('crossword_canvas')
    board = $('#board');
    dragger = $('#dragger');

    solvedState = createSolvedCrosswordGrid();
    setCrosswordNumbers();
    createCrosswordGrid();
    setupClueLists();
    doInitialSelection()
    setupGameMenu();
    setLabels();


    if(supportsTouch()){
        $('#key_interceptor').attr('autocorrect','off');
        $('#key_interceptor').attr('autocomplete','off');
        $('#key_interceptor').attr('autocapitalize','none');
    }


    $('#loader').hide();
    $('#intro').show();

    if(supportsTouch()){
        getMobileKey();
    }else{
        $('#key_interceptor').hide();
        document.onkeydown = keydown;
        document.onkeypress = keypress;
    }

    orientationWarn();

    if (supportsTouch()) {
        setTimeout(function () {
            new iScroll('board', {zoom: true})
        }, 5000);

    }


};


$(document).ready(loadJsonFile);


function loadJsonFile(){
    $.getJSON("data.json?r="+Math.random())
        .done(jsonLoaded)
        .fail(function() {
            alert('failed to load json');
        });
}
