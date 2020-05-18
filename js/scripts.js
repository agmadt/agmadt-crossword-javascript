$(document).ready(function() {

    // Start game button
    $('.start-button').click(function() {
        $('#crossword').removeClass('intro');
        $('#crossword-intro').hide();

        timer.start();
        timer.addEventListener('secondsUpdated', function (e) {
            $('#chrono').html(timer.getTimeValues().toString());
        });
        
        centerBoard();
        if (!supportsTouch()){
            canvas.addEventListener('mousedown', canvasMouseDown, false);
            canvas.addEventListener('mouseup', canvasMouseUp, false);
            canvas.addEventListener('mousemove', canvasMouseMove, false);
    
            dragger[0].onmousewheel = mouseScrolled;
            dragger[0].addEventListener('DOMMouseScroll', mouseScrolled, false);
        }
    });

    // Reset board button
    $('.reset-board-button').click(function() {

        if ($('#crossword').hasClass('intro')) {
            return;
        }

        $('.hint-box').removeClass('active');
        $('.word-check').removeClass('active');
        $('.word-setting').removeClass('active');

        $('#clear_title').html(puzzle.labels.clear_dialog_title);
        $('#clear_warning').html(puzzle.labels.clear_dialog_text);

        $('#modal4').openModal();

        $('#btn-yes').click(function(){
            clearEntireGrid();
            deselectWord();
            currentCache = [];
            selectFirstWord();
        });
    });

    // Timer button
    $('.timer-button').click(function() {
        if (!$(this).hasClass('paused')) {
            timer.pause();
            $(this).addClass('paused');
            $('.pause').addClass('active');
        }
    });

    // Continue paused game button
    $('.pause-continue-button').click(function() {
        timer.start();
        $('.timer-button').removeClass('paused');
        $('.pause').removeClass('active');
    })

    // Surrender paused game button
    $('.pause-surrender-button').click(function() {
        $('.timer-button').removeClass('paused');
        $('.pause').removeClass('active');

        $('#crossword').addClass('outro');

        $('.score-box__time .time').html(timer.getTimeValues().toString(['minutes', 'seconds']));
    })

    // Surrender paused game button
    $('.play-again-button').click(function() {
        $('#crossword').removeClass('outro');
        $('#crossword').addClass('intro');
        $('#crossword-intro').show();
    })

    // Word check dropdown function
    $('.word-check > .crossword-button').click(function(ev) {
        if ($('.word-check').hasClass('active')) {
            $('.word-check').removeClass('active');
        } else {
            $('.word-check').addClass('active');
        }

        $('.word-setting').removeClass('active');
    })

    // Check word button
    $('.check-word').click(function() {
        checkEntireGrid();
        $('.word-check').removeClass('active');
    })

    // Solve word button
    $('.solve-word').click(function() {
        revealCurrentWord(true);
        $('.word-check').removeClass('active');
    })

    $('.word-hint').click(function() {
        revealCurrentSquare();

        var correctFirstLetterOfCell = solvedState[selectedCells[0].gridX][selectedCells[0].gridY]
        var correctLastLetterOfCell = solvedState[selectedCells[selectedCells.length - 1].gridX][selectedCells[selectedCells.length - 1].gridY]

        $('.hint-first-letter').html(correctFirstLetterOfCell.letter)
        $('.hint-last-letter').html(correctLastLetterOfCell.letter)
        $('.hint-box').addClass('active');
    })

    $('.word-setting').click(function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
        }

        $('.word-check').removeClass('active');
    })

    tippy('.tippy');
    tippy('.tippy-left', {
        placement: 'left'
    });
    tippy('.tippy-right', {
        placement: 'right'
    });
    tippy('.tippy-bottom', {
        placement: 'bottom'
    });
});