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
					}],
					resolve: { // Resolve the 'user' object -> this runs BEFORE the 'onEnter' so we must check when returning, if we are authenticated (otherwise we won't be able to get the current user due to undefined token)
						user: ['$stateParams', '$http', 'auth', function($stateParams, $http, auth) {
							
							function getUser() {
								return $http.get('/users/' + auth.currentUser(), {
									headers: {Authorization: 'Bearer '+auth.getToken()}
								}).then(function(res){
									return res.data;
								});
							};
							
							if(auth.isLoggedIn())
								return getUser();
							else
								return false;
						}]
					}
                })
                .state('interests', {
                    url: '/interests',
                    templateUrl: 'interests/interests.html',
                    controller: 'UserController',
					onEnter: ['$state', 'auth', function($state, auth){
						if(!auth.isLoggedIn()){
							$state.go('index');
						}
					}],
					resolve: { // Resolve the 'user' object
						user: ['$stateParams', '$http', 'auth', function($stateParams, $http, auth) {
							
							function getUser() {
								return $http.get('/users/' + auth.currentUser(), {
									headers: {Authorization: 'Bearer '+auth.getToken()}
								}).then(function(res){
									return res.data;
								});
							};
							
							if(auth.isLoggedIn())
								return getUser();
							else
								return false;
						}]
					}
                })
				.state('options', {
                    url: '/options',
                    templateUrl: 'user/options.html',
                    controller: 'UserController',
					onEnter: ['$state', 'auth', function($state, auth){
						if(!auth.isLoggedIn()){
							$state.go('index');
						}
					}],
					resolve: { // Resolve the 'user' object
						user: ['$stateParams', '$http', 'auth', function($stateParams, $http, auth) {
							
							function getUser() {
								return $http.get('/users/' + auth.currentUser(), {
									headers: {Authorization: 'Bearer '+auth.getToken()}
								}).then(function(res){
									return res.data;
								});
							};
							
							if(auth.isLoggedIn())
								return getUser();
							else
								return false;
						}]
					}
                })
				.state('profile', {
					url: '/profile/{id}',
					templateUrl: 'user/profile.html',
					controller: 'ProfileController',
					onEnter: ['$state', 'auth', function($state, auth){
						if(!auth.isLoggedIn()){
							$state.go('index');
						}
					}],
					resolve: { // Resolve the 'user' object
						profile: ['$stateParams', '$http', function($stateParams, $http) {
							
							function getUser(id) {
								return $http.get('/users/profile/' + id).then(function(res){
									return res.data;
								});
							};
							
							return getUser($stateParams.id);
						}]
					}
				})
				.state('notifications', {
					url: '/notifications',
					templateUrl: 'user/notifications.html',
					controller: 'NotificationsController',
					onEnter: ['$state', 'auth', function($state, auth){
						if(!auth.isLoggedIn()){
							$state.go('index');
						}
					}],
					resolve: { // Resolve the 'user' object
						user: ['$stateParams', '$http', 'auth', function($stateParams, $http, auth) {
							
							function getUser() {
								return $http.get('/users/' + auth.currentUser(), {
									headers: {Authorization: 'Bearer '+auth.getToken()}
								}).then(function(res){
									return res.data;
								});
							};
							
							if(auth.isLoggedIn())
								return getUser();
							else
								return false;
						}]
					}
				})
				.state('finishreg', {
					url: '/finishreg',
					templateUrl: 'auth/finishreg.html',
					controller: 'FinishregController',
					onEnter: ['$state', 'auth', function($state, auth){
						if(!auth.isLoggedIn()){
							$state.go('index');
						}
					}],
					resolve: { // Resolve the 'user' object
						user: ['$stateParams', '$http', 'auth', function($stateParams, $http, auth) {
							
							function getUser() {
								return $http.get('/users/' + auth.currentUser(), {
									headers: {Authorization: 'Bearer '+auth.getToken()}
								}).then(function(res){
									return res.data;
								});
							};

							if(auth.isLoggedIn())
								return getUser();
							else
								return false;
						}]
					}
				})
				// Used to get JWT from Facebook authentication method 
				.state('facebook', {
					url: '/facebook/{token}',
					templateUrl: 'auth/facebook.html',
					controller: 'FacebookController',
					onEnter: ['$stateParams', '$state', 'auth', '$window', function($stateParams, $state, auth, $window){
						
						if(!auth.isLoggedIn()) {
							
							// Then we're probably trying to log in!
							var token = $stateParams.token;
							
							if(token !== 'undefined' && token.length > 0)
								auth.saveToken(token);
								
							$window.location.reload(); // After this reload, we should be on this same page, with log in done
						}
						else
						{
							// We're on this page...logged in -> Let the FacebookController handle it!
						}
					}],
					resolve: { // Resolve the 'user' object
						user: ['$stateParams', '$http', 'auth', function($stateParams, $http, auth) {
							
							function getUser() {
								return $http.get('/users/' + auth.currentUser(), {
									headers: {Authorization: 'Bearer '+auth.getToken()}
								}).then(function(res){
									return res.data;
								});
							};
							
							if(auth.isLoggedIn())
								return getUser();
							else
								return false;
						}]
					}
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
		
		auth.getUser = function(){
			return $http.get('/users/'+auth.currentUser(), {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			});
		};

		return auth;
	}]);
})();