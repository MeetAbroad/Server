(function() {
    var app = angular.module('MeetAbroad');

    app.directive("userNavigation", function() {
        return {
            restrict: 'E',
            templateUrl: "common/user-navigation.html"
        };
    });

    app.directive("guestNavigation", function() {
        return {
            restrict: 'E',
            templateUrl: "common/guest-navigation.html"
        };
    });
	
	app.directive("scroll", function() {
        return {
            restrict: 'E',
            templateUrl: "common/scroll.html"
        };
    });
	
	app.directive("suggestions", function() {
        return {
            restrict: 'E',
            templateUrl: "suggestions/block.html"
        };
    });
	
	app.directive("unreadNotifications", function() {
        return {
            restrict: 'E',
            templateUrl: "common/notifications.html"
        };
    });
})();