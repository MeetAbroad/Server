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
                    controller: 'GuestController'
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
                    controller: 'UserController'
                })
                .state('interests', {
                    url: '/interests',
                    templateUrl: 'interests/interests.html',
                    controller: 'UserController',
                });

            $urlRouterProvider.otherwise('index');
        }
    ]);
	
	app.factory('auth', ['$http', '$window', function($http, $window){
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

				console.log(payload);
				
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
		};

		return auth;
	}]);

    app.controller('HomeController', ['$scope', '$http', function($scope, $http) {

    }]);

    app.controller('UserController', ['$scope', '$http', function($scope, $http) {
        $http.get('http://localhost:3000/interests').success(function(data){ // This needs to be modified depending on the server
            $scope.interests = data;
        })
    }]);
	
	
	app.controller('AuthCtrl', ['$scope', '$state', 'auth', function($scope, $state, auth){
		$scope.user = {};

		$scope.register = function(){
			auth.register($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};

		$scope.logIn = function(){
			auth.logIn($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};
	}]);

	app.controller('NavCtrl', ['$scope', 'auth', function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}]);
})();