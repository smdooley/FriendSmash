var friendCache = {
    me: {},
    reRequests: {}
};

function login(callback) {
    FB.login(callback, { scope: 'user_friends' });
}

function loginCallback(response) {
    console.log('loginCallback', response);
    if (response.status != 'connected') {
        top.location.href = 'https://www.facebook.com/appcenter/friendsmashsmd';
    }
}

function onStatusChange(response) {
    if (response.status != 'connected') {
        login(loginCallback);
    } else {
        getMe(function () {
            getPermissions(function () {
                if (hasPermission('user_friends')) {
                    getFriends(function () {
                        renderWelcome();
                        onLeaderboard();
                        showHome();
                    });
                } else {
                    renderWelcome();
                    showHome();
                }
            });
        });
    }
}

function onAuthResponseChange(response) {
    console.log('onAuthResponseChange', response);
}

function getMe(callback) {
    FB.api('/me', { fields: 'id,name,first_name,picture.width(120).height(120)' }, function (response) {
        if (!response.error) {
            friendCache.me = response;
            callback();
        } else {
            console.error('/me', response);
        }
    });
}

function onStatusChange(response) {
    if (response.status != 'connected') {
        login(loginCallback);
    } else {
        getMe(function () {
            renderWelcome();
            showHome();
        });
    }
}

function getFriends(callback) {
    FB.api('/me/friends', { fields: 'id,name,first_name,picture.width(120).height(120)' }, function (response) {
        if (!response.error) {
            friendCache.friends = response;
            callback();
        } else {
            console.error('/me/friends', response);
        }
    });
}

function getPermissions(callback) {
    FB.api('/me/permissions', function (response) {
        if (!response.error) {
            friendCache.permissions = response;
            callback();
        } else {
            console.error('/me/permissions', response);
        }
    });
}

function hasPermission(permission) {
    for (var i in friendCache.permissions) {
        if (
      friendCache.permissions[i].permission == permission
      && friendCache.permissions[i].status == 'granted')
            return true;
    }
    return false;
}

function reRequest(scope, callback) {
    FB.login(callback, { scope: scope, auth_type: 'rerequest' });
}

function sendChallenge(to, message, callback) {
    var options = {
        method: 'apprequests'
    };
    if (to) options.to = to;
    if (message) options.message = message;
    FB.ui(options, function (response) {
        if (callback) callback(response);
    });
}