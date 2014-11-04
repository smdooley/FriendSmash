var CONFIRM_YES = 1, CONFIRM_NO = 0;

function showConfirmationPopup(message, callback) {
    var c = confirm(message);
    if (c) {
        callback(CONFIRM_YES);
    } else {
        callback(CONFIRM_NO);
    }
}

function onPlay() {
    // Player hasn't granted user_friends and hasn't been re-asked this session
    if (!hasPermission('user_friends')
    && !friendCache.reRequests['user_friends']) {

        showConfirmationPopup('Wanna play with friends?', function (response) {

            // Record that user has been re-asked this session
            friendCache.reRequests['user_friends'] = true;

            if (response == CONFIRM_YES) {
                // Ask for permisisons again, check if granted, 
                // refresh permissions, get friends, 
                // try playing again
                reRequest('user_friends', function () {
                    getPermissions(function () {
                        getFriends(function () {
                            onPlay();
                        });
                    });
                });
            } else {
                // User said no, try playing again
                onPlay();
            }
        });
    } else {

        // Player has friend permissions, or hasn't granted it
        // Either way, play against a friend if there are friends, otherwise play against a celebrity
        var challenger = {};
        var player = {
            bombs: 5
        };
        //if (friendCache.friends.length > 0) {
        if (friendCache.friends && friendCache.friends.length > 0) {
            var randomFriend = Math.floor(getRandom(0, friendCache.friends.length));
            challenger = {
                id: friendCache.friends[randomFriend].id.toString(),
                picture: friendCache.friends[randomFriend].picture.data.url,
                name: friendCache.friends[randomFriend].first_name
            };
        } else {
            var nCelebToSpawn = Math.floor(getRandom(0, celebs.length));
            challenger = {
                picture: celebs[nCelebToSpawn].picture,
                name: celebs[nCelebToSpawn].name
            };
        }
        showStage();
        updateChallenger(challenger);
        initGame(player, challenger, $('#canvas'), updateGameStats, onGameEnd);
    }
}

function showGameOver() {
    $('section').addClass('hidden');
    $('#gameover').removeClass('hidden');
}

function onGameEnd(gameState) {
    console.log('Game ended', gameState);
    showGameOver();
}

function showStage() {
    $('section').addClass('hidden');
    $('#stage').removeClass('hidden');
}

function showHome() {
    $('section').addClass('hidden');
    $('#home').removeClass('hidden');
}

function updatePlayerUI() {
    console.error('updatePlayerUI');
}

function displayMenu() {
    console.error('displayMenu');
}

function showPopUp() {
    console.error('showPopUp');
}

function updateChallenger(challenger) {
    var gameStats = $('#gamestats');
    gameStats.find('.profile').attr('src', challenger.picture);
    gameStats.find('.name').html(challenger.name);

    var gameOverScreen = $('#gameover');
    gameOverScreen.find('.profile').attr('src', challenger.picture);
    gameOverScreen.find('.name').html(challenger.name);
    gameOverScreen.find('button.challenge').attr('data-id', challenger.id);
    gameOverScreen.find('button.brag').attr('data-id', challenger.id);
}

function updateGameStats(gameState) {
    var numberClasses = ['none', 'one', 'two', 'three'];
    var gameStats = $('#gamestats');
    gameStats.find('.score_value').html(gameState.score);
    gameStats.find('.bombs').removeClass('none one two three').addClass(numberClasses[gameState.bombs]);
    gameStats.find('.lives').removeClass('none one two three').addClass(numberClasses[gameState.lives]);

    var gameOverScreen = $('#gameover');
    gameOverScreen.find('.score').html(gameState.score);
    gameOverScreen.find('.coins').html(gameState.coinsCollected);
    gameOverScreen.find('.coins_plurality').html(gameState.coinsCollected == 1 ? 'coin' : 'coins');
    gameOverScreen.find('button.brag').attr('data-score', gameState.score);
}

function onGameOverClose() {
    showHome();
}

function renderWelcome() {
    var welcome = $('#welcome');
    welcome.find('.first_name').html(friendCache.me.first_name);
    welcome.find('.profile').attr('src', friendCache.me.picture.data.url);
}

function onChallenge() {
    sendChallenge(null, 'Friend Smash is great fun! Come and check it out!', function (response) {
        console.log('sendChallenge', response);
    });
}