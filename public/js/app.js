(function() {
    var app = angular.module('MeetAbroad', ['ui.router']);

    app.config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('index', {
                    url: '/index',
                    templateUrl: './index-guest.html',
                    controller: 'GuestController'
                })
                .state('login', {
                    url: '/login',
                    templateUrl: './login.html',
                    controller: 'GuestController',
                })
                .state('register', {
                    url: '/register',
                    templateUrl: './register.html',
                    controller: 'GuestController',
                })
                .state('interests', {
                    url: '/interests',
                    templateUrl: './interests.html',
                    controller: 'UserController',
                });

            $urlRouterProvider.otherwise('index');
        }
    ]);

    app.controller('HomeController', ['$scope', '$http', function($scope, $http) {

    }]);

    app.controller('GuestController', ['$scope', '$http', function($scope, $http) {

    }]);

    app.controller('UserController', ['$scope', '$http', function($scope, $http) {
        $http.get('http://localhost:3000/interests').success(function(data){ // This needs to be modified depending on the server
            $scope.interests = data;
        })
    }]);
})();