(function() {
    var app = angular.module('MeetAbroad', ['ui.router']);

    app.config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $stateProvider
				/* Guest index */
                .state('index', {
                    url: '/index',
                    templateUrl: 'index/index-guest.html',
					onEnter: ['$state', 'auth', function($state, auth){
						if(auth.isLoggedIn()){
							$state.go('home');
						}
					}]
                })
				/* Auth */
                .state('login', {
					url: '/login',
					templateUrl: '/auth/login.html',
					controller: 'AuthCtrl',
					onEnter: ['$state', 'auth', function($state, auth){
						if(auth.isLoggedIn()){
							$state.go('home');
						}
					}]
				})
				.state('register', {
					url: '/register',
					templateUrl: '/auth/register.html',
					controller: 'AuthCtrl',
					onEnter: ['$state', 'auth', function($state, auth){
						if(auth.isLoggedIn()){
							$state.go('home');
						}
					}]
				})
				/* Logged in pages below */
				.state('home', {
                    url: '/index',
                    templateUrl: 'index/index-user.html',
                    controller: 'HomeController',
					onEnter: ['$state', 'auth', function($state, auth){
						if(!auth.isLoggedIn()){
							$state.go('index');
						}
					}]
                })
                .state('interests', {
                    url: '/interests',
                    templateUrl: 'interests/interests.html',
                    controller: 'UserController',
					onEnter: ['$state', 'auth', function($state, auth){
						if(!auth.isLoggedIn()){
							$state.go('index');
						}
					}]
                })
				.state('options', {
                    url: '/options',
                    templateUrl: 'user/options.html',
                    controller: 'UserController',
					onEnter: ['$state', 'auth', function($state, auth){
						if(!auth.isLoggedIn()){
							$state.go('index');
						}
					}]
                });

            $urlRouterProvider.otherwise('index');
        }
    ]);
	
	app.factory('auth', ['$http', '$window', '$location', function($http, $window, $location){
		var auth = {};

		auth.saveToken = function (token){
			$window.localStorage['meetabroad-token'] = token;
		};

		auth.getToken = function (){
			return $window.localStorage['meetabroad-token'];
		}

		auth.isLoggedIn = function(){
			var token = auth.getToken();

			if(token){
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.exp > Date.now() / 1000;
			} else {
				return false;
			}
		};

		auth.currentUser = function(){
			if(auth.isLoggedIn()) {
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.email;
			}
		};

		auth.register = function(user){
			return $http.post('/register', user).success(function(data){
				auth.saveToken(data.token);
			});
		};

		auth.logIn = function(user){
			return $http.post('/login', user).success(function(data){
				auth.saveToken(data.token);
			});
		};

		auth.logOut = function(){
			$window.localStorage.removeItem('meetabroad-token');
			
			$location.path('/');
		};

		return auth;
	}]);
})();