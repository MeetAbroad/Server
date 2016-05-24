(function() {
    var app = angular.module('MeetAbroad');

	app.controller('HomeController', ['$scope', '$http', 'auth', 'user', '$state', function($scope, $http, auth, user, $state) {
		
		// User did not complete registration
		if(user.destinationcity === '__undefined__')
		{
			$state.go('finishreg');
		}
	
		$scope.searchForm = true;
		$scope.searchResults = false;
		$scope.searchLoading = false;
		
		$scope.selected = {};
		$scope.search = {};
		$scope.adsearch = {display: false};
			
		$http.get('/interests', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(response){
			data = response.data;
			
			$scope.interests = data;
		});
		
		$scope.user = user;
		
		$scope.doSearch = function(){
			
			$scope.error = null;
			$scope.results = [];
			$scope.searchForm = false;
			$scope.searchLoading = true;
			
			if($scope.adsearch.display == true)
			{
				$scope.search = angular.extend({}, $scope.search, $scope.adsearch);
				
				// Advanced search
				$http.post('/search/advanced', $scope.search, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).then(function successCallback(response){
					data = response.data;
					
					if(data.length == 0)
					{
						$scope.searchResults = false;
						$scope.searchLoading = false;
						$scope.searchForm = true;
						
						$scope.error = { message: "No results found." };
						
						jQuery(document).ready(function(){
							// Scroll to top by default
							jQuery('html, body').animate({
							  scrollTop: 0
							});
						});
					}
					else
					{
						$scope.results = data;
						
						$scope.searchLoading = false;
						$scope.searchResults = true;
						
						jQuery(document).ready(function(){
							// Scroll to top by default
							jQuery('html, body').animate({
							  scrollTop: 0
							});
						});
					}
					
				}, function errorCallback(response){
					data = response.data;
					$scope.error = { message: data };

					jQuery(document).ready(function(){
						// Scroll to top by default
						jQuery('html, body').animate({
						  scrollTop: 0
						});
					});
					
					$scope.searchResults = false;
					$scope.searchLoading = false;
					$scope.searchForm = true;
				});
			}
			else
			{
				// Basic
				$http.post('/search/basic', $scope.search, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).then(function successCallback(response){
					data = response.data;
					
					if(data.length == 0)
					{
						$scope.searchResults = false;
						$scope.searchLoading = false;
						$scope.searchForm = true;
						
						$scope.error = { message: "No results found." };
						
						jQuery(document).ready(function(){
							// Scroll to top by default
							jQuery('html, body').animate({
							  scrollTop: 0
							});
						});
					}
					else
					{
						$scope.results = data;
						
						$scope.searchLoading = false;
						$scope.searchResults = true;
						
						jQuery(document).ready(function(){
							// Scroll to top by default
							jQuery('html, body').animate({
							  scrollTop: 0
							});
						});
					}
					
				}, function errorCallback(response){
					data = response.data;
					$scope.error = { message: data };

					jQuery(document).ready(function(){
						// Scroll to top by default
						jQuery('html, body').animate({
						  scrollTop: 0
						});
					});
					
					$scope.searchResults = false;
					$scope.searchLoading = false;
					$scope.searchForm = true;
				});
			}
		};
		
		$scope.resetSearch = function(){
			$scope.error = null;
			$scope.searchResults = false;
			$scope.searchLoading = false;
			$scope.searchForm = true;
			$scope.results = [];
			
			jQuery(document).ready(function(){
				// Scroll to top by default
				jQuery('html, body').animate({
				  scrollTop: 0
				});
			});
		};
    }]);
})();